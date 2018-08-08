import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManageAdventurePage } from './manage-adventure';
import { Geolocation } from '@ionic-native/geolocation';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NgCalendarModule  } from 'ionic2-calendar';
import { Camera } from '@ionic-native/camera';

@NgModule({
  declarations: [
    ManageAdventurePage,
  ],
  imports: [
    IonicPageModule.forChild(ManageAdventurePage),
    CurrencyMaskModule,
    NgCalendarModule
  ],
  providers: [
    Geolocation,
    Camera
  ]
})
export class ManageAdventurePageModule {}
