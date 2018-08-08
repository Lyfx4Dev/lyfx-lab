import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../auth/auth';
import { ProfileDetailsPage } from '../profile-details/profile-details';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { CardsPage } from '../cards/cards';
import { BankPage } from '../bank/bank';
import { LocalPage } from '../local/local';
import { FilterPage } from '../filter/filter';
import { TabsLocalPage } from '../tabs-local/tabs-local';
import { TabsPage } from '../tabs/tabs';
import { LoadingProvider } from '../../providers/loading';
import { EmailPage } from '../email/email';
import { FirebaseService } from '../../providers/firebase';
import { SocialSharing  } from "@ionic-native/social-sharing";

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  user;
  local = false;
  type;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public socialSharing: SocialSharing,
    public app: App,
    public modalCtrl: ModalController,
    public loading: LoadingProvider,
    private firebaseService: FirebaseService,
    public toastCtrl: ToastController
  ) {
    this.getUserData();

    //Define type
    let type = sessionStorage.getItem('switchActive');
    if (type) {
      if (type === 'local') {
        this.type = 'traveller mode';
      }
      else {
        this.type = 'local expert mode';
      }
    }
    else {
      this.type = 'local expert mode';
    }
  }

  //Switch menu
  switch() {
    let type = sessionStorage.getItem('switchActive');
    if (type) {
      if (type === 'local') {
        sessionStorage.setItem('switchActive', 'traveller');
        this.app.getRootNav().setRoot(TabsPage);
      }
      else if (type === 'traveller') {
        sessionStorage.setItem('switchActive', 'local');
        this.app.getRootNav().setRoot(TabsLocalPage);
      }
    }
    else {
      sessionStorage.setItem('switchActive', 'local');
      this.app.getRootNav().setRoot(TabsLocalPage);
    }
  }

  //Contact us modal
  contactUs(){
    let modal = this.modalCtrl.create(EmailPage);
    modal.present();
  }

  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        if (!this.user.avatar) {
          this.user.avatar = '/assets/imgs/avatar-icon.png';
        }

        if (this.user.local) {
          this.local = true
        }
      })
  }

  //Open local expert info modal
  toLocal() {
    let modal = this.modalCtrl.create(LocalPage);
    modal.present();
  }

  //Saved
  saved() {
    let modal = this.modalCtrl.create(FilterPage, { type: 'saveds' });
    modal.present();
  }

  //Open bank info modal
  bank() {
    let modal = this.modalCtrl.create(BankPage);
    modal.present();
  }

  // Open profile details
  profileDetails() {
    let modal = this.modalCtrl.create(ProfileDetailsPage);
    //Refresh page on modal dismiss
    modal.onDidDismiss(data => {
      if (data) {
        let modal = this.modalCtrl.create(EditProfilePage);
        modal.present();
        modal.onDidDismiss(data => {
          this.navCtrl.setRoot(this.navCtrl.getActive().component);
        })
      }
    })
    modal.present();
  }

  //Open payment methods modal
  payments() {
    let modal = this.modalCtrl.create(CardsPage);
    modal.present();
  }

  //Deeplink location sharing
  requestReview() {
    this.socialSharing.share('Hello!! Could you evaluate me on this link?', this.user.firstName, null, 'https://lyfx.co/request-review/' + this.user.uid)
    .then(() => {
      const toast = this.toastCtrl.create({
        message: 'Request sent successfully',
        duration: 3000
      });
      toast.present();
    })
    .catch(() => {
      const toast = this.toastCtrl.create({
        message: 'Error submitting please try again',
        duration: 3000
      });
      toast.present();
    });
  }

  logout() {
    //Clear storage
    localStorage.clear();
    this.storage.clear();
    //Go to login page
    this.app.getRootNav().setRoot(AuthPage)
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Profile page');
  }

  //Refresh page
  refresh(refresher) {
    refresher.complete();
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  //Share
  share() {
    var mensagem="Hi, you're receiving an invitation to install the Lyfx app, just click here http://lyfx.co/affiliate/"+this.user.affiliate;
    this.socialSharing.share(mensagem);
  }

}
