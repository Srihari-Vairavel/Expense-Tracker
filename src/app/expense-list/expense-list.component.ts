import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { ExpenseService } from '../expense.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { PaginatorState } from 'primeng/paginator';


@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent  {
  @Input() data: any[] = [];
  @Input() selectedRows: any[] = [];
  @Input() searchQuery!: string;
  @Input() totalPages!: number;
  @Input() totalRows !: number;
  @Input() currentPage !: number;
  @Input() budgetStatus!: string;
  
  @Output() editData: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteData: EventEmitter<number> = new EventEmitter<number>();
  @Output() searchBudget: EventEmitter<any> = new EventEmitter<any>();
  @Output() sort: EventEmitter<{ sortBy: string, sortOrder: string }> = new EventEmitter<{ sortBy: string, sortOrder: string }>();
  @Output() currentPageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() updateSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetData: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteSelectedData: EventEmitter<any> = new EventEmitter<any>();

  selectAll: boolean = false;
  sortBy: any = 'expense_id';
  sortOrder: string = 'desc';
  first: any = 0
  rows: any = 5

  constructor() { }
  edit(userId: number) {    
    this.editData.emit(userId);
  }

  onSearch(query: string) {
    this.currentPage = 1;
    this.searchQuery = query;
    this.searchBudget.emit(this.searchQuery)
  }

  onSort(event: TableLazyLoadEvent) {
    if(event.sortField === undefined){
      this.sortBy = 'expense_id'
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

  remove(userId: number) {
    this.deleteData.emit(userId);
  }

  deleteSelectedExpense() {
    const selectedUserIds: any = this.selectedRows.map(row => row.expense_id);
    this.deleteSelectedData.emit(selectedUserIds)
  }
  updateSelectedRows() {
    const selectedData = this.data.filter(row => row.selected)
    this.updateSelected.emit(selectedData);
  }
  selectAllRows() {
    this.data.forEach(row => (row.selected = this.selectAll));
    this.updateSelectedRows();
  }
  onReset() {
    this.searchQuery='';
    this.resetData.emit();
  }

  

}
