import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewPassPage } from './new-pass';

@NgModule({
  declarations: [
    NewPassPage,
  ],
  imports: [
    IonicPageModule.forChild(NewPassPage),
  ],
})
export class NewPassPageModule {}
