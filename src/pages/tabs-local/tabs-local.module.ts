import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabsLocalPage } from './tabs-local';

@NgModule({
  declarations: [
    TabsLocalPage,
  ],
  imports: [
    IonicPageModule.forChild(TabsLocalPage),
  ],
})
export class TabsLocalPageModule {}
