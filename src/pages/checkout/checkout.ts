import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ApiServices } from '../../providers/api-services';
import { NewCardPage } from '../new-card/new-card';
import { LoadingProvider } from '../../providers/loading';
import { TermsPage } from '../terms/terms';
import { Helpers } from '../../providers/helpers';
import { FirebaseService } from '../../providers/firebase';
import { Facebook } from '@ionic-native/facebook';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {

  date;
  adventure;
  availability;
  step = 1;
  trav = {
    name: '',
    age: '',
    email: ''
  };
  price;
  travellers = [];
  cards = [];
  user;
  calendarLoad = true;
  viewTitle: string;
  eventSource = [];
  calendar = {
    mode: 'month',
    currentDate: new Date()
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public apiServices: ApiServices,
    public modalCtrl: ModalController,
    private loading: LoadingProvider,
    public alertCtrl: AlertController,
    private helpers: Helpers,
    private firebaseService: FirebaseService,
    private facebook: Facebook,
    public toastCtrl: ToastController
  ) {
    this.adventure = this.navParams.get('adventure');
    this.price = this.adventure.price;
    this.onViewTitleChanged();
    this.getUserData();
  }

  onTimeSelected(ev) {
    if(!!ev.events[0]) {
      this.date = ev.events[0].date;
      this.availability = ev.events[0].availability;
      this.step = 2;
    } else {
      let toast = this.toastCtrl.create({
        message: 'Unavailable for day ' + new Date(ev.selectedTime).getDate(),
        duration: 3000
      });
      toast.present();
    }
  }

  //Change month title
  onViewTitleChanged(title = moment().month(new Date().getMonth()).format('MMMM')) {
    //Set var to current monthS title
    this.viewTitle = title;
    //Separate month and year
    let monthAndYear = title.split(' ');
    //Set month and convert to api format => January = 0
    let month = parseInt(moment().month(monthAndYear[0]).format('M')) - 1;
    //Set year
    let year = monthAndYear[1];
    //Get availability from current adventure
    this.getAvailability(this.adventure.id, month, year);
  }

  getAvailability(adventure, month, year) {
    if (!this.calendarLoad) {
      this.loading.present();
    }
    this.apiServices.getAvailability(adventure, month, year)
      .subscribe(
        (result) => {
          let days = result['days'];
          let i = 0;
          let length = days.length;
          let events = [];
          for (i; i < length; i++) {
            let day = days[i];
            //If availability for current day > 0
            if (day.availability > 0) {
              //Check if it is not an old date
              if (this.helpers.compareCalendarDates(day.date)) {
                let formatedDate = this.helpers.formatDateToCalendarComponent(day.date);
                let obj = {
                  date: formatedDate,
                  startTime: new Date(formatedDate),
                  endTime: new Date(formatedDate),
                  allDay: true,
                  availability: day.availability
                };
                events.push(obj);
              }
            }
          }
          this.eventSource = events;
          //Mute text without availabilty
          this.inactiveDates();
        })
  }

  inactiveDates() {
    setTimeout(() => {
      let items = document.querySelectorAll('td');
      let i = 0;
      let length = items.length
      for (i; i < length; i++) {
        let item = items[i];
        if
        (
          (item.classList[0] != "monthview-primary-with-event") &&
          (item.classList[0] != "text-muted")
        ) {
          item.classList.add('withoutAvailabity');
        }
      };
      this.calendarLoad = false;
      if (!this.calendarLoad) {
        this.loading.dismiss();
      }
    }, 200)
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        let obj = { name: currentUser.firstName + " " + currentUser.lastName, email: currentUser.email, id: currentUser.uid };
        this.travellers.push(obj);
      })
  }

  add() {
    //Compare travellers with availability
    if (this.travellers.length < this.availability) {
      if (
        (this.trav.name != '') &&
        (this.trav.age != '')
      ) {
        let obj = {
          name: this.trav.name,
          email: this.trav.email,
          age: this.trav.age
        };
        this.travellers.push(obj);
        this.trav.name = '';
        this.trav.email = '';
        this.trav.age = '';
        this.newPrice();
      }
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: 'Maximum number of travelers.',
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  //New price
  newPrice() {
    // console.log(this.travellers.length);
    this.price = this.adventure.price * this.travellers.length;
  }

  //Format price
  formatPrice(value) {
    return this.helpers.formatPrice(value);
  }

  //Remove from travellers
  remove(trav) {
    let index = this.travellers.indexOf(trav);
    if (index > -1) {
      this.travellers.splice(index, 1);
      this.newPrice();
    }
  }

  next() {
    this.step = this.step + 1;
  }

  back() {
    if (this.step != 1) {
      this.step = this.step - 1;
    }
    else {
      this.viewCtrl.dismiss();
    }
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Checkout page');
  }

  toPay() {
    this.loading.present();
    //List cards
    // this.apiServices.getPaymentMethods(this.user._id)
    this.firebaseService.getCards(this.user.uid)
      .then(
        (querySnapshot) => {
          this.loading.dismiss()
          let array = [];
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            item.id = doc.id;
            array.push(item);
          });

          this.cards = array;
          // console.log(this.cards)
          if (this.cards.length != 0) {
            //Action sheet
            let actionSheet = this.actionSheetCtrl.create({
              title: 'Select card'
            });
            for (let i = 0; i < this.cards.length; i++) {
              var button = {
                text: this.cards[i].cardNumber + ' | ' + this.cards[i].cardBrand,
                handler: () => {
                  this.pay(this.cards[i].id)
                }
              }
              actionSheet.addButton(button)
            }
            actionSheet.present();
          }
          else {
            let modal = this.modalCtrl.create(NewCardPage);
            modal.onDidDismiss(data => {
              if (data.created) {
                this.toPay();
              }
            })
            modal.present();
          }
        })
  }

  pay(card) {
    this.loading.present();
    let data = {
      "adventureId": this.adventure.id,
      "ownerId": this.user.uid,
      "scheduledAt": this.date,
      "amount": this.formatPrice(this.price),
      'status': 'pending',
      "travellers": this.travellers,
      "paymentMethodId": card,
      "localId": this.adventure.user.uid
    };
    // console.log(data)
    this.firebaseService.createOrder(data)
      .then(
        (result) => {
          //Analytics log
          this.firebaseService.eventOrder(this.user.uid, this.user.email, this.adventure.id, this.formatPrice(this.price));
          //Facebook log
          let price = parseInt(this.formatPrice(this.price));
          this.facebook.logPurchase(price, 'dolar');
          this.loading.dismiss();
          this.viewCtrl.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Scheduled adventure, bro!',
            subTitle: 'Wait for confirmation by email.',
            buttons: ['Ok']
          });
          alert.present();
        })
  }

  terms() {
    let modal = this.modalCtrl.create(TermsPage, { type: 'terms' });
    modal.present();
  }

  cancellation() {
    let modal = this.modalCtrl.create(TermsPage, { type: 'cancellation' });
    modal.present();
  }

}
