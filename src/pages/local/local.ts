import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';
import 'rxjs/add/operator/map';
import { Facebook } from '@ionic-native/facebook';
import { Camera } from '@ionic-native/camera';
import { ImagesUpload } from '../../providers/images-upload';

@IonicPage()
@Component({
  selector: 'page-local',
  templateUrl: 'local.html',
})
export class LocalPage {

  user = {
    zipCode: '',
    phone: '',
    type: '',
    uid: '',
    instagram: '',
    certificate: '',
    local: {
      passionate: '',
      howLong: '',
      howOften: '',
      memorableExperience: '',
      greatLocalExpert: '',
      status: 'pending'
    }
  };
  bigImg = null;
  smallImg = null;
  editPhoto = false;
  imageUpload;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public viewCtrl: ViewController,
    private loading: LoadingProvider,
    public alertCtrl: AlertController,
    private firebaseService: FirebaseService,
    private facebook: Facebook,
    private camera: Camera,
    private storageImages: ImagesUpload,
  ) {
    this.getUserData();
  }

  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user.uid = currentUser.uid;
        if (!this.user.local) {
          this.user.type = 'local';
        }

        if (currentUser.zipCode) { this.user.zipCode = currentUser.zipCode };
        if (currentUser.phone) { this.user.phone = currentUser.phone };
        if (currentUser.certificate) { this.user.certificate = currentUser.certificate };
        if (currentUser.instagram) { this.user.instagram = currentUser.instagram };
        if (currentUser.local) {
          if (currentUser.local.passionate) { this.user.local.passionate = currentUser.local.passionate };
          if (currentUser.local.howLong) { this.user.local.howLong = currentUser.local.howLong };
          if (currentUser.local.howOften) { this.user.local.howOften = currentUser.local.howOften };
          if (currentUser.local.memorableExperience) { this.user.local.memorableExperience = currentUser.local.memorableExperience };
          if (currentUser.local.greatLocalExpert) { this.user.local.greatLocalExpert = currentUser.local.greatLocalExpert };
          if (currentUser.local.status) { this.user.local.status = currentUser.local.status };
        }
      })
  }


  //Close modal
  back() {
    this.viewCtrl.dismiss();
  }

  //Save
  save() {
    this.loading.present();
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
            //Analytics log
            this.firebaseService.eventLocal(res.uid, res.email);
            //Facebook log
            this.facebook.logEvent('BECOME_A_LOCAL')
            let alert = this.alertCtrl.create({
              title: 'Saved',
              subTitle: "Thank you for your interest in becoming a local. We'll talk to you soon.",
              buttons: [
                {
                  text: 'Ok'
                },
              ]
            });
            alert.present();
          })
      })
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Local info page');
  }

  pegarFoto() {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: true,
      // targetWidth: 900,
      // targetHeight: 900
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
          this.user.certificate = savedPicture.downloadURL;
          this.imageUpload = this.user.certificate;
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
