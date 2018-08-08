import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InboxPage } from './inbox';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    InboxPage,
  ],
  imports: [
    IonicPageModule.forChild(InboxPage),
    MomentModule
  ],
})
export class InboxPageModule {}
