import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewCardPage } from './new-card';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  declarations: [
    NewCardPage,
  ],
  imports: [
    IonicPageModule.forChild(NewCardPage),
    TextMaskModule
  ],
})
export class NewCardPageModule {}
