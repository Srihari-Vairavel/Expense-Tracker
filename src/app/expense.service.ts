import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private baseUrl = environment.host;

  constructor(private http: HttpClient) { }

  //method for getting All expenses
  getAllExpenseByBudgetId(id: number, pageNo: number, limit: number, sortBy: string, sortOrder: string, searchQuery: string): Observable<any> {

    let params = new HttpParams();
    params = params.set('page', pageNo);
    params = params.set('limit', limit);

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
      params = params.set('sortOrder', sortOrder);
    }
    return this.http.get<any>(`${this.baseUrl}/Budgets/${id}/Expenses`, { params })
  }

  //method for getting single expenses
  getSingleExpenseByBudgetId(budgetId: number, expenseId: number) {
    return this.http.get<any>(`${this.baseUrl}/Budgets/${budgetId}/Expenses/${expenseId}`)
  }

  //method for creating new expenses
  createExpense(newExpense: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Expenses`, newExpense)
  }

  //method for updating expenses
  updateExpense(budgetId: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/Expenses/${budgetId}`, user)
  }

  //method for deleting expense by id
  deleteExpense(expenseId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/Expenses/${expenseId}`);
  }

  //method for deleting selected expense
  deleteSelectedExpense(selectedUserIds: number[]): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/Expenses`, { body: { selected: selectedUserIds } });
  }
}
