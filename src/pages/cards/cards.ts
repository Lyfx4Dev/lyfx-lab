import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { ApiServices } from '../../providers/api-services';
import { Storage } from '@ionic/storage';
import { NewCardPage } from '../new-card/new-card';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-cards',
  templateUrl: 'cards.html',
})
export class CardsPage {

  user;
  cards = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public apiServices: ApiServices,
    private storage: Storage,
    public modalCtrl: ModalController,
    private loading: LoadingProvider,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        this.getPaymentMethods();
      })
  }

  //Get payment methos
  getPaymentMethods() {
    this.loading.present();
    this.firebaseService.getCards(this.user.uid)
      .then((querySnapshot) => {
        this.loading.dismiss();
        let array = [];
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          array.push(item);
        });
        this.cards = array;
      })
  }

  back() {
    this.viewCtrl.dismiss()
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Cards page');
  }
  
  add() {
    this.back();
    let modal = this.modalCtrl.create(NewCardPage);
    modal.present();
  }

}
