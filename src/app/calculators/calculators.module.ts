import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculatorsRoutingModule } from './calculators-routing.module';
import { CalculatorsComponent } from './calculators.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CalculatorsComponent],
  imports: [
    CommonModule,
    CalculatorsRoutingModule,
    SharedModule
  ],
  exports: [CalculatorsComponent]
})
export class CalculatorsModule { }
