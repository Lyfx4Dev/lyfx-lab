import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyAdventuresPage } from './my-adventures';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    MyAdventuresPage,
  ],
  imports: [
    IonicPageModule.forChild(MyAdventuresPage),
    MomentModule
  ],
})
export class MyAdventuresPageModule {}
