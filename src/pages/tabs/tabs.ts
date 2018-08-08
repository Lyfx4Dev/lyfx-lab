import { Component } from '@angular/core';
import { ExplorePage } from '../explore/explore';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../inbox/inbox';
import { MyAdventuresPage } from '../my-adventures/my-adventures';
import { ModalController } from 'ionic-angular';
import { FilterPage } from '../filter/filter';
import { LoadingProvider } from '../../providers/loading';
import { Storage } from '@ionic/storage';
import { NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../providers/firebase';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  exploreTab = ExplorePage;
  profileTab = ProfilePage;
  inboxTab = InboxPage;
  adventuresTab = MyAdventuresPage;
  selectTab = 0;
  refresh = false;

  constructor(
    public modalCtrl: ModalController,
    private loading: LoadingProvider,
    private storage: Storage,
    public navCtrl: NavController,
    public navParams: NavParams,
    private firebaseService: FirebaseService
  ) {
    this.refresh = this.navParams.get('refresh');
    if (this.refresh) {
      this.selectTab = 4
    }
  }

  public saveds() {
    let modal = this.modalCtrl.create(FilterPage, { type: 'saveds' });
    modal.present();
  }

  public profile() {
    if (!this.refresh) {
      this.loading.present();
      this.storage.get('currentUser')
        .then((currentUser) => {
          let user = currentUser;
          this.firebaseService.getCurrentUser(user.uid)
            .then((res) => {
              this.loading.dismiss();
              this.storage.set('currentUser', res);
              //Refresh page
              this.navCtrl.setRoot(this.navCtrl.getActive().component, { refresh: true });
            })
        })
    }
    else {
      this.refresh = false
    }
  }

}
