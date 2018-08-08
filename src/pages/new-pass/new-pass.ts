import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiServices } from '../../providers/api-services';
import { LoadingProvider } from '../../providers/loading';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-new-pass',
  templateUrl: 'new-pass.html',
})
export class NewPassPage {

  newPass = '';
  userId;
  user = {
    password: '',
    updatePassword: true
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public apiServices: ApiServices,
    private loading: LoadingProvider,
    public alertCtrl: AlertController,
    private storage: Storage
  ) {
    this.getUserData();
  }

  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.userId = currentUser._id;
      })
  }

  back() {
    this.viewCtrl.dismiss();
  }

  save() {
    if (this.newPass != '') {
      this.loading.present();
      this.user.password = this.newPass;
      this.user.updatePassword = false;
      this.apiServices.editUser(this.userId, this.user)
        .subscribe(
        (result) => {
          this.loading.dismiss();
          this.back();
        })
    }
  }

  ionViewDidLoad() {
  }

}
