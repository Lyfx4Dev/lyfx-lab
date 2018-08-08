import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Helpers } from '../../providers/helpers';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { LoadingProvider } from '../../providers/loading';
import { Storage } from '@ionic/storage';
import { ManageAdventurePage } from '../manage-adventure/manage-adventure';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-local-adventures',
  templateUrl: 'local-adventures.html',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), { optional: true }),
        query(':enter', stagger('300ms', [
          animate('1s ease-in', keyframes([
            style({ opacity: 0, transform: 'translateY(10px)', offset: 0 }),
            style({ opacity: .5, transform: 'translateY(5px)', offset: 0.3 }),
            style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
          ]))]), { optional: true })
      ])
    ])
  ]
})
export class LocalAdventuresPage {

  adventures = [];
  skip = 0;
  limit = 4;
  user;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private helpers: Helpers,
    private loading: LoadingProvider,
    private storage: Storage,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
  }

  //Refresh page
  refresh(refresher) {
    refresher.complete();
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }


  //New adventure
  add() {
    let modal = this.modalCtrl.create(ManageAdventurePage);
    modal.present();
  }

  getAdventures() {
    this.loading.present();
    this.skip = this.adventures.length + this.skip;
    this.firebaseService.getAdventuresFromOwnerId(this.user.uid)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          this.adventures.push(item);
        });
        //Loading dismiss
        this.loading.dismiss();
      });
    // this.apiServices.getExperiencesByOwnerId(this.user._id, this.skip, this.limit)
    //   .subscribe(
    //   (result) => {
    //     let res = JSON.parse(JSON.stringify(result));
    //     let i = 0;
    //     let length = res.data.length;
    //     for (i; i < length; i++) {
    //       this.adventures.push(res.data[i]);
    //     }
    //     this.loading.dismiss();
    //   })
  }

  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        this.getAdventures();
      })
  }

  formatPrice(value) {
    return this.helpers.formatPrice(value);
  }

  openAdventure(adventure) {
    let modal = this.modalCtrl.create('ManageAdventurePage', { edit: true, adventure: adventure });
    modal.present();

    modal.onDidDismiss(() => {
      this.navCtrl.setRoot(this.navCtrl.getActive().component);
    })
  }


  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Local adventures page');
 }

}
