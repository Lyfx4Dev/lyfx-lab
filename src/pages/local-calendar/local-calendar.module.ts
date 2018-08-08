import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalCalendarPage } from './local-calendar';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    LocalCalendarPage,
  ],
  imports: [
    MomentModule,
    IonicPageModule.forChild(LocalCalendarPage),
  ],
})
export class LocalCalendarPageModule {}
