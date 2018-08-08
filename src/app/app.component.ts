import { Component, ViewChild } from '@angular/core';
import { Platform, ModalController, Nav, AlertController, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { Deeplinks } from '@ionic-native/deeplinks';
//Pages
import { TabsPage } from '../pages/tabs/tabs';
import { AuthPage } from '../pages/auth/auth';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  @ViewChild(Nav) navChild: Nav;
  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    public storage: Storage,
    public deeplinks: Deeplinks,
    public modalCtrl: ModalController,
    public app: App
  ) {

    storage.get('currentUser')
      .then((user) => {
        if (user) {
          this.rootPage = TabsPage;
        }
        else {
          this.rootPage = AuthPage;
        }
      })

    platform.ready().then(() => {
      statusBar.styleDefault();
      setTimeout(() => {
        splashScreen.hide();
      });
      this.routesDeeplinks();
      sessionStorage.clear();
    });
  }

  routesDeeplinks() {
    this.deeplinks.route({
      '/adventure/:id': "AdventurePage",
      '/edit-profile/:nickname': "EditProfilePage",
      '/request-review/:idLocal': "AddReviewPage",
      '/affiliated/:nickname': "AuthPage",
    }).subscribe(match => {
      if (match.$route == "AdventurePage") {
        setTimeout(() => {
          if(this.rootPage != AuthPage) {
            let modal = this.modalCtrl.create("AdventurePage", match.$args);
            modal.present();
          } else {
            this.app.getRootNav().setRoot(AuthPage, {
              to: 'AdventurePage',
              params: match.$args
            });
          }
        }, 1000);
      } else if (match.$route == "EditProfilePage") {
        setTimeout(() => {
          if (this.rootPage != AuthPage) {
            let modal = this.modalCtrl.create("EditProfilePage", match.$args);
            modal.present();
          }
        }, 1000);
      } else if(match.$route == "AddReviewPage") {
        setTimeout(() => {
          if(this.rootPage != AuthPage) {
            let modal = this.modalCtrl.create('AddReviewPage', match.$args);
            modal.present();
          } else {
            this.app.getRootNav().setRoot(AuthPage, {
              to: 'AddReviewPage',
              params: match.$args
            });
          }
        }, 1000);
      } else if(match.$route == "AuthPage") {
        this.app.getRootNav().setRoot(AuthPage, {nickname: match.$args.nickname});
      }
    });
  }
}
