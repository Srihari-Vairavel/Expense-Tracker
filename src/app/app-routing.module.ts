import { NgModule } from "@angular/core";
import { RouterModule,Routes } from "@angular/router";
import { BudgetFormComponent } from './budget-form/budget-form.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';

const routes:Routes = [
    {path:'',redirectTo:'/budget', pathMatch:'full'},
    {path:'budget',component:BudgetFormComponent},
    {path:'expense/:id',component:ExpenseFormComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports:[RouterModule]
})
export class AppRoutingModule{}