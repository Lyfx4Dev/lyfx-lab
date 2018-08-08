import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ModalController } from 'ionic-angular';
import { ApiServices } from '../../providers/api-services';
import { LoadingProvider } from '../../providers/loading';
import { Helpers } from '../../providers/helpers';
import { AddReviewPage } from '../add-review/add-review';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
declare var google;
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetailsPage {

  order;
  adventure;
  geocoder;
  address;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public apiServices: ApiServices,
    public loading: LoadingProvider,
    public helpers: Helpers,
    private viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private launchNavigator: LaunchNavigator,
    private firebaseService: FirebaseService
  ) {
    this.order = navParams.get('order');
    //Init geocoder
    this.geocoder = new google.maps.Geocoder;
  }

  //Make review
  review() {
    let modal = this.modalCtrl.create(AddReviewPage, { adventure: this.order.experience });
    modal.present();
  }

  //Get formatted address from place id
  geocode() {
    this.geocoder.geocode({ 'placeId': this.order.experience.meetingId }, (results, status) => {
      this.address = results[0].formatted_address;
    });
  }

  //Close modal
  back() {
    this.viewCtrl.dismiss();
  }


  //Open location on other apps
  openLocationOnOtherApp() {
    let destiny = this.order.experience.destinyCity + ', ' + this.order.experience.destinyState;
    this.launchNavigator.navigate(destiny);
  }

  //Cancel order
  cancel() {
    let alert = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'This action is irreversible.',
      buttons: [
        {
          text: 'Back',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {
            this.loading.present();
            this.apiServices.cancelOrder(this.order)
              .subscribe(
                (result) => {
                  console.log(result)
                  this.loading.dismiss();
                  this.viewCtrl.dismiss();
                  let alert = this.alertCtrl.create({
                    title: 'Success',
                    subTitle: 'Cancellation request created.',
                    buttons: [{
                      text: 'Ok',
                      handler: () => {
                        this.viewCtrl.dismiss();
                      }
                    }]
                  });
                  alert.present();
                },
                err => {
                  this.loading.dismiss();
                  this.viewCtrl.dismiss();
                  let alert = this.alertCtrl.create({
                    title: 'Success',
                    subTitle: 'Cancellation request created.',
                    buttons: [{
                      text: 'Ok',
                      handler: () => {
                        this.viewCtrl.dismiss();
                      }
                    }]
                  });
                  alert.present();
                }
              )
          }
        }
      ]
    });
    alert.present();
  }

  convertDate(date) {
    return this.helpers.formatDate(date);
  }

  formatPrice(value) {
    return this.helpers.formatPrice(value);
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Order details page');
  }

}
