import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { LoadingProvider } from '../../providers/loading';
import { ApiServices } from '../../providers/api-services';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { Helpers } from '../../providers/helpers';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
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
export class FilterPage {

  featured;
  adventures = [];
  wishes = [];
  user;
  error = "Oops, it looks loke there's no available.";
  err = false;
  load = false;
  search = false;
  searchFor;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private loading: LoadingProvider,
    public apiServices: ApiServices,
    private helpers: Helpers,
    public modalCtrl: ModalController,
    private storage: Storage,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        this.define();
      })
  }

  define() {
    let type = this.navParams.get('type');
    //Analytics log
    if (type === 'saveds') {
      this.firebaseService.eventPageView('Saveds page');
    }
    else if (type === 'search') {
      this.firebaseService.eventPageView('Search page');
    }

    //Search from categorie
    if (type === 'categorie') {
      this.loading.present();
      let categorie = this.navParams.get('categorie');
      this.featured = categorie + ' adventures';
      this.firebaseService.searchFromCategorie(categorie)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            this.adventures.push(doc.data());
          });
          this.loading.dismiss();
          if (this.adventures.length === 0) {
            this.err = true;
            this.error = "Sorry, we do not have results to display.";
          }
        })

    }
    //Get wishes
    else if (type === 'saveds') {
      this.loading.present();
      //List wishes
      this.firebaseService.getWishes(this.user.uid)
        .subscribe((result) => {
          if (result.length > 0) {
            this.firebaseService.getColWithWishes(this.user.uid)
              .subscribe((res) => {
                let wishes = res;
                let i = 0;
                for (i; i < wishes.length; i++) {
                  if (wishes[i]) {
                    this.adventures.push(wishes[i]);
                  }
                }
                setTimeout(() => {
                  this.load = true;
                  this.loading.dismiss();
                  if (this.adventures.length === 0) {
                    this.err = true;
                    this.error = "It doesn’t look like you have any favorites yet.";
                  }
                }, 800)
              })
          }
          else {
            this.load = true;
            this.loading.dismiss();
            this.err = true;
            this.error = "It doesn’t look like you have any favorites yet.";
          }
        },
          err => { },
          () => {

          }
        )
    }
    else if (type === 'search') {
      let res = this.navParams.get('data');
      this.searchFor = this.navParams.get('searchFor').toUpperCase();
      this.search = true;
      let i = 0;
      for (i; i < res.length; i++) {
        this.adventures.push(res[i]);
      }
    }
  }

  back() {
    this.viewCtrl.dismiss()
  }

  formatPrice(value) {
    return this.helpers.formatPrice(value);
  }

  openAdventure(adventure) {
    let modal = this.modalCtrl.create('AdventurePage', { adventure: adventure });
    modal.present();
  }



}
