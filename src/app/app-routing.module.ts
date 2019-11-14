import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalculatorsModule } from './calculators/calculators.module';

const routes: Routes = [
  {
    path: 'calculators ',
    loadChildren: () => import('./calculators/calculators.module').then(mod => mod.CalculatorsModule)
  },
  {
    path: '',
    redirectTo: 'calculators',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CalculatorsModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
