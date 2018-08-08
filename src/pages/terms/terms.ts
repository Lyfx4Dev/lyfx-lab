import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html',
})
export class TermsPage {

  type;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private firebaseService: FirebaseService
  ) {
    this.type = this.navParams.get('type');
  }

  back(){
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Terms page');
  }

}
