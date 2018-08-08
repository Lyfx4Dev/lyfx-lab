import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { ImagesUpload } from '../../providers/images-upload';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  bigImg = null;
  smallImg = null;
  user;
  editPhoto = false;
  imageUpload;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public viewCtrl: ViewController,
    private camera: Camera,
    private storageImages: ImagesUpload,
    private loading: LoadingProvider,
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

        if (!this.user.avatar) {
          this.user.avatar = '/assets/imgs/avatar-icon.png';
        }
        //Add prefix to nickname
        if (this.user.nickname) {
          this.transformNickname();
        }
      })
  }

  //Close modal
  back() {
    this.viewCtrl.dismiss()
  }

  save() {
    this.loading.present();
    if (this.user.nickname) {
      this.user.nickname = this.user.nickname.replace(/lyfx.co/g, '');
      this.user.nickname = this.user.nickname.replace(/[^a-zA-Z0-9]/g, '');
      this.firebaseService.getUserFromNickname(this.user.nickname)
        .subscribe(
          (res) => {
            //Username exist
            if (res.length > 0) {
              if (res[0].$key === this.user.uid) {
                this.saveUser();
              }
              else {
                this.loading.dismiss();
                let alert = this.alertCtrl.create({
                  title: 'Oops',
                  subTitle: "This nickname already exists.",
                  buttons: ['Ok']
                });
                alert.present();
              }
            }
            //Username dont exist
            else {
              this.saveUser();
            }
          })

    }
    else {
      this.saveUser();
    }
  }

  saveUser() {
    this.firebaseService.saveUser(this.user)
      .then(
        (result) => {
          //Update user on local storage
          this.saveUserData(this.user.uid);
        })
  }

  //Save user data
  saveUserData(uid) {
    this.firebaseService.getCurrentUser(uid)
      .then((res) => {
        this.storage.set('currentUser', res)
          .then(() => {
            this.loading.dismiss();
            this.back();
          })
      })
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Edit profile page');
  }

  //Nickname
  transformNickname() {
    let txt = this.user.nickname.toLowerCase();
    this.removeSpecialChar(txt);
  }

  removeSpecialChar(txt) {
    let txt2 = txt.replace(/lyfx.co/g, '');
    this.user.nickname = "lyfx.co/" + txt2.replace(/[^a-zA-Z0-9]/g, '');
  }

  pegarFoto() {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: true,
      targetWidth: 900,
      targetHeight: 900
    }).then(imageData => {
      let base64data = 'data:image/jpeg;base64,' + imageData;
      this.bigImg = base64data;
      //Get image size
      this.createThumbnail();
    }, error => {
    });
  }

  createThumbnail() {
    let load = this.loading;
    load.present()

    this.generateFromImage(this.bigImg, 1000, 1000, 100, data => {
      this.smallImg = data;
      let imgToUp = this.smallImg.split(',')[1];
      // console.log(imgToUp);
      this.storageImages.uploadPhoto(imgToUp, this.user.uid, 'Profile')
        .then((savedPicture) => {
          load.dismiss();
          this.user.avatar = savedPicture.downloadURL;
          this.imageUpload = this.user.avatar;
          this.editPhoto = true;
        })
        .catch((err) => {
          load.dismiss()
        })
    });
  }

  generateFromImage(img, MAX_WIDTH, MAX_HEIGHT, quality, callback) {
    var canvas: any = document.createElement("canvas");
    var image = new Image();
    image.onload = () => {
      var width = image.width;
      var height = image.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);
      // IMPORTANT: 'jpeg' NOT 'jpg'
      var dataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(dataUrl)
    }
    image.src = img;
  }


}
