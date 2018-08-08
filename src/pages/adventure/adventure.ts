import { Component, NgZone, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, Content } from 'ionic-angular';
import { Helpers } from '../../providers/helpers';
import { ApiServices } from '../../providers/api-services';
import { LoadingProvider } from '../../providers/loading';
import { StatusBar } from '@ionic-native/status-bar';
import * as moment from 'moment';
import { CheckoutPage } from '../checkout/checkout';
declare var google;
import { Storage } from '@ionic/storage';
import { MessagePage } from '../message/message';
import { trigger, style, animate, transition } from '@angular/animations';
import { FirebaseService } from '../../providers/firebase';
import { SocialSharing  } from "@ionic-native/social-sharing";
  

@IonicPage()
@Component({
  selector: 'page-adventure',
  templateUrl: 'adventure.html',
  animations: [
    trigger(
      'fixed', [
        transition(':enter', [
          style({
            opacity: 0
          }),
          animate("1s ease-in-out", style({
            opacity: 1
          }))
        ]),
        transition(':leave', [
          style({
            opacity: 0
          })
        ])
      ],
    ),
    trigger(
      'header', [
        transition(':enter', [
          style({
            opacity: 1
          })
        ]),
        transition(':leave', [
          style({
            opacity: 0
          })
        ])
      ],
    ),
  ]
})
export class AdventurePage {

  @ViewChild(Content) content: Content;
  //On scroll
  show = false;
  //Var
  adventure;
  //Map var
  map: any;
  geocoder;
  //Calendar var
  eventSource = [];
  viewTitle: string;
  selectedDay = new Date();
  calendar = {
    mode: 'month',
    currentDate: new Date()
  };
  user;
  wishIcon = false;
  wishId;
  reviews = [];
  owner;
  calendarLoad = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private helpers: Helpers,
    private apiServices: ApiServices,
    private loading: LoadingProvider,
    private statusBar: StatusBar,
    private modalCtrl: ModalController,
    private storage: Storage,
    private ngZone: NgZone,
    private firebaseService: FirebaseService,
    public socialSharing: SocialSharing,
  ) {
  }

  ionViewDidEnter() {
  }

  ionViewDidLoad() {
    this.statusBar.backgroundColorByHexString('#ffffff');

    if(!!this.navParams.get('adventure')) {
      this.adventure = this.navParams.get('adventure');
      this.getUserData();
      this.getAdventureOwner();
      this.getReviews();
      this.analyticsLog();
    } else {
      this.loading.present();
      this.firebaseService.getAdventure(this.navParams.get("id"))
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.loading.dismiss();
          this.adventure = doc.data();
          this.getUserData();
          this.getAdventureOwner();
          this.getReviews();
          this.analyticsLog();
        });
      });
    }
  }


  getAdventureOwner() {
    this.firebaseService.getCurrentUser(this.adventure.ownerId)
      .then((res) => {
        this.owner = res;
        this.adventure.user = res;
        if (this.adventure.user.avatar === 'default') {
          this.adventure.user.avatar = "https://firebasestorage.googleapis.com/v0/b/lyfx-cab40.appspot.com/o/Images%2FProfile%2Fdefault-user.png?alt=media&token=48b4dae0-6611-4665-ba5d-3aeb2e19108b"
        }
        //Build a map
        setTimeout(() => {
          this.geocode();
        }, 500)
      })
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        this.verifyWish();
      })
  }

  //Get reviews
  getReviews() {
    let id = this.adventure.id;
    this.firebaseService.getReviews(id)
      .subscribe(
        (res) => {
          this.reviews = res;
        })
  }

  //Set header fixed
  onScroll(ev) {
    this.ngZone.run(() => {
      if (ev.scrollTop > 0) {
        this.show = true;
      }
      else {
        this.show = false;
        this.content.resize();
      }
    });
  }

  //Analytics Log
  analyticsLog() {
    this.firebaseService.eventAdventureView(this.adventure.id, this.adventure.title);
  }

  ionViewDidLeave() {
    this.statusBar.show();
  }

  formatPrice(value) {
    return this.helpers.formatPrice(value);
  }

  back() {
    this.viewCtrl.dismiss()
  }

  //To Checkout Page
  toCheckout() {
    let modal = this.modalCtrl.create(CheckoutPage, {adventure: this.adventure});
    modal.present();
  }

  geocode() {
    this.ngZone.run(() => {
      this.geocoder = new google.maps.Geocoder;
      this.geocoder.geocode({ 'placeId': this.adventure.meetingId }, (results, status) => {
        let result = results[0].geometry.location;
        this.map = new google.maps.Map(document.getElementById('map'), {
          styles: [
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#c3bab5"
                }
              ]
            },
            {
              "elementType": "labels.icon",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "none"
                }
              ]
            },
            {
              "featureType": "administrative.land_parcel",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#bdbdbd"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            },
            {
              "featureType": "transit.line",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "transit.station",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e9dfd7"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            }
          ],
          center: result,
          zoom: 13,
          streetViewControl: false,
          disableDefaultUI: true,
        })
        // Radius circle
        new google.maps.Circle({
          map: this.map,
          radius: 1000,
          center: result,
          strokeColor: '#138491',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#1A9EAD',
          fillOpacity: 0.35,
        });
      });
    })
  }


  // getAvailability(adventure, month, year) {
  //   if (!this.calendarLoad) {
  //     this.loading.present();
  //   }
  //   this.apiServices.getAvailability(adventure, month, year)
  //     .subscribe(
  //       (result) => {
  //         let days = result['days'];
  //         let i = 0;
  //         let length = days.length;
  //         let events = [];
  //         for (i; i < length; i++) {
  //           let day = days[i];
  //           //If availability for current day > 0
  //           if (day.availability > 0) {
  //             //Check if it is not an old date
  //             if (this.helpers.compareCalendarDates(day.date)) {
  //               let formatedDate = this.helpers.formatDateToCalendarComponent(day.date);
  //               let obj = {
  //                 date: formatedDate,
  //                 startTime: new Date(formatedDate),
  //                 endTime: new Date(formatedDate),
  //                 allDay: true,
  //                 availability: day.availability
  //               };
  //               events.push(obj);
  //             }
  //           }
  //         }
  //         this.eventSource = [];
  //         this.eventSource = events;
  //         console.log(this.eventSource);
  //         //Mute text without availabilty
  //         this.inactiveDates();
  //       })
  // }

  // inactiveDates() {
  //   setTimeout(() => {
  //     let items = document.querySelectorAll('td');
  //     let i = 0;
  //     let length = items.length
  //     for (i; i < length; i++) {
  //       let item = items[i];
  //       if
  //       (
  //         (item.classList[0] != "monthview-primary-with-event") &&
  //         (item.classList[0] != "text-muted")
  //       ) {
  //         item.classList.add('withoutAvailabity');
  //       }
  //     };
  //     this.calendarLoad = false;
  //     if (!this.calendarLoad) {
  //       this.loading.dismiss();
  //     }
  //   }, 200)
  // }

  //Change month title
  // onViewTitleChanged(title) {
  //   //Set var to current month title
  //   this.viewTitle = title;
  //   //Separate month and year
  //   let monthAndYear = title.split(' ');
  //   //Set month and convert to api format => January = 0
  //   let month = parseInt(moment().month(monthAndYear[0]).format('M')) - 1;
  //   //Set year
  //   let year = monthAndYear[1];
  //   //Get availability from current adventure
  //   this.getAvailability(this.adventure.id, month, year);
  // }

  // onTimeSelected(ev) {
  //   if(!!ev.events[0]) {
  //     let date = ev.events[0].date;
  //     let availability = ev.events[0].availability;
  //     let obj = { date: date, availability: availability, adventure: this.adventure };
  //     console.log(obj);
  //     let modal = this.modalCtrl.create(CheckoutPage, obj)
  //     modal.present();
  //   } else {
  //     console.log("Unreserved day");
  //   }
  // }

  //Wish
  wish() {
    this.loading.present();
    let data = {
      ownerId: this.user.uid,
      adventureId: this.adventure.id
    }
    this.firebaseService.createWish(data)
      .then((docRef) => {
        this.loading.dismiss()
        this.wishIcon = true;
        this.wishId = docRef.id;
      })
  }

  //Fill wish
  verifyWish() {
    this.firebaseService.getWish(this.user.uid, this.adventure.id)
      .subscribe((result) => {
        if (result.length != 0) {
          this.wishIcon = true;
          this.wishId = result[0].$key;
        }
      })
  }

  //Remove wish
  removeWish() {
    this.loading.present();
    this.firebaseService.deleteWish(this.wishId)
      .then((res) => {
        this.loading.dismiss();
        this.wishIcon = false;
      })
  }

  //Talk to local
  talk() {
    this.loading.present();

    let currentUser = this.user.uid;
    let friendUser = this.adventure.ownerId;

    this.firebaseService.findContact(currentUser, friendUser)
      .subscribe(
        (res) => {
          //If chat exist
          if (res.length != 0) {
            this.firebaseService.getContactsSpecific(currentUser, friendUser)
              .subscribe((results) => {
                //Go to message page with this created contact
                let modal = this.modalCtrl.create(MessagePage, { contact: results[0] });
                modal.present();
                this.loading.dismiss();
              })
          }
          //If chat does exist
          else {
            //Create chat
            let contact1 = {
              fromOwnerId: currentUser,
              toOwnerId: friendUser
            };
            let contact2 = {
              fromOwnerId: friendUser,
              toOwnerId: currentUser
            };

            this.firebaseService.createContact(contact1)
              .then(() => {
                this.firebaseService.createContact(contact2)
                  .then(() => {
                    this.firebaseService.getContactsSpecific(currentUser, friendUser)
                      .map((results) => {
                        let modal = this.modalCtrl.create(MessagePage, { contact: results[0] });
                        modal.present();
                        this.loading.dismiss();
                      })
                  })
              })
          }
        })
  }

  abrvName(name) {
    let finalName = name[0] + ".";
    return finalName;
  }

  share() {
    this.socialSharing.share('Hello!! take a look at this incredible adventure', this.user.firstName, null, 'https://lyfx.co/adventure/' + this.adventure.id)
  }

}
