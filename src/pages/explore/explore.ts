import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { ApiServices } from '../../providers/api-services';
import { Helpers } from '../../providers/helpers';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { LoadingProvider } from '../../providers/loading';
import { FilterPage } from '../filter/filter';
import { Geolocation } from '@ionic-native/geolocation';
import { FirebaseService } from '../../providers/firebase';
import { Facebook } from '@ionic-native/facebook';
import { LottieAnimationViewModule } from 'ng-lottie';

@IonicPage()
@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
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
export class ExplorePage {

  filter1Title;
  filter2Title;
  filter3Title;
  adventures = [];
  skip = 0;
  limit = 6;
  categories = [];
  skipCat = 0;
  limitCat = 30;
  header = "";
  near = true;
  inp;
  loadingComplete = false;
  lottieConfig: any;
  first = true;
  tags = [
    { name: 'motorcycle' },
    { name: 'wild life' },
    { name: 'yoga' },
    { name: 'hiking' },
    { name: 'journey' },
    { name: 'running' },
    { name: 'camping' },
    { name: 'ciclyng' },
  ];
  order;
  states = [];
  hikings = [];
  runnings = [];
  cycling = [];
  statesList = [
    ['Arizona', 'AZ'],
    ['Alabama', 'AL'],
    ['Alaska', 'AK'],
    ['Arizona', 'AZ'],
    ['Arkansas', 'AR'],
    ['California', 'CA'],
    ['Colorado', 'CO'],
    ['Connecticut', 'CT'],
    ['Delaware', 'DE'],
    ['Florida', 'FL'],
    ['Georgia', 'GA'],
    ['Hawaii', 'HI'],
    ['Idaho', 'ID'],
    ['Illinois', 'IL'],
    ['Indiana', 'IN'],
    ['Iowa', 'IA'],
    ['Kansas', 'KS'],
    ['Kentucky', 'KY'],
    ['Kentucky', 'KY'],
    ['Louisiana', 'LA'],
    ['Maine', 'ME'],
    ['Maryland', 'MD'],
    ['Massachusetts', 'MA'],
    ['Michigan', 'MI'],
    ['Minnesota', 'MN'],
    ['Mississippi', 'MS'],
    ['Missouri', 'MO'],
    ['Montana', 'MT'],
    ['Nebraska', 'NE'],
    ['Nevada', 'NV'],
    ['New Hampshire', 'NH'],
    ['New Jersey', 'NJ'],
    ['New Mexico', 'NM'],
    ['New York', 'NY'],
    ['North Carolina', 'NC'],
    ['North Dakota', 'ND'],
    ['Ohio', 'OH'],
    ['Oklahoma', 'OK'],
    ['Oregon', 'OR'],
    ['Pennsylvania', 'PA'],
    ['Rhode Island', 'RI'],
    ['South Carolina', 'SC'],
    ['South Dakota', 'SD'],
    ['Tennessee', 'TN'],
    ['Texas', 'TX'],
    ['Utah', 'UT'],
    ['Vermont', 'VT'],
    ['Virginia', 'VA'],
    ['Washington', 'WA'],
    ['West Virginia', 'WV'],
    ['Wisconsin', 'WI'],
    ['Wyoming', 'WY'],
  ];
  step = 0;
  state;
  showAllCategories = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apiServices: ApiServices,
    public modalCtrl: ModalController,
    private helpers: Helpers,
    private loading: LoadingProvider,
    public geolocation: Geolocation,
    private firebaseService: FirebaseService,
    private facebook: Facebook,
    public toastCtrl: ToastController
  ) {
    //Define order
    this.defineOrder();
    // this.currentLocation();
    this.buildFeaturedLabel();
    this.firebaseService.testEmails();
    this.getAdventures();
    this.getCategories();
    //Init lottie
    LottieAnimationViewModule.forRoot();
    this.lottieConfig = {
      path: 'assets/imgs/circle.json',
      autoplay: true,
      loop: true
    }
  }

  getAdventures() {
    this.near = false;
    this.loadingComplete = false;
    // this.loading.present();
    this.firebaseService.getAdventures(this.skip, this.limit, this.order)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          this.adventures.push(item);
        });
        // console.log(this.adventures)
        //Set new skip
        this.skip = this.adventures[this.adventures.length - 1].id;
        //Loading dismiss
        // this.loadingComplete = true;
        this.first = false;
        this.defineStates();
        this.defineHiking();
        this.defineSurfing();
        this.defineCycling();
        // this.loading.dismiss();
      });
  }

  //Define states
  defineStates() {
    let array = [];
    this.firebaseService.getAdventureState()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          array.push(item)
        });

        let items = this.clearStates(array);
        let i = 0;
        let states = [];
        for (i; i < items.length; i++) {
          let state = items[i].destinyState;
          if (state.length < 3) {
            //Get state long name
            let o = 0;
            for (o; o < this.statesList.length; o++) {
              if (state === this.statesList[o][1]) {
                states.push(
                  {
                    stateOriginal: state,
                    state: this.statesList[o][0],
                    adventure: items[i]
                  });
              }
            }
          }
          else {
            states.push(
              {
                stateOriginal: state,
                state: state,
                adventure: items[i]
              });
          }
        };
        states = this.clearStates2(states);
        this.states = states;
        //Loading dismiss
        this.loadingComplete = true;
      });
  }

  //Hiking
  defineHiking() {
    let array = [];
    if (this.step != 3) {
      this.firebaseService.getAdventuresByHiking()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            array.push(item)
          });

          this.hikings = array;
          //Loading dismiss
          this.loadingComplete = true;
        });
    }
    else {
      this.firebaseService.getAdventuresByStateAndCategorieLimit('hiking', this.state)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            array.push(item)
          });

          this.hikings = array;
          //Loading dismiss
          this.loadingComplete = true;
        });
    }

  }

  back(){
    this.step = 0;
  }

  //Filter 1
  viewAll(toFilter) {
    this.filter1Title = toFilter;
    this.loadingComplete = false;
    this.step = 1;
    this.adventures = [];
    let array = [];
    this.firebaseService.getAdventuresToFIlter1(toFilter)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          array.push(item)
        });

        this.adventures = array;
        this.defineNewStates();
        //Loading dismiss
        this.loadingComplete = true;
      });
  }
  defineNewStates() {
    let array = [];
    this.adventures.forEach((doc) => {
      let item = doc;
      array.push(item)
    });

    let items = this.clearStates(array);
    let i = 0;
    let states = [];
    for (i; i < items.length; i++) {
      let state = items[i].destinyState;
      if (state.length < 3) {
        //Get state long name
        let o = 0;
        for (o; o < this.statesList.length; o++) {
          if (state === this.statesList[o][1]) {
            states.push(
              {
                stateOriginal: state,
                state: this.statesList[o][0],
                adventure: items[i]
              });
          }
        }
      }
      else {
        states.push(
          {
            stateOriginal: state,
            state: state,
            adventure: items[i]
          });
      }
    };
    states = this.clearStates2(states);
    this.states = states.reverse();
    //Loading dismiss
    this.loadingComplete = true;
  }

  clear(){
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  //Filter 2
  filter2(stateItem) {
    let state = stateItem.stateOriginal;
    this.step = 2;
    this.filter2Title = stateItem.state;
    this.adventures = [];
    let array = [];
    this.firebaseService.getAdventuresByStateAndCategorie(this.filter1Title, state)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          array.push(item)
        });

        this.adventures = array;
        this.defineNewStates();
        //Loading dismiss
        this.loadingComplete = true;
      });
  }

  //Filter 3
  filter3(stateItem) {
    this.state = stateItem.stateOriginal;
    this.loadingComplete = false;
    this.step = 3;
    this.filter3Title = stateItem.state;
    this.defineHiking();
    this.defineSurfing();
    this.defineCycling();
  }

  showCat(){
    this.showAllCategories = true;
  }
  showLessCat(){
    this.showAllCategories = false;
  }

  //Surfing
  defineSurfing() {
    let array = [];
    if (this.step != 3) {
      this.firebaseService.getAdventuresByRunning()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            array.push(item)
          });

          this.runnings = array;
          //Loading dismiss
          this.loadingComplete = true;
        });
    }
    else {
      this.firebaseService.getAdventuresByStateAndCategorieLimit('running', this.state)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            array.push(item)
          });

          this.runnings = array;
          //Loading dismiss
          this.loadingComplete = true;
        });
    }
  }

  //Cycling
  defineCycling() {
    let array = [];
    if (this.step != 3) {
      this.firebaseService.getAdventuresByCycling()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            array.push(item)
          });

          this.cycling = array;
          //Loading dismiss
          this.loadingComplete = true;
        });
    }
    else {
      this.firebaseService.getAdventuresByStateAndCategorieLimit('cycling', this.state)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            array.push(item)
          });

          this.cycling = array;
          //Loading dismiss
          this.loadingComplete = true;
        });
    }

  }

  clearStates(items) {
    let array = items;
    let clear = this.removeDuplicates(array, "destinyState");
    return clear;
  }

  clearStates2(items) {
    let array = items;
    let clear = this.removeDuplicates(array, "state");
    return clear;
  }

  removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj =>
        mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  defineOrder() {
    let filter = [
      // {
      //   filter: 'title'
      // },
      {
        filter: 'id'
      },
      {
        filter: 'ownerId'
      }
    ];

    this.order = filter[Math.floor(Math.random() * filter.length)].filter;
    console.log("Order by: " + this.order);
  }

  buildFeaturedLabel() {
    let items = [
      {
        text: "EXPERIENCE OUTSIDE",
      },
      {
        text: "ADVENTURES ON-DEMAND",
      },
      {
        text: "STEP OUTSIDE",
      },
      {
        text: "LIFE WON’T WAIT",
      },
      {
        text: "ADVENTURE OR DIE",
      },
      {
        text: "DARE ANYWHERE",
      },
      {
        text: "LIVE OUTSIDE",
      },
      {
        text: "FOREVER EXPLORING",
      },
      {
        text: "BORN TO EXPLORE",
      },
      {
        text: "FIND A PLACE TO GET LOST",
      },
      {
        text: "YOUR PASSION IS OUT THERE",
      },
      {
        text: "WHAT IS YOUR NEXT ADVENTURE?",
      },
      {
        text: "LIVE YOUR PASSION OUT LOUD",
      },
      {
        text: "GO AFTER YOUR PASSION",
      },
      {
        text: "THERE’S NO FINISH LINE IN THE WILD",
      },
      {
        text: "ADVENTURE AWAITS",
      },
      {
        text: "COME OUT AND PLAY",
      },
      {
        text: "REAL EXPERIENCES. REAL PEOPLE",
      },
      {
        text: "LIVE YOUR PASSION",
      },
      {
        text: "SHARE YOUR PASSION WITH THE WORLD",
      },
      {
        text: "WHAT’S STOPPING YOU NOW?",
      },
      {
        text: "HIKE MORE, WORRY LESS",
      },
      {
        text: "NATURE ISN’T A PLACE. IT’S HOME",
      },
      {
        text: "THE MOUNTAINS ARE CALLING AND YOU MUST GO",
      },
      {
        text: "EXPLORE AND DISCOVER",
      },
      {
        text: "THE BEST VIEWS COME AFTER THE HARDEST CLIMB",
      },
      {
        text: "BLESSED ARE THE ADVENTUROUS",
      },
      {
        text: "LET’S WANDER WHERE WI-FI IS WEAK",
      },
      {
        text: "TO TRAVEL IS TO LIVE",
      },
      {
        text: "REAL FREEDOM LIES IN WILDERNESS",
      },
      {
        text: "AND SO… THE ADVENTURE BEGINS",
      },
      {
        text: "ADVENTURE STARTS WHERE PLANS ENDS",
      },
      {
        text: "BE FEARLESS",
      },
      {
        text: "MAKE EVERYDAY AN ADVENTURE",
      },
      {
        text: "LIVE. LEARN. HOPE.",
      },
      {
        text: "THE ART OF LOSTNESS",
      },
      {
        text: "ADVENTURE IS WORTHWHILE",
      },
      {
        text: "COLLECT MOMENTS, NOT THINGS",
      },
      {
        text: "watch more sunsets than netflix",
      },
    ]
    this.header = items[Math.floor(Math.random() * items.length)].text;
  }

  //Refresh page
  refresh(refresher) {
    refresher.complete();
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  // getAdventures() {
  //   this.near = false;
  //   this.header = 'Adventures';
  //   this.loading.present();
  //   this.skip = this.adventures.length + this.skip;
  //   this.apiServices.getExperiences(this.skip, this.limit)
  //     .subscribe(
  //     (result) => {
  //       let res = JSON.parse(JSON.stringify(result));
  //       let i = 0;
  //       let length = res.data.length;
  //       for (i; i < length; i++) {
  //         this.adventures.push(res.data[i]);
  //       }
  //       this.loading.dismiss();
  //     })
  // }

  getCategories() {
    this.firebaseService.getCategories()
      .subscribe(
        (res) => {
          console.log(res)
          this.categories = res;
        })
  }

  formatPrice(value) {
    return this.helpers.formatPrice(value);
  }

  openAdventure(adventure) {
    let modal = this.modalCtrl.create('AdventurePage', { adventure: adventure });
    modal.present();
  }

  //Open filter modal
  openFilter(categorie) {
    let obj = { type: 'categorie', categorie: categorie };
    let modal = this.modalCtrl.create(FilterPage, obj);
    modal.present();
  }

  //Show more
  showMore(infiniteScroll) {
    //Facebook log
    this.facebook.logEvent('SHOW_MORE_EXPLORE_PAGE')
    // if (this.near) {
    //   this.currentLocation()
    // }
    // else {
    // this.getAdventures();
    // }

    this.loadingComplete = false;
    // this.loading.present();
    this.firebaseService.getAdventures(this.skip, this.limit, this.order)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let item = doc.data();
          this.adventures.push(item);
        });
        //Set new skip
        this.skip = this.adventures[this.adventures.length - 1][this.order];
        this.loadingComplete = true;
        infiniteScroll.complete()
      });
  }

  // currentLocation() {
  //   this.geolocation.getCurrentPosition().then((resp) => {
  //     this.header = 'Near you';
  //     this.near = true;
  //     let lat = resp.coords.latitude;
  //     let long = resp.coords.longitude;
  //     //Create loading
  //     this.loading.present();
  //     this.skip = this.adventures.length + this.skip;
  //     this.apiServices.getAdventuresByGeolocation(lat, long, this.skip, this.limit)
  //       .subscribe(
  //       (result) => {
  //         let res = JSON.parse(JSON.stringify(result));
  //         if (res.length != 0) {
  //           let i = 0;
  //           let length = res.data.length;
  //           //Dismiss loading
  //           this.loading.dismiss();
  //           if (res.data != undefined) {
  //             for (i; i < length; i++) {
  //               this.adventures.push(res.data[i]);
  //             }
  //           }
  //           else {
  //             this.loading.dismiss();
  //             this.getAdventures();
  //           }
  //         }
  //         else {
  //           this.loading.dismiss();
  //           this.getAdventures();
  //         }
  //       },
  //       err => {
  //         this.loading.dismiss();
  //         this.getAdventures();
  //       }
  //       )
  //   }).catch((error) => {
  //     this.getAdventures();
  //   });
  // }

  doInfinite(infiniteScroll) {
    this.showMore(infiniteScroll);
  }

  // Search
  search() {
    this.loading.present();
    let keyword = this.inp;

    this.apiServices.searchAdv(keyword)
      .then((result: any) => {
        let data = result;
        let hits = data.hits;
        // let total = hits.total;
        let items = hits.hits;
        let i = 0;
        const promises = [];
        if (items.length != 0) {
          for (i; i < items.length; i++) {
            let id = items[i]._id;
            promises.push(
              this.firebaseService.getAdventure(id)
            );
          }
          Promise.all(promises).then((res) => {
            let i = 0;
            let array = [];
            for (i; i < res.length; i++) {
              res[i].forEach(doc => {
                let adv = doc.data();
                array.push(adv);
              });
            };

            console.log(array)
            if (array.length != 0) {
              let obj = { type: 'search', data: array, searchFor: this.inp };
              let modal = this.modalCtrl.create(FilterPage, obj);
              modal.present();
              this.loading.dismiss();
              this.inp = "";
            }
            else {
              this.inp = "";
              this.loading.dismiss();
              let toast = this.toastCtrl.create({
                message: 'Sorry. No results for this search.',
                duration: 1500
              });
              toast.present();
            }

          })
        }
        else {
          this.inp = "";
          this.loading.dismiss();
          let toast = this.toastCtrl.create({
            message: 'Sorry. No results for this search.',
            duration: 1500
          });
          toast.present();
        }
      })
  }

  ionViewDidLoad() {
    this.firebaseService.eventPageView('Explore page');
  }

}
