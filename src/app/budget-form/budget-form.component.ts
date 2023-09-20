import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { BudgetListComponent } from '../budget-list/budget-list.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ExpenseService } from '../expense.service';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css'],
  providers: [ConfirmationService, MessageService],
})

export class BudgetFormComponent implements OnInit {
  @ViewChildren(BudgetListComponent) childComponents!: QueryList<BudgetListComponent>;
  userProfile: FormGroup;
  submittedData: any[] = [];
  editIndex: number = -1;
  selectedRows: any[] = [];
  sortBy: any = 'id';
  sortOrder: any = 'desc';
  currentPage = 1;
  limit: number = 5;
  totalRows = 0;
  totalPages = 0;
  searchQuery: string = '';
  budgetId !: number;

  constructor(private formBuilder: FormBuilder,
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) {
    this.userProfile = this.formBuilder.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      on_date: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getBudgets();
  }


  getBudgets() {
    this.budgetService.getAllBudget(this.currentPage, this.limit, this.sortBy, this.sortOrder, this.searchQuery).subscribe(
      (user: any) => {
        this.submittedData = user.data
        this.totalRows = user.totalRows;
        this.totalPages = Math.ceil(this.totalRows / this.limit);
      },
      (error) => {
        console.error('Error in fetching the data', error);
      }
    );
  }

  onSubmit() {
    if (this.userProfile.valid) {
      if (this.editIndex === -1) {
        const newBudget = { ...this.userProfile.value };
        this.budgetService.createBudget(newBudget).subscribe(
          (response) => {
            this.getBudgets();
            this.messageService.add({
              severity: 'success', summary: 'Success', detail: 'Budget Added Successfully!'
            })
            this.userProfile.reset();
          },
          (error) => {
            console.error('Error Occurred While Creating a Budget', error);
          }
        );
      } else {
        const updatedBudget = { ...this.userProfile.value };
        const userId = this.editIndex;
        this.budgetService.updateBudget(userId, updatedBudget).subscribe(
          () => {
            this.getBudgets();
            this.messageService.add({
              severity: 'success', summary: 'Update Completed', detail: 'Budget Updated Successfully!'
            })
            this.userProfile.reset();
            this.editIndex = -1;
          },
          (error) => {
            console.error('Error updating Budget', error);
          }
        );
      }
    }
  }

  edit(rowId: number) {
    this.editIndex = rowId;
    this.budgetService.getBudgetById(rowId).subscribe(
      (user: any) => {
        this.userProfile.setValue({
          name: user.name,
          amount: user.amount,
          on_date: user.on_date,
        });
        this.getBudgets()
      },
      (error) => {
        console.error('Error fetching budget details', error);
      }
    );
  }

  updateSelectedRows(rows: any) {
    this.selectedRows = rows;
  }

  remove(userId: number) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.budgetService.deleteBudget(userId).subscribe(
          () => {
           
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: 'Record deleted',
            });
            if (this.submittedData.length === 1 && this.currentPage > 1) {
              this.currentPage = this.currentPage - 1;
            }
            this.getBudgets();
          },
          (error) => {
            console.error('Error deleting user', error);
          }
        );
      },
    })
  }

  deleteSelectedBudget() {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
    const selectedUserIds = this.selectedRows.map(row => row.id);
    this.budgetService.deleteSelectedBudget(selectedUserIds).subscribe(
      (response:any) => {
        const remainingData = this.submittedData.filter(user => !selectedUserIds.includes(user.id));
        this.selectedRows = [];
        this.childComponents.forEach(child => {
          child.selectAll = false;
        });
        if (remainingData.length === 0 && this.currentPage > 1) {
          this.currentPage -= 1;
          this.getBudgets();
        }
        this.messageService.add({ severity: 'success', 
        summary: 'Confirmed', 
        detail: `${response.message}` 
      });
        this.getBudgets();
      },
      (error) => {
        console.error('Error deleting selected rows', error);
      }
      );
    },
  })
}


  closeBudgetStatus(values: any) {
    console.log(values);
    this.expenseService.getAllExpenseByBudgetId(values.id, 1, 5, "", "", "").subscribe(
      (expenses: any) => {
        if (expenses.data.length > 0) {
          const status = values.status == 'Open' ? 'Close' : 'Open';
          this.budgetService.budgetStatus(values.id, status).subscribe((user: any) => {
            this.getBudgets();
            this.messageService.add({
              severity: 'success', summary: 'Success', detail: `budget is ${status}`
            })
          },
          );
        } else {
          this.messageService.add({
            severity: 'error', summary: 'No Expense', detail: 'There are no expenses in this budget, so it cannot be closed.'
          })
        }
      },
      (error) => {
        console.error('Error fetching in expense data', error)
      }
    )
  }

  numbers(event: any) {
    const keycode = event.keycode || event.which;
    const keyValue = String.fromCharCode(keycode);
    if (!/^\d+$/.test(keyValue) && keycode !== 8) {
      event.preventDefault();
    }
  }

  onSort(sortParams: any) {
    this.sortBy = sortParams.sortBy
    this.sortOrder = sortParams.sortOrder;
    this.getBudgets();
  }

  onPageChange(pageEvent: any) {
    this.limit = pageEvent.tableRow;
    this.currentPage = pageEvent.page
    this.getBudgets();
  }

  search(searchQuery: string) {
    this.searchQuery = searchQuery;
    this.currentPage = 1;
    this.getBudgets()
  }
  reset() {
    this.submittedData = [];
    this.editIndex = -1;
    this.searchQuery = '';
    this.userProfile.reset();
    this.getBudgets()
  }
}



