import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalAdventuresPage } from './local-adventures';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';

@NgModule({
  declarations: [
    LocalAdventuresPage,
  ],
  imports: [
    IonicPageModule.forChild(LocalAdventuresPage),
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [
    NativePageTransitions
  ]
})
export class LocalAdventuresPageModule {}
