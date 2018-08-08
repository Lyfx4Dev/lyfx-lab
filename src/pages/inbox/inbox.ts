import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../providers/firebase'
import { MessagePage } from '../message/message';
import { LoadingProvider } from '../../providers/loading';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {

  user;
  limit = 30;
  contacts = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public fireService: FirebaseService,
    public modalCtrl: ModalController,
    public loading: LoadingProvider
  ) {
    this.loading.present()
    this.getUserData();
  }

  //Get current user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
        this.getContacts();
      })
  }

  //List user contacts
  getContacts() {
    this.fireService.getContacts(this.user.uid)
      .subscribe((res) => {
        if (res.length != 0) {
          this.fireService.getContactsWithCol(this.user.uid)
            .subscribe((result) => {
              this.contacts = result;
              this.getRecents();
            })
        }
        else {
          this.loading.dismiss();
        }
      })
  }

  getRecents() {
    let i = 0;
    for (i; i < this.contacts.length; i++) {
      let contact = this.contacts[i];
      this.fireService.getRecent(this.contacts[i])
        .subscribe((result) => {
          if (result[0]) {
            contact.recentMessage = result[0].message;
            let date = new Date(result[0].createdAt.seconds * 1000);
            contact.recentMessageDate = date;
          }
          else {
            contact.recentMessage = 'No message';
          }
        })
    };

    //Order contats by last message date 
    setTimeout(() => {
      this.contacts.sort(this.compare).reverse();
      this.loading.dismiss();
    }, 500)
  }

  compare(a, b) {
    var dateA = a.recentMessageDate, dateB = b.recentMessageDate;
    return dateA - dateB;
  }

  //Open message
  openMessage(contact) {
    let modal = this.modalCtrl.create(MessagePage, { contact: contact });
    modal.present();
  }

  ionViewDidLoad() {
    //Analytics log
    this.fireService.eventPageView('Inbox page');
 }

  //Refresh page
  refresh(refresher) {
    refresher.complete();
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  abrvName(name){
    let finalName = name[0] + ".";
    return finalName;
  }

  
}
