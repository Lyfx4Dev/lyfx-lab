import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, ModalController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../tabs/tabs';
import { FCM } from '@ionic-native/fcm';
import { UserTypePage } from '../user-type/user-type';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-auth',
  templateUrl: 'auth.html',
})
export class AuthPage {

  show;
  signinForm = {
    email: '',
    password: '',
    strategy: 'local'
  };
  signupForm = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    avatar: "https://firebasestorage.googleapis.com/v0/b/lyfx-cab40.appspot.com/o/Images%2FProfile%2Fdefault-user.png?alt=media&token=48b4dae0-6611-4665-ba5d-3aeb2e19108b",
    affiliate: ''
  }
  affiliateUser = null;
  affiliateInput: string = '@'
  affiliateUserLogged: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public keyboard: Keyboard,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private loading: LoadingProvider,
    private storage: Storage,
    private firebaseService: FirebaseService,
    private fcm: FCM,
    private facebook: Facebook
  ) {

    //Deeplink
    if (this.navParams.data != null && this.navParams.data.nickname != null) {
      storage.get('currentUser')
        .then((user) => {
          if (user) {
            if (user.affiliate == null || user.affiliate === "") {
              this.alertCtrl.create({
                title: 'Oops!',
                enableBackdropDismiss: false,
                subTitle: 'Do you want to join this user?',
                buttons: [{
                  text: 'Ok',
                  handler: () => {
                    this.affiliateUserLogged = true;
                    this.affiliateInput = '@' + this.navParams.data.nickname;
                    this.pressAffiliateInput();
                    this.show = 'signup-1';
                  }
                },
                {
                  text: 'Cancel',
                  handler: () => {
                    this.navCtrl.setRoot(TabsPage);
                  }
                }
                ]
              }).present();
            }
            else // ja é filiado
            {
              this.alertCtrl.create({
                title: 'Oops!',
                enableBackdropDismiss: false,
                subTitle: 'User is already affiliated!',
                buttons: [{
                  text: 'Ok',
                  handler: () => {
                    this.navCtrl.setRoot(TabsPage);
                  }
                }]
              }).present();
            }
          }
          else {
            this.affiliateInput = '@' + this.navParams.data.nickname;
            this.pressAffiliateInput();
            this.show = 'signup-2';
          }
        });
    }
    else
    {
      //Set show var to signin
      this.show = 'signin';
    }
    //On keyboard show
    this.keyboard.onKeyboardShow().subscribe(() => {
      let fabs = document.getElementsByTagName('ion-fab');
      let i = 0;
      for (i; i < fabs.length; i++) {
        fabs[i].classList.add('top-fab-button');
      }
    });

    //On keyboard hide
    this.keyboard.onKeyboardHide().subscribe(() => {
      let fabs = document.getElementsByTagName('ion-fab');
      let i = 0;
      for (i; i < fabs.length; i++) {
        fabs[i].classList.remove('top-fab-button');
      }
    });


  }
  selectSearchResult() {
    this.signupForm.affiliate = this.affiliateUser.$key;
    this.show = 'signup-2';
  }

  pressAffiliateInput() {
    if (this.affiliateInput === "")
      this.affiliateInput = '@';
    else {
      this.affiliateUser = null;
      if (this.affiliateInput.length > 5) {
        this.firebaseService.getUserFromNickname(this.affiliateInput.replace("@", "")).subscribe((user: any) => {
          if (user != null && user.length > 0) {
            this.affiliateUser = user[0];
          }
        });
      }
    }
  }
  Skip() {
    this.show = 'signup-2';
  }
  next() {
    if (this.show === 'signin') {
      this.signin()
    }
    else if (this.show === 'signup-1') {

      if (this.affiliateInput != "@") {
        if (this.affiliateUser === null) {
          this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'User not found!',
            buttons: [{
              text: 'Ok',
              handler: () => {
                if (!this.affiliateUserLogged) {
                  this.show = 'signup-2';
                }
                else {
                  this.signin();
                }
              }
            },]
          }).present();
          this.signupForm.affiliate = "";
        }
        else {
          this.signupForm.affiliate = this.affiliateUser.$key;
          if (!this.affiliateUserLogged) {
            this.show = 'signup-2';
          }
          else {
            this.signin();
          }
        }
      }
      else {
        this.signupForm.affiliate = "";
        this.show = 'signup-2';
      }
    }
    else if (this.show === 'signup-2') {
      this.show = 'signup-3';
    }
    else if (this.show === 'signup-3') {
      this.show = 'signup-4';
    }
    else if (this.show === 'signup-4') {
      this.signup();
    }
  }

  toCreateAccount() {
    this.show = 'signup-1';
  }

  //Signin
  signin() {
    //Verify fields
    if (this.signinForm.email && this.signinForm.password) {
      //Create loading
      this.loading.present();
      //Firebase login
      this.firebaseService.login(this.signinForm)
        .then((res) => {
          this.saveUserData(res.uid);
        })
        //Error messages
        .catch((err) => {
          // console.log(err)
          this.loading.dismiss();
          let alert;
          //Wrong password
          if (err.code === 'auth/wrong-password') {
            alert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: "The password is invalid.",
              buttons: ['Ok']
            });
          }
          else if (err.code === 'auth/user-not-found') {
            alert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: "User not found.",
              buttons: ['Ok']
            });
          }
          else {
            alert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: "Please, try again.",
              buttons: ['Ok']
            });
          }
          alert.present();
        })
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: "Please, complete all fields.",
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  //Save user data
  saveUserData(uid) {
    // console.log('logado!')
    //FCM token
    this.fcm.getToken().then(token => {
      let data = { fcmToken: token };
      this.firebaseService.saveUser(data)
        .then(() => {
          this.firebaseService.getCurrentUser(uid)
            .then((res) => {
              this.storage.set('currentUser', res)
                .then((res) => {
                  this.loading.dismiss();
                  //Go to tabs page
                  this.navCtrl.setRoot(TabsPage);
                  this.checkDataInURLToContinue();
                })
            })
        })
    })
      .catch(() => {
        this.firebaseService.getCurrentUser(uid)
          .then((res) => {
            this.storage.set('currentUser', res)
              .then((res) => {
                this.loading.dismiss();
                //Go to tabs page
                this.navCtrl.setRoot(TabsPage);
                this.checkDataInURLToContinue();
              })
          })
      })
  }
  saveUserDataSingup(uid) {
    this.firebaseService.getCurrentUser(uid)
      .then((res) => {
        this.storage.set('currentUser', res)
          .then((res) => {
            this.loading.dismiss();
            //Go to tabs page
            this.navCtrl.setRoot(UserTypePage);
            this.checkDataInURLToContinue();
          })
      })
  }

  checkDataInURLToContinue() {
    if (this.navParams.get("to") == 'AddReviewPage') {
      let modal = this.modalCtrl.create('AddReviewPage', this.navParams.get("params"));
      modal.present();
    } else if (this.navParams.get("to") == 'AdventurePage') {
      let modal = this.modalCtrl.create('AdventurePage', this.navParams.get("params"));
      modal.present();
    }
  }

  //Signup
  signup() {
    //Verify fields
    if (this.signupForm.email && this.signupForm.firstName && this.signupForm.lastName && (this.signupForm.password.length >= 6)) {
      //Create loading
      this.loading.present();
      //FCM token
      this.fcm.getToken().then(token => {
        this.firebaseService.register(this.signupForm)
          .then((res) => {
            let data = {
              firstName: this.signupForm.firstName,
              lastName: this.signupForm.lastName,
              avatar: this.signupForm.avatar,
              email: this.signupForm.email,
              uid: res.uid,
              fcmToken: token
            };
            //Create user on firestore
            this.firebaseService.postUser(data)
              .then(() => {
                this.saveUserDataSingup(res.uid);
                //Analytics log
                this.firebaseService.eventNewUser(data.uid, data.email);
                //Facebook log
                this.facebook.logEvent('COMPLETED_REGISTRATION');
              })
          })
          //Error messages
          .catch((err) => {
            this.loading.dismiss();
            let alert;
            if (err.code === 'auth/email-already-exists') {
              alert = this.alertCtrl.create({
                title: 'Oops!',
                subTitle: "Email already exists.",
                buttons: ['Ok']
              });
            }
            else {
              alert = this.alertCtrl.create({
                title: 'Oops!',
                subTitle: "Please, try again.",
                buttons: ['Ok']
              });
            }
            alert.present();
          })
      })
    }
    else {

      let alert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: "Please, complete all fields.",
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  //Back
  back() {
    if (this.show === 'signup-1') {
      if (this.affiliateUserLogged) {
        this.navCtrl.setRoot(TabsPage);
      } else {
        this.show = 'signin'
      }
    }
    else if (this.show === 'signup-2') {
      this.show = 'signup-1'
    }
    else if (this.show === 'signup-3') {
      this.show = 'signup-2'
    }
    else if (this.show === 'signup-4') {
      this.show = 'signup-3'
    }
  }

  //Forgot password
  forgot() {
    if (this.signinForm.email != '') {
      this.loading.present();
      this.firebaseService.resetPassword(this.signinForm.email)
        .then((res) => {
          this.loading.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Check your email',
            subTitle: "We've sent you a new password for your email.",
            buttons: ['Ok']
          });
          alert.present();
        })
    }
    else {
      this.loading.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Oops',
        subTitle: "Please, complete your email.",
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  ionViewDidLoad() {
  }

  loginFacebook() {
    this.loading.present();
    this.facebook.login(['public_profile', 'email'])
      .then((res: FacebookLoginResponse) => {
        // this.facebook.api("/" + res.authResponse.userID + "?fields=id,name,picture.width(9999){url},email", [])
        this.facebook.api("/" + res.authResponse.userID + "/?fields=id,name,email,picture.type(large)", [])
          .then(data => {
            firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken))
              .then((dataFirebase) => {
                let dataUser = {
                  firstName: data.name,
                  lastName: "",
                  avatar: data.picture.data.url,
                  email: data.email,
                  uid: dataFirebase.uid
                };
                //Create user on firestore
                this.firebaseService.postUser(dataUser)
                  .then((res) => {
                    this.loading.dismiss();
                    this.saveUserData(dataFirebase.uid);
                  });
              })
              .catch((e) => {
                this.loading.dismiss();
                if (e.code == "auth/account-exists-with-different-credential") {
                  let alert = this.alertCtrl.create({
                    title: 'Oops!',
                    subTitle: "E-mail already registered! login with email and password.",
                    buttons: ['Ok']
                  });
                  alert.present();
                } else {
                  let alert = this.alertCtrl.create({
                    title: 'Oops!',
                    subTitle: "Please, try again.",
                    buttons: ['Ok']
                  });
                  alert.present();
                }
              });
          })
          .catch((e) => {
            console.log(e)
            this.loading.dismiss();
            let alert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: "Permission needed to continue.",
              buttons: ['Ok']
            });
            alert.present();
          });
      })
      .catch((e) => {
        this.loading.dismiss();
        let alert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: "Please, try again. ",
          buttons: ['Ok']
        });
        alert.present();
      });
  }
}
