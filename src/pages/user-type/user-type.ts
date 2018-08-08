import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { LocalPage } from '../local/local';
import { Facebook } from '@ionic-native/facebook';

@IonicPage()
@Component({
  selector: 'page-user-type',
  templateUrl: 'user-type.html',
})
export class UserTypePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private facebook: Facebook) {
  }

  traveller(){
    this.navCtrl.setRoot(TabsPage);
    //Facebook log
    this.facebook.logEvent('SELECTED_TRAVELLER_MODAL')
  }

  local(){
    this.navCtrl.setRoot(TabsPage);
    let modal = this.modalCtrl.create(LocalPage);
    modal.present();
    //Facebook log
    this.facebook.logEvent('SELECTED_LOCAL_MODAL')
  }

  ionViewDidLoad() {
  }

}
