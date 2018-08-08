import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../inbox/inbox';
import { LocalCalendarPage } from '../local-calendar/local-calendar';
import { LocalAdventuresPage } from '../local-adventures/local-adventures';

@IonicPage()
@Component({
  selector: 'page-tabs-local',
  templateUrl: 'tabs-local.html',
})
export class TabsLocalPage {

  exploreTab = LocalAdventuresPage;
  profileTab = ProfilePage;
  inboxTab = InboxPage;
  adventuresTab = LocalCalendarPage

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {
  }

  ionViewDidLoad() {
  }

}
