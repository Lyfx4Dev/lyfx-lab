import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePage } from './profile';
import { SocialSharing } from '@ionic-native/social-sharing';

@NgModule({
  declarations: [
    ProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
  ],
  providers:[
    SocialSharing
  ]
})
export class ProfilePageModule {}
