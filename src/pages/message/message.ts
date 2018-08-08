import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseService } from '../../providers/firebase';

@IonicPage()
@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
})
export class MessagePage {

  @ViewChild(Content) content: Content;
  contact;
  messages;
  id;
  message = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public viewCtrl: ViewController,
    private loading: LoadingProvider,
    private firebaseService: FirebaseService
  ) {
    this.contact = navParams.get('contact');
    this.getMessages();
    this.getUserData();
  }

  //Close modal
  back() {
    this.viewCtrl.dismiss();
  }

  //Get current user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.id = currentUser.uid;
      })
  }

  //Get messages from firebase
  getMessages() {
    this.firebaseService.getMessages(this.contact.fromOwnerId, this.contact.toOwnerId)
      .subscribe((res) => {
        this.messages = res;
        // Scroll to latest message
        setTimeout(() => {
          this.content.scrollToBottom(300);
        }, 500)
      });
  }

  //Send message
  send() {
    if (this.message != '') {
      this.loading.present();
      let data = {
        "fromOwnerId": this.contact.fromOwnerId,
        "toOwnerId": this.contact.toOwnerId,
        "message": this.message,
        "createdAt": new Date()
      };

      this.firebaseService.postMessageToCurrent(this.contact.fromOwnerId, this.contact.toOwnerId, data)
        .then((res) => {
          this.firebaseService.postMessageToFriend(this.contact.fromOwnerId, this.contact.toOwnerId, data)
            .then((res) => {
              this.loading.dismiss();
              this.message = ''
            })
        })
    }
  }

  ionViewDidLoad() {
    //Analytics log
    this.firebaseService.eventPageView('Message page');
 }

 abrvName(name){
  let finalName = name[0] + ".";
  return finalName;
}


}
