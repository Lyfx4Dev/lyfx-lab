import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Helpers } from '../../providers/helpers';
import { Storage } from '@ionic/storage';
import { OrderDetailsPage } from '../order-details/order-details';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-local-calendar',
  templateUrl: 'local-calendar.html',
})
export class LocalCalendarPage {

  user;
  adventures;
  currentDate;
  type = 'all';

  constructor
    (
    public navCtrl: NavController,
    public navParams: NavParams,
    private helpers: Helpers,
    public storage: Storage,
    public modalCtrl: ModalController,
    public loading: LoadingProvider,
    private firebaseService: FirebaseService
    ) {
    this.loading.present()
    this.getUserData();

    //Current date
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (((day.toString().length) === 1) && ((month.toString().length) === 1)) {
      this.currentDate = year + "-0" + month + "-0" + day;
    }
    else if (((day.toString().length) > 1) && ((month.toString().length) === 1)) {
      this.currentDate = year + "-0" + month + "-" + day;
    }
    else if (((day.toString().length) === 1) && ((month.toString().length) > 1)) {
      this.currentDate = year + "-" + month + "-0" + day;
    }

  }

  //Refresh page
  refresh(refresher) {
    refresher.complete();
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }


  //Open order details
  open(order) {
    let modal = this.modalCtrl.create(OrderDetailsPage, { order: order });
    modal.present();
  }

  //Change type
  changeType(type) {
    this.type = type
  }

  //Get current user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        this.getMyAdventures();
      })
  }

  getMyAdventures() {
    this.firebaseService.getOrdersByLocal(this.user.uid)
      .then((querySnapshot) => {
        let array = [];
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          item.id = doc.id;
          array.push(item);
        });
        if (array.length != 0) {
          //Get adventures info
          this.firebaseService.getOrdersWithAdventuresLocal(this.user.uid)
            .subscribe((res) => {
              this.adventures = res;
              this.loading.dismiss()
            })
        }
        else {
          this.loading.dismiss()
        }
      })
  }

  convertDate(date) {
    return this.helpers.formatDate(date);
  }

  //Compare dates to upcoming
  upcoming(adventure) {
    if (adventure.scheduledAt.split('T')[0] >= this.currentDate) {
      return true
    }
  }

  //Compare dates to completed
  completed(adventure) {
    if (adventure.scheduledAt.split('T')[0] < this.currentDate) {
      return true
    }
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Local calendar page');
 }

}
