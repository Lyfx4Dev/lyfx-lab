import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthPage } from './auth';
import { Keyboard } from '@ionic-native/keyboard';

@NgModule({
  declarations: [
    AuthPage,
  ],
  imports: [
    IonicPageModule.forChild(AuthPage),
  ],
  providers: [
    Keyboard
  ]
})
export class AuthPageModule {}
