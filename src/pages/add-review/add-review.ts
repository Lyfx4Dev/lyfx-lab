import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-add-review',
  templateUrl: 'add-review.html',
})
export class AddReviewPage {

  message;
  rating = 5;
  iconsRating = {
    safety: 1,
    localKnowledge: 1,
    cost: 1,
    punctuality: 1
  }
  user;
  owner;
  adventure;
  step = 1;
  targetType;
  targetId;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private loading: LoadingProvider,
    public viewCtrl: ViewController,
    private firebaseService: FirebaseService
  ) {
    this.loading.present();
    if(this.navParams.get("idLocal")) {
      this.firebaseService.getCurrentUser(this.navParams.get("idLocal"))
      .then((res) => {
        this.loading.dismiss();
        this.owner = res;
        this.targetType = "local";
        this.targetId = res.uid;
      });
    } else {
      this.adventure = this.navParams.get('adventure');
      this.targetType = "adventure";
      this.targetId = this.adventure.id;
      this.getUserData();
      this.getAdventureOwner();
    }
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
      })
  }

  getAdventureOwner() {
    this.firebaseService.getCurrentUser(this.adventure.ownerId)
    .then((res) => {
      this.loading.dismiss();
      this.owner = res;
      this.adventure.user = res;
      if (this.adventure.user.avatar === 'default') {
        this.adventure.user.avatar = "https://firebasestorage.googleapis.com/v0/b/lyfx-cab40.appspot.com/o/Images%2FProfile%2Fdefault-user.png?alt=media&token=48b4dae0-6611-4665-ba5d-3aeb2e19108b"
      }
    });
  }

  next() {
    if(this.rating < 4) {
      this.step += 1;
    } else {
      this.step += 2;
    }

    if(this.step == 3) {
      this.createReview();
      setTimeout(() => {
        this.viewCtrl.dismiss();
      }, 3000);
    }
  }

  createReview() {
    this.loading.present();
    let data = {
      iconsRating: this.iconsRating,
      message: this.message,
      rating: this.rating,
      targetType: this.targetType,
      targetId: this.targetId,
      ownerId: this.user.uid
    };
    this.firebaseService.createReview(data)
      .then((res) => {
        this.loading.dismiss()
        this.viewCtrl.dismiss();
      })
  }

  ionViewDidLoad() {
     //Analytics log
     this.firebaseService.eventPageView('Add review page');
  }

}
