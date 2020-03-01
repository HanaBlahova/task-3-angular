import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaxCalculationComponent } from './tax-calculation/tax-calculation.component';
import { CalculationHistoryComponent } from './calculation-history/calculation-history.component';


const routes: Routes = [
  { path: '', component: TaxCalculationComponent},
  { path: 'history', component: CalculationHistoryComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
