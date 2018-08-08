import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-profile-details',
  templateUrl: 'profile-details.html',
})
export class ProfileDetailsPage {

  user;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public viewCtrl: ViewController,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
  }

  edit(){
    this.viewCtrl.dismiss({edit: true})
  }

  back(){
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Profile details page');
  }


  getUserData(){
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        if (!this.user.avatar) {
          this.user.avatar = '/assets/imgs/avatar-icon.png';
        }
      })
  }

 

}
