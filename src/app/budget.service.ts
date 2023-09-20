import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
 private baseUrl = environment.host;

  constructor(private http: HttpClient) { }

  //method for getting all budgets
  getAllBudget(pageNo: number,limit: number,sortBy: string, sortOrder:string, searchQuery?: string): Observable<any> {
    const headers = new HttpHeaders({'Content-Type': 'application/json'})
    let params = new HttpParams();
    params = params.set('page',pageNo);
    params = params.set('limit',limit);
    if(sortBy){
      params = params.set('sortBy',sortBy);
      params = params.set('sortOrder',sortOrder);
    }
    if(searchQuery){
      params = params.set('query', searchQuery);
    }
    return this.http.get<any>(`${this.baseUrl}/Budgets`,{params,headers});
  }
  //method for getting single budget
  getBudgetById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Budgets/${id}`)
  }

  //method creating a new budget
  createBudget(newBudget: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Budgets`,newBudget )
  }

  //method for updating budget
  updateBudget(budgetId: number,user:any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/Budgets/${budgetId}`,user)
  }

  //method for deleting budget by id
  deleteBudget(budgetId: number) : Observable <any> {
    return this.http.delete<any>(`${this.baseUrl}/Budgets/${budgetId}`);
  }

  //method for deleting selected budget
  deleteSelectedBudget(selectedUserIds: number[]): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/Budgets`,{body:{selected:selectedUserIds}});
  }

  budgetStatus(budgetId:any,status:any) : Observable <any> {
    console.log(status);
    return this.http.put<any>(`${this.baseUrl}/Budgets/${budgetId}`,{status: status})

  }
}
