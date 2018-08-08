import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExplorePage } from './explore';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { Geolocation } from '@ionic-native/geolocation';
import { LottieAnimationViewModule } from 'ng-lottie';

@NgModule({
  declarations: [
    ExplorePage,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicPageModule.forChild(ExplorePage),
    LottieAnimationViewModule
  ],
  providers: [
    NativePageTransitions,
    Geolocation
  ]
})
export class ExplorePageModule {}
