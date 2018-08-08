import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdventurePage } from './adventure';
import { NgCalendarModule  } from 'ionic2-calendar';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    AdventurePage,
  ],
  imports: [
    NgCalendarModule,
    MomentModule,
    IonicPageModule.forChild(AdventurePage),
  ],
})
export class AdventurePageModule {}
