import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalPage } from './local';

@NgModule({
  declarations: [
    LocalPage,
  ],
  imports: [
    IonicPageModule.forChild(LocalPage),
  ],
})
export class LocalPageModule {}
