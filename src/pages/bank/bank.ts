import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-bank',
  templateUrl: 'bank.html',
})
export class BankPage {

  user = {
    uid: '',
    bank: {
      name: '',
      type: '',
      account_number: '',
      routing_number: ''
    }
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private loading: LoadingProvider,
    public viewCtrl: ViewController,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Bank info page');
 }

  //Save
  save() {
    this.loading.present();
    this.firebaseService.saveUser(this.user)
      .then(
        (result) => {
          //Update user on local storage
          this.saveUserData(this.user.uid);
        })
  }

  //Save user data
  saveUserData(uid) {
    this.firebaseService.getCurrentUser(uid)
      .then((res) => {
        this.storage.set('currentUser', res)
          .then(() => {
            this.loading.dismiss();
            this.back();
          })
      })
  }

  back() {
    this.viewCtrl.dismiss();
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user.uid = currentUser.uid;
        if (currentUser.bank) {
          if(currentUser.bank.name) { this.user.bank.name = currentUser.bank.name };
          if(currentUser.bank.type) { this.user.bank.type = currentUser.bank.type };
          if(currentUser.bank.account_number) { this.user.bank.account_number = currentUser.bank.account_number };
          if(currentUser.bank.routing_number) { this.user.bank.routing_number = currentUser.bank.routing_number };
        }
      })
  }

  

}
