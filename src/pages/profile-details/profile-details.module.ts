import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileDetailsPage } from './profile-details';

@NgModule({
  declarations: [
    ProfileDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileDetailsPage),
  ],
})
export class ProfileDetailsPageModule {}
