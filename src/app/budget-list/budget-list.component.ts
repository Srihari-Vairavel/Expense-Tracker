import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { PaginatorState } from 'primeng/paginator';


@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.css'],
})


export class BudgetListComponent implements OnChanges {
  @Input() submittedData: any[] = [];
  @Input() selectedRows: any[] = [];
  @Input() editIndex!: number
  @Input() searchQuery!: string
  @Input() totalPages!: number;
  @Input() currentPage !: number;
  @Input() totalRows !: number;

  @Output() editData: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteData: EventEmitter<number> = new EventEmitter<number>();
  @Output() deleteSelectedData: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetData: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() sort: EventEmitter<any> = new EventEmitter<any>();
  @Output() currentPageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() searchBudget: EventEmitter<string> = new EventEmitter<string>();
  @Output() statusOfBudget: EventEmitter<any> = new EventEmitter<any>();

  selectAll: boolean = false;
  userProfile: any;
  sortBy: any= 'id';
  sortOrder: any = 'desc';
  first: any = 0
  rows: any = 5
  budgetId: any = 'id'

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submittedData']) {
      this.submittedData = [...this.submittedData];
    }
  }
  constructor() { }
  remove(userId: number) {
    this.deleteData.emit(userId);
  }
  
  edit(userId: number) {
    this.editData.emit(userId);
  }

  deleteSelectedBudget() {
    const selectedUserIds: any = this.selectedRows.map(row => row.expense_id);
    this.deleteSelectedData.emit(selectedUserIds)
  }

  updateSelectedRows() {
    const selectedData = this.submittedData.filter(row => row.selected)
    this.updateSelected.emit(selectedData);
  }
  selectAllRows() {
    this.submittedData.forEach(row => (row.selected = this.selectAll));
    this.updateSelectedRows();
  }

  onSort(event: TableLazyLoadEvent) {
    if(event.sortField === undefined){
      this.sortBy = 'id'
      this.sortOrder = 'desc'
    }else{
    this.sortBy = event.sortField
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.sort.emit({ sortBy: this.sortBy, sortOrder: this.sortOrder })
    }
  }

  onPageChange(event: PaginatorState) {
   const pageEvent:any = {
    tableRow:event.rows,
    page: event.first!/event.rows !+1
   }
    this.currentPageChange.emit(pageEvent);
  }

  onSearch(query: string) {
    this.currentPage = 1;
    this.searchQuery = query;
    this.searchBudget.emit(this.searchQuery)
  }
  onReset() {
    this.searchQuery = '';
    this.resetData.emit();
  }
  closeBudgetStatus(values:any) {
    console.log(values);
    this.statusOfBudget.emit({ id: values.id, status:values.status });
  }
}

