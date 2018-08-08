import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiServices } from '../../providers/api-services';
import { LoadingProvider } from '../../providers/loading';
import { Stripe } from '@ionic-native/stripe';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-new-card',
  templateUrl: 'new-card.html',
})
export class NewCardPage {

  card = {
    number: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  };
  masks: any;
  user;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public apiServices: ApiServices,
    private loading: LoadingProvider,
    public alertCtrl: AlertController,
    private stripe: Stripe,
    private storage: Storage,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
    //Stripe config
    this.stripe.setPublishableKey('pk_test_TIZ6djYh5vBVng8Tg9OfgODU');

    //Masks
    this.masks = {
      cardNumber: [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
    };
  }

  back() {
    this.viewCtrl.dismiss();
  }

  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
      })
  }

  save() {
    this.card.number = this.card.number.replace(/\D+/g, '');
    this.loading.present();

    let card = {
      number: this.card.number,
      expMonth: parseInt(this.card.expMonth),
      expYear: parseInt(this.card.expYear),
      cvc: this.card.cvc
    };

    this.stripe.createCardToken(card)
      .then((res) => {

        let data = {
          token: res.id,
          cardNumber: res.card.last4,
          cardBrand: res.card.brand,
          expirationMonth: res.card.exp_month,
          expirationYear: res.card.exp_year,
          ownerId: this.user.uid,
          ownerEmail: this.user.email
        };

        this.apiServices.createCustomer(data)
        .subscribe(
          err => {
            this.loading.dismiss();
          },
          (res) => {
          // console.log(res)
          this.loading.dismiss();
          this.viewCtrl.dismiss({ created: true })
        })
      })
      .catch(() => {
        this.loading.dismiss();
      })
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('New card page');
 }

}
