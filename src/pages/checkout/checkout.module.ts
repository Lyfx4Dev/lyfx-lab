import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckoutPage } from './checkout';
import { NgCalendarModule  } from 'ionic2-calendar';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    CheckoutPage,
  ],
  imports: [
    NgCalendarModule,
    MomentModule,
    IonicPageModule.forChild(CheckoutPage),
  ],
})
export class CheckoutPageModule {}
