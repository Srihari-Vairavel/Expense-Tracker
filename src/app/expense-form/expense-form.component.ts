import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'
import { ExpenseService } from '../expense.service';
import { ExpenseListComponent } from '../expense-list/expense-list.component';
import { BudgetService } from '../budget.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css'],
  providers: [ConfirmationService, MessageService],

})
export class ExpenseFormComponent implements OnInit {
  @ViewChildren(ExpenseListComponent) childComponents!: QueryList<ExpenseListComponent>;

  expenseProfile: FormGroup;
  data: any = [];
  selectedRows: any[] = [];
  editIndex: number = -1;
  newExpense: any = {}
  budgetId: number = 0;
  searchQuery: string = '';
  sortBy: string = 'expense_id';
  sortOrder: string = 'desc';
  currentPage = 1;
  limit = 5;
  totalRows = 0;
  totalPages = 0;
  budgetStatus: string = '';
  totalBudget: number = 0;
  totalAmountSpent: number = 500;
  remainingBalance: number = 0;
  budgetExceeded: boolean = false;
  budgetExceededMessage: string = 'Budget Exceeded!';


  constructor(private formBuilder: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private budgetService: BudgetService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) {
    this.expenseProfile = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.budgetId = parseInt(params['id']);
      this.getDataExpense();
      this.getDataByBudgetId();
    });
  }


  getDataExpense() {
    this.budgetService.getBudgetById(this.budgetId).subscribe((response: any) => {
      this.budgetStatus = response.status;
      this.totalBudget = response.amount;
    }
    )
  }

  getDataByBudgetId() {
    this.expenseService.getAllExpenseByBudgetId(this.budgetId, this.currentPage, this.limit, this.sortBy, this.sortOrder, this.searchQuery).subscribe((response) => {
      this.data = response.data;
      this.totalRows = response.totalRows;
      this.totalPages = response.totalPages;
      this.totalAmountSpent = response.totalAmountSpent;
      this.remainingBalance = this.totalBudget - this.totalAmountSpent
    },
      (error: any) => {
        console.error('error fetching in data by id', error);
      }
    )
  }

  showBudgetExceeded() {
    this.messageService.add({
      severity: 'warn', summary: 'Limit Exceeded Warning', detail: 'Your Budget is Exceeded!'
    })
  }
  onSubmit() {
    if (this.expenseProfile.valid) {
      const newAmount = this.expenseProfile.value.amount;
      if (this.remainingBalance < newAmount) {
        this.showBudgetExceeded()
      } else {
        if (this.editIndex === -1) {
          this.newExpense = { ...this.expenseProfile.value }
          this.newExpense.budget_id = this.budgetId
          this.expenseService.createExpense(this.newExpense).subscribe(
            () => {
              this.getDataByBudgetId();
              this.messageService.add({
                severity: 'success', summary: 'Success', detail: 'Expense Created Successfully!'
              })
              this.expenseProfile.reset();
            },
            (error) => {
              console.error('Error Occurred While Creating a Budget', error);
            }
          );
        } else {
          const updatedExpense = { ...this.expenseProfile.value };
          const userId = this.editIndex;
          this.expenseService.updateExpense(userId, updatedExpense).subscribe(
            () => {
              this.getDataByBudgetId();
              this.messageService.add({
                severity: 'success', summary: 'Update Completed', detail: 'Expense Updated Successfully!'
              })
              this.expenseProfile.reset();
              this.editIndex = -1;
            },
            (error) => {
              console.error('Error updating Budget', error);
            }
          );
        }
      }
    }
  }

  edit(userId: number) {
    this.editIndex = userId;
    this.expenseService.getSingleExpenseByBudgetId(this.budgetId, userId).subscribe(
      (user: any) => {
        this.expenseProfile.setValue({
          name: user[0].name,
          amount: user[0].amount
        });
      },
      (error) => {
        console.error('Error fetching budget details', error);
      }
    );
  }

  numbers(event: any) {
    const keycode = event.keycode || event.which;
    const keyValue = String.fromCharCode(keycode);
    if (!/^\d+$/.test(keyValue) && keycode !== 8) {
      event.preventDefault();
    }
  }
  search(searchQuery: string) {
    this.searchQuery = searchQuery;
    this.currentPage = 1;
    this.getDataByBudgetId();
  }

  updateSorting(sortParams: { sortBy: string, sortOrder: string }) {
    this.sortBy = sortParams.sortBy;
    this.sortOrder = sortParams.sortOrder;
    this.getDataByBudgetId();
  }

  onPageChange(pageEvent: any) {
    this.limit = pageEvent.tableRow;
    this.currentPage = pageEvent.page
    this.getDataByBudgetId();
  }

  remove(userId: number) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.expenseService.deleteExpense(userId).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: 'Record deleted'
            });
            if (this.data.length === 1 && this.currentPage > 1) {
              this.currentPage -= 1;
              this.getDataByBudgetId();
            }
            this.getDataByBudgetId();
          },
          (error) => {
            console.error('Error deleting user', error);
          }
        );
      },
    })
  }


  deleteSelectedExpense(selectedUserIds: number[]) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
    this.expenseService.deleteSelectedExpense(selectedUserIds).subscribe(
      (response:any) => {
        this.getDataByBudgetId();
        const remainingData = this.data.filter((user: { expense_id: number; }) => !selectedUserIds.includes(user.expense_id));
        this.getDataByBudgetId();
        this.selectedRows = [];
        this.childComponents.forEach(child => {
          child.selectAll = false;
        });
        if (remainingData.length === 0 && this.currentPage > 1) {
          this.currentPage -= 1;
          this.getDataByBudgetId();
        }
            this.messageService.add({ severity: 'success', 
            summary: 'Confirmed', 
            detail: `${response.message}` 
          });
        this.getDataByBudgetId();
      },
      (error) => {
        console.error('Error deleting selected rows', error);
      }
      );
    },
  })
}
  updateSelectedRows(rows: any) {
    this.selectedRows = rows;
  }
  reset() {
    this.data = [];
    this.editIndex = -1;
    this.searchQuery = '';
    this.getDataByBudgetId();
    this.expenseProfile.reset();
  }
  goBack() {
    this.router.navigate(['/budget']);
  }
}

