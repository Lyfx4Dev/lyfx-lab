// import { Pro } from '@ionic/pro';
import { NgModule, ErrorHandler, Injectable, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Deeplinks } from "@ionic-native/deeplinks";
import { HttpClientModule } from '@angular/common/http';
//Modules
import { IonicStorageModule } from '@ionic/storage';
import { HTTP } from '@ionic-native/http'
//Firebase
import { FCM } from '@ionic-native/fcm';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
export const firebaseconfig = {
  apiKey: "AIzaSyAemLi2IhfBU2Jk2Yu_--EOc5PBEM_MLt8",
  authDomain: "lyfx-lab.firebaseapp.com",
  databaseURL: "https://lyfx-lab.firebaseio.com",
  projectId: "lyfx-lab",
  storageBucket: "lyfx-lab.appspot.com",
  messagingSenderId: "78494833674"
  timestampsInSnapshots: true,
};

//Providers
import { ApiServices } from '../providers/api-services';
import { FirebaseService } from '../providers/firebase';
import { Helpers } from '../providers/helpers';
import { LoadingProvider } from '../providers/loading';
import { ToastProvider } from '../providers/toast';
import { ImagesUpload } from '../providers/images-upload';
import { Stripe } from '@ionic-native/stripe';
import { Facebook } from '@ionic-native/facebook';
import { SocialSharing  } from "@ionic-native/social-sharing";
import { LottieAnimationViewModule } from 'ng-lottie';
// import { EmailComposer } from '@ionic-native/email-composer';
// import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';

//Page modules
import { UserTypePageModule } from '../pages/user-type/user-type.module';
import { ExplorePageModule } from '../pages/explore/explore.module';
import { EmailPageModule } from '../pages/email/email.module';
import { AdventurePageModule } from '../pages/adventure/adventure.module';
import { ProfilePageModule } from '../pages/profile/profile.module';
import { AuthPageModule } from '../pages/auth/auth.module';
import { InboxPageModule } from '../pages/inbox/inbox.module';
import { MessagePageModule } from '../pages/message/message.module';
import { MyAdventuresPageModule } from '../pages/my-adventures/my-adventures.module';
import { OrderDetailsPageModule } from '../pages/order-details/order-details.module';
import { EditProfilePageModule } from '../pages/edit-profile/edit-profile.module';
import { ProfileDetailsPageModule } from '../pages/profile-details/profile-details.module';
import { CardsPageModule } from '../pages/cards/cards.module';
import { NewCardPageModule } from '../pages/new-card/new-card.module';
import { BankPageModule } from '../pages/bank/bank.module';
import { LocalPageModule } from '../pages/local/local.module';
import { CheckoutPageModule } from '../pages/checkout/checkout.module';
import { FilterPageModule } from '../pages/filter/filter.module';
import { AddReviewPageModule } from '../pages/add-review/add-review.module';
import { TermsPageModule } from '../pages/terms/terms.module';
import { TabsLocalPageModule } from '../pages/tabs-local/tabs-local.module';
import { LocalCalendarPageModule } from '../pages/local-calendar/local-calendar.module';
import { LocalAdventuresPageModule } from '../pages/local-adventures/local-adventures.module';
import { ManageAdventurePageModule } from '../pages/manage-adventure/manage-adventure.module';
import { NewPassPageModule } from '../pages/new-pass/new-pass.module';

// Pro.init('23B5FC45', {
//   appVersion: '0.0.50'
// });

// @Injectable()
// export class MyErrorHandler implements ErrorHandler {
//   ionicErrorHandler: IonicErrorHandler;

//   constructor(injector: Injector) {
//     try {
//       this.ionicErrorHandler = injector.get(IonicErrorHandler);
//     } catch (e) {
//       // Unable to get the IonicErrorHandler provider, ensure
//       // IonicErrorHandler has been added to the providers list below
//     }
//   }

//   handleError(err: any): void {
//     Pro.monitoring.handleNewError(err);
//     // Remove this if you want to disable Ionic's auto exception handling
//     // in development mode.
//     this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
//   }
// }

@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseconfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserModule,
    IonicModule.forRoot(MyApp,{navExitApp: false}),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    LottieAnimationViewModule,
    // InterceptorModule,
    ExplorePageModule,
    EmailPageModule,
    AdventurePageModule,
    ProfilePageModule,
    AuthPageModule,
    InboxPageModule,
    MessagePageModule,
    MyAdventuresPageModule,
    OrderDetailsPageModule,
    EditProfilePageModule,
    ProfileDetailsPageModule,
    CardsPageModule,
    NewCardPageModule,
    BankPageModule,
    LocalPageModule,
    CheckoutPageModule,
    FilterPageModule,
    AddReviewPageModule,
    TermsPageModule,
    TabsLocalPageModule,
    LocalCalendarPageModule,
    LocalAdventuresPageModule,
    ManageAdventurePageModule,
    NewPassPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage
  ],
  providers: [
    HTTP,
    // FirebaseAnalytics,
    // EmailComposer,
    Deeplinks,
    Facebook,
    SocialSharing,
    FCM,
    Helpers,
    ApiServices,
    FirebaseService,
    LoadingProvider,
    Stripe,
    ToastProvider,
    ImagesUpload,
    StatusBar,
    SplashScreen,
  ]
})
export class AppModule {}
