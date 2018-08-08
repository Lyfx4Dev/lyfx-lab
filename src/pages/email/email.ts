import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
// import { EmailComposer } from '@ionic-native/email-composer';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-email',
  templateUrl: 'email.html',
})
export class EmailPage {

  message = " ";
  user;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    // private emailComposer: EmailComposer,
    private storage: Storage,
    public alertCtrl: AlertController,
    private firebaseService: FirebaseService
  ) {
    this.getUserData();
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
      })
  }

  back() {
    this.viewCtrl.dismiss();
  }

  // send() {
  //   // this.emailComposer.isAvailable().then((available: boolean) => {
  //   //   if (available) {
  //   //     //Now we know we can send
  //   //   }
  //   // });

  //   let message = "User uid: " + this.user.uid + "<br> User name: " + this.user.firstName + ' ' + this.user.lastName + '<br> User email: ' + this.user.email + '<br><br>' + this.message;

  //     let email = {
  //       to: 'fauzihalabe@gmail.com',
  //       subject: 'Contact from app',
  //       body: message,
  //       isHtml: true
  //     };

  //   // Send a text message using default options
  //   this.emailComposer.open(email).then(() => {
  //     this.back();
  //     let alert = this.alertCtrl.create({
  //       title: 'Yeaah!',
  //       subTitle: 'Message sent. Wait for our return.',
  //       buttons: ['Ok']
  //     });
  //     alert.present();
  //   })
  // }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Contact us page');
  }

}
