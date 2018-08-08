import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagePage } from './message';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    MessagePage,
  ],
  imports: [
    IonicPageModule.forChild(MessagePage),
    MomentModule
  ],
})
export class MessagePageModule {}
