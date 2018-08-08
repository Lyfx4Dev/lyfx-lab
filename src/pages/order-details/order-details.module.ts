import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderDetailsPage } from './order-details';
import { MomentModule } from 'angular2-moment';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

@NgModule({
  declarations: [
    OrderDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderDetailsPage),
    MomentModule
  ],
  providers: [
    LaunchNavigator
  ]
})
export class OrderDetailsPageModule {}
