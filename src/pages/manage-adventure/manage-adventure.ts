import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { LoadingProvider } from '../../providers/loading';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { ImagesUpload } from '../../providers/images-upload';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
declare var google;
import { FirebaseService } from '../../providers/firebase';
import { Facebook } from '@ionic-native/facebook';

@IonicPage()
@Component({
  selector: 'page-manage-adventure',
  templateUrl: 'manage-adventure.html',
})
export class ManageAdventurePage {

  adventure = {
    adventures: '',
    title: '',
    description: '',
    gear: '',
    minAge: '18',
    travellers: '2',
    duration: '4',
    destinyCity: '',
    destinyState: '',
    destinyCountry: '',
    price: '',
    hour: '',
    difficulty: '',
    localExpert: '',
    stateLongName: '',
    status: 'pending',
    previousStatus: '',
    originId: '',
    meetingId: '',
    destinyId: '',
    id: ''
  };
  adventureId;
  availability = [];
  categories = [];
  step = 1;
  //Maps
  fillMapId;
  marker;
  map: any;
  markers = [];
  GoogleAutocomplete: any;
  GooglePlaces: any;
  geocoder: any
  //Pos
  destinyLat;
  destinyLong;
  //Places id
  meetingPlaceId;
  originPlaceId;
  destinyPlaceId;
  //Autocomplete
  autocompleteItems = [];
  autocomplete = {
    input: '',
    input2: ''
  };
  optionsAutocomplete;
  //Calendar
  date;
  eventSource = [];
  viewTitle: string;
  selectedDay = new Date();
  event = { startTime: new Date().toISOString(), endTime: new Date().toISOString(), allDay: false };
  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };
  //Exceptions
  exceptions_week_day = [];
  prevEvents = [];
  check = {
    dom: false,
    seg: false,
    ter: false,
    quar: false,
    quin: false,
    sext: false,
    sab: false
  };
  //Hour
  clear = false;
  showHour = true;
  toCombine = false;
  //Gallery
  galleryApp = [];
  bigImg = null;
  smallImg = null;
  user;
  edit = false;
  memory = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loading: LoadingProvider,
    public ngZone: NgZone,
    public geolocation: Geolocation,
    public alertCtrl: AlertController,
    private camera: Camera,
    private storageImages: ImagesUpload,
    private storage: Storage,
    public viewCtrl: ViewController,
    private firebaseService: FirebaseService,
    private facebook: Facebook
  ) {
    this.getCategories();
    this.getUserData();
    let edit = this.navParams.get('edit');
    this.edit = edit;
    if (edit === true) {
      let adventure = this.navParams.get('adventure');
      this.fillData(adventure);
    }
  }

  formatPrice(price) {
    //Format price
    let newPrice = (price / 100).toFixed(2);
    return newPrice
  }

  //Fill data / Edit adventure
  fillData(adventure) {
    this.adventure = adventure;
    this.adventureId = adventure.id;
    this.adventure.id = adventure.id;
    //Get location
    this.fillMapId = adventure.destinyId;
    //Fill calendar
    if (adventure.exceptions_date.length > 0) {
      let i = 0;
      for (i; i < adventure.exceptions_date.length; i++) {
        let d = adventure.exceptions_date[i].date;
        let day = d.split("T");
        this.availability.push({ date: day[0] });
      };
      setTimeout(() => {
        this.fillDates();
      }, 300);
    }
    if (adventure.exceptions_week_day) {
      this.exceptions_week_day = adventure.exceptions_week_day;
    }
    //Fill gallery
    let i = 0;
    for (i; i < adventure.gallery.length; i++) {
      let obj = { id: adventure.gallery[i].image };
      this.galleryApp.push(obj);
    }
    //Fill hour
    if (adventure.observation) {
      this.adventure.hour = adventure.observation;
      if (this.adventure.hour === 'To combine') {
        this.showHour = false;
        this.toCombine = true;
      }
    }
  }

  fillDates() {
    if (this.exceptions_week_day) {
      let i = 0;
      for (i; i < this.exceptions_week_day.length; i++) {
        if (this.exceptions_week_day[i] === 0) {
          this.check.dom = true;
        }
        else if (this.exceptions_week_day[i] === 1) {
          this.check.seg = true;
        }
        else if (this.exceptions_week_day[i] === 2) {
          this.check.ter = true;
        }
        else if (this.exceptions_week_day[i] === 3) {
          this.check.quar = true;
        }
        else if (this.exceptions_week_day[i] === 4) {
          this.check.quin = true;
        }
        else if (this.exceptions_week_day[i] === 5) {
          this.check.sext = true;
        }
        else if (this.exceptions_week_day[i] === 6) {
          this.check.sab = true;
        }
      }
    }

    if (this.availability) {
      let e = 0;
      for (e; e < this.availability.length; e++) {
        let sp = this.availability[e].date.split('T');
        let day = moment(sp[0], moment.ISO_8601).toISOString();
        // Push to calendar events
        let event = {
          title: day,
          startTime: new Date(day),
          endTime: new Date(day),
          allDay: true
        };

        this.prevEvents.push(event);
        this.eventSource = [];
        setTimeout(() => {
          this.eventSource = this.prevEvents;
        }, 300);
      }
    }
  }

  fillMap() {
    this.geocoder.geocode({ 'placeId': this.fillMapId }, (results, status) => {
      if (status === 'OK' && results[0]) {
        let marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        let adr = results[0].formatted_address;
        this.ngZone.run(() => {
          this.autocomplete.input = adr;
          this.autocomplete.input2 = this.adventure.destinyCity + ' - ' + this.adventure.destinyState;
        });

        this.markers.push(marker);
        this.map.setCenter(results[0].geometry.location);
      }
    })
  }

  //Get user data
  getUserData() {
    this.storage.get('currentUser')
      .then((currentUser) => {
        this.user = currentUser;
      })
  }

  //Init google maps
  initGoogleMaps() {
    this.geocoder = new google.maps.Geocoder;
    let elem = document.createElement("div");
    this.GooglePlaces = new google.maps.places.PlacesService(elem);
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    setTimeout(() => {
      this.loadMap();

      //Fill map
      if (this.edit === true || this.memory === true) {
        this.fillMap();
      }
    }, 200)
  }

  getCategories() {
    this.loading.present();
    this.firebaseService.getCategories()
      .subscribe(
        (res) => {
          this.loading.dismiss();
          this.categories = res;
        })
  }

  //Verify steps
  verifySteps() {
    if (this.step === 5) {
      this.initGoogleMaps();
    }

  }
  saveObjMemory() {
    //Organize gallery
    let data = [];
    let i = 0;
    let length = this.galleryApp.length;
    for (i; i < length; i++) {
      data.push({ "image": this.galleryApp[i].id, "order": i });
    }
    let adventure
    adventure = {
      "title": this.adventure.title,
      "description": this.adventure.description,
      "stateLongName": this.adventure.stateLongName,
      "price": this.adventure.price,
      "duration": this.adventure.duration,
      "travellers": this.adventure.travellers,
      "gear": this.adventure.gear,
      "requirements": [],
      "minAge": this.adventure.minAge,
      "originId": this.originPlaceId,
      "meetingId": this.meetingPlaceId,
      "destinyId": this.destinyPlaceId,
      "destinyCity": this.adventure.destinyCity,
      "destinyState": this.adventure.destinyState,
      "destinyCountry": this.adventure.destinyCountry,
      "certifications": [],
      "languages": [],
      "exceptions_date": this.availability,
      "exceptions_week_day": this.exceptions_week_day,
      "gallery": data,
      "observation": this.adventure.hour,
      "status": this.adventure.status,
      "ownerId": this.user.uid,
      "ownerEmail": this.user.email,
      "difficulty": this.adventure.difficulty,
      "adventures": this.adventure.adventures,
      "localExpert": this.adventure.localExpert,
      "socialSecurity": "000",
      "warnings": "none",
      "location": { "type": "Point", "coordinates": [this.destinyLat, this.destinyLong] }
    };
    for (var key in adventure) {
      if (adventure.hasOwnProperty(key)) {
        if (!adventure[key]) {
          adventure[key] = "";
        }
      }
    }
    if (!adventure.location.coordinates[0]) {
      adventure.location.coordinates[0] = '';
      adventure.location.coordinates[1] = '';
    }
    let obj = {
      "adventure": adventure,
      "step": this.step,
      "edit": this.edit
    }
    this.storage.set("manage", obj);
  }
  //Next
  next() {
    let futureStep = this.step + 1;
    if (futureStep < 12) {
      this.step = this.step + 1;
      this.verifySteps();
    }
    else if (futureStep === 12) {
      if (this.galleryApp.length < 4) {
        let alert = this.alertCtrl.create({
          title: 'Ops!',
          subTitle: 'Please select a minimum of 4 pictures and remember to show people and some action.',
          buttons: ['Ok']
        });
        alert.present();
      }
      else if (this.galleryApp.length < 4) {
        let alert = this.alertCtrl.create({
          title: 'Ops!',
          subTitle: 'Please select a minimum of 4 pictures and remember to show people and some action.',
          buttons: ['Ok']
        });
        alert.present();
      }
      else if (this.galleryApp.length === 4) {
        this.publish();
      }
    }
    this.saveObjMemory();
  }

  //Back
  back() {
    let futureStep = this.step - 1;
    if (futureStep >= 1) {
      this.step = this.step - 1;
      this.verifySteps();
      this.saveObjMemory();
    }
    else {
      this.storage.remove("manage");
      this.viewCtrl.dismiss()
    }

  }

  ionViewDidLoad() {
    //Analytics log
    this.storage.get("manage").then((obj: any) => {
      if (obj != null) {
        let alert = this.alertCtrl.create({
          title: 'Continue ?',
          message: 'Do you wish to continue ?',
          buttons: [
            {
              text: 'Yes',
              handler: () => {
                this.memory = true;
                this.storage.get("manage").then((obj: any) => {
                  this.fillData(obj.adventure);
                  this.step = obj.step;
                  this.edit = obj.edit;
                  this.verifySteps();
                });
              }
            },
            {
              text: 'No',
              handler: () => {
                this.storage.remove("manage");
              }
            }
          ]
        });
        alert.present();
      }
    });
    this.firebaseService.eventPageView('Create/Edit adventure page');
    setTimeout(() => {
      //Format price
      this.adventure.price = this.formatPrice(this.adventure.price);
    }, 1000)
  }

  loadMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -34.9011, lng: -56.1645 },
      zoom: 6,
      streetViewControl: false,
      disableDefaultUI: true,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#c3bab5"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "none"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e9dfd7"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        }
      ],
    });
    this.currentLocation();
  }

  //Clear markers on maps
  clearMarkers() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

  currentLocation() {
    if (this.markers.length != 0) {
      this.clearMarkers();
    }
    this.geolocation.getCurrentPosition().then((resp) => {
      let pos = {
        lat: resp.coords.latitude,
        lng: resp.coords.longitude
      };
      let marker = new google.maps.Marker({
        position: pos,
        map: this.map,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });
      this.marker = marker
      this.markers.push(marker);
      this.map.setCenter(pos);
      google.maps.event.addListener(marker, 'dragend', () => {
        this.ngZone.run(() => {
          this.loading.present();
          let pos = marker.getPosition();
          this.destinyLat = pos.lat();
          this.destinyLong = pos.lng();
          this.geocoder = new google.maps.Geocoder();
          this.geocoder.geocode
            ({
              latLng: pos
            },
            (results, status) => {
              this.loading.dismiss();
              this.meetingPlaceId = results[0].place_id;
              this.originPlaceId = results[0].place_id;
              this.destinyPlaceId = results[0].place_id;
              // let adr = results[0].formatted_address;
              // this.autocomplete.input = adr;
              // this.autocomplete.input = adr;
            }
            );
        })
      });


    }).catch((error) => {
    });
  }

  //Update predictions list
  updateSearchResults() {
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.optionsAutocomplete = {
      input: this.autocomplete.input,
    };

    this.GoogleAutocomplete.getPlacePredictions(this.optionsAutocomplete,
      (predictions, status) => {
        this.autocompleteItems = [];
        if (predictions) {
          this.ngZone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          });
        }
      });
  }
  updateSearchResults2() {
    if (this.autocomplete.input2 == '') {
      this.autocompleteItems = [];
      return;
    }
    this.optionsAutocomplete = {
      input: this.autocomplete.input2,
    };

    this.GoogleAutocomplete.getPlacePredictions(this.optionsAutocomplete,
      (predictions, status) => {
        this.autocompleteItems = [];
        if (predictions) {
          this.ngZone.run(() => {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          });
        }
      });
  }

  selectSearchResult(item, type) {
    if (type === 'origin') {
      this.autocomplete.input = item.description;
    }
    else if (type === 'destiny') {
      this.autocomplete.input2 = item.description;
    }
    this.clearMarkers();
    this.autocompleteItems = [];
    this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        let marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        google.maps.event.addListener(marker, 'dragend', () => {
          this.ngZone.run(() => {
            this.loading.present()

            let pos = marker.getPosition();
            this.destinyLat = pos.lat();
            this.destinyLong = pos.lng();
            this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode
              ({
                latLng: pos
              },
              (results, status) => {
                this.loading.dismiss();
                let adr = results[0].formatted_address;
                this.autocomplete.input = adr;
                this.autocomplete.input = adr;

                if (type === 'origin') {
                  this.meetingPlaceId = results[0].place_id;
                  this.originPlaceId = results[0].place_id;
                  this.destinyPlaceId = results[0].place_id;
                }
              }
              );
          })
        });

        if (type === 'origin') {
          this.destinyLat = results[0].geometry.location.lat();
          this.destinyLong = results[0].geometry.location.lng();
          this.meetingPlaceId = item.place_id;
          this.originPlaceId = item.place_id;
          this.destinyPlaceId = item.place_id;
          this.markers.push(marker);
          this.map.setCenter(results[0].geometry.location);
        }
        else if (type === 'destiny') {
          if (item.terms.length < 3) {
            let alert = this.alertCtrl.create({
              title: 'Ops!',
              subTitle: 'Please select a place with city, state and country.',
              buttons: ['Ok']
            });
            alert.present();
          }
          else {

            this.adventure.destinyCity = item.terms[0].value;
            this.adventure.destinyState = item.terms[1].value;
            this.adventure.destinyCountry = item.terms[2].value;

            //Get state long name
            // console.log(results);
            let array = results[0].address_components;
            let short_name = item.terms[1].value;
            // console.log('Short name: ' + short_name);
            var longName = array.filter(function (el) {
              return el.short_name === short_name
            });
            // console.log(longName);
            if (longName.length > 0) {
              if (longName[0].long_name) {
                let long_name = longName[0].long_name;
                this.adventure.stateLongName = long_name;
                // console.log(long_name);
              }
            }
          }

          this.markers.push(marker);
          this.map.setCenter(results[0].geometry.location);
        }
      }
    })
  }

  //Calendar functions
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
  onTimeSelected(ev) {
    this.selectedDay = ev.selectedTime;
    let current = new Date();
    let otherDay = moment(ev.selectedTime).utc().format('YYYY-MM-DD');
    let currentDay = moment(current).utc().format('YYYY-MM-DD');

    if (currentDay === otherDay) {
      this.continueException();
    }
    else if (currentDay > otherDay) {
      let alert = this.alertCtrl.create({
        title: 'Ops!',
        subTitle: 'Old dates are invalid.',
        buttons: ['Ok']
      });
      alert.present();
    }
    else if (currentDay < otherDay) {
      this.continueException()
    }
  }

  //Add or remove exception day
  continueException() {
    let day = moment(this.selectedDay, moment.ISO_8601).toISOString();
    let dayFormat = day.substring(0, 10).split('-');
    let result = dayFormat[0] + "-" + dayFormat[1] + "-" + dayFormat[2];
    let date = { "date": result };
    let dates = this.availability.filter(function (filter) {
      return filter.date == result;
    });

    //Push to availabily list
    if (dates.length === 0) {
      this.availability.push(date);
      //Push to calendar events
      let event = {
        title: day,
        startTime: new Date(day),
        endTime: new Date(day),
        allDay: true
      };
      let events = this.eventSource;
      events.push(event);
      this.eventSource = [];
      setTimeout(() => {
        this.eventSource = events;
      });
    }
    else {
      let date = dates[0];

      let index = this.availability.indexOf(date);
      if (index > -1) {
        this.availability.splice(index, 1);
      }
      if (index > -1) {
        this.eventSource.splice(index, 1);
        let events = this.eventSource;
        this.eventSource = [];
        setTimeout(() => {
          this.eventSource = events;
        });
      }

    }
  }

  //Exceptions week day
  week(val) {
    //Loop
    let i = 0;
    let indexVal;
    let index;
    for (i; i < this.exceptions_week_day.length; i++) {
      if (this.exceptions_week_day[i] === val) {
        indexVal = this.exceptions_week_day[i];
        index = this.exceptions_week_day.indexOf(indexVal);
      }
    }

    if (val === 0) {
      if (this.check.dom) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }
    else if (val === 1) {
      if (this.check.seg) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }
    else if (val === 2) {
      if (this.check.ter) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }
    else if (val === 3) {
      if (this.check.quar) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }
    else if (val === 4) {
      if (this.check.quin) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }
    else if (val === 5) {
      if (this.check.sext) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }
    else if (val === 6) {
      if (this.check.sab) {
        this.exceptions_week_day.push(val)
      }
      else {
        //Remove day
        if (index > -1) {
          this.exceptions_week_day.splice(index, 1);
        }
      }
    }

  }

  //Start time
  showHourVerify() {
    if (this.toCombine === true) {
      this.showHour = false;
      this.adventure.hour = 'To combine'
    }
    else {
      this.showHour = true;
      this.adventure.hour = this.adventure.hour
    }
  }

  //Select image
  pegarFoto() {
    this.loading.present();
    this.camera.getPicture({
      quality: 100,
      allowEdit: true,
      targetWidth: 300,
      targetHeight: 750,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      // correctOrientation: true,
    }).then(imageData => {
      let base64data = 'data:image/jpeg;base64,' + imageData;
      this.bigImg = base64data;
      //Get image size
      this.createThumbnail();
      this.saveObjMemory();
    }, error => {
      this.loading.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Ops!',
        subTitle: 'Please, try again.',
        buttons: ['Ok']
      });
      alert.present();
    });
  }

  createThumbnail() {

    this.generateFromImage(this.bigImg, 1000, 1000, 100, data => {
      let date = new Date();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let seconds = date.getSeconds();
      let milliseconds = date.getMilliseconds();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      let idGenerator = day.toString() + month.toString() + year.toString() + hour.toString() + minute.toString() + seconds.toString() + milliseconds.toString() + this.user.uid.toString();

      this.smallImg = data;
      let imgToUp = this.smallImg.split(',')[1];
      // console.log(imgToUp);
      this.storageImages.uploadPhoto(imgToUp, idGenerator, 'Adventure')
        .then((savedPicture) => {
          this.loading.dismiss()
          let obj2 = { "uri": data, "id": savedPicture.downloadURL };
          this.galleryApp.push(obj2);

        })
        .catch((err) => {
          this.loading.dismiss()
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

  //Remove image
  removeImage(i, image) {
    let index = i;
    this.galleryApp.splice(index, 1);
    let alert = this.alertCtrl.create({
      title: 'Removed.',
      subTitle: 'Your image has been removed.',
      buttons: ['Ok']
    });
    alert.present();
  }

  publish() {
    this.loading.present();

    let requirements = [];
    let certifications = [];
    let languages = [];
    //Organize price
    let num = parseInt(this.adventure.price) * 100;
    //Organize gallery
    let data = [];
    let i = 0;
    let length = this.galleryApp.length;
    for (i; i < length; i++) {
      data.push({ "image": this.galleryApp[i].id, "order": i });
    }

    let adventure;

    if (!this.edit) {
      adventure = {
        "title": this.adventure.title,
        "description": this.adventure.description,
        "stateLongName": this.adventure.stateLongName,
        "price": num,
        "duration": this.adventure.duration,
        "travellers": this.adventure.travellers,
        "gear": this.adventure.gear,
        "requirements": requirements,
        "minAge": this.adventure.minAge,
        "originId": this.originPlaceId,
        "meetingId": this.meetingPlaceId,
        "destinyId": this.destinyPlaceId,
        "destinyCity": this.adventure.destinyCity,
        "destinyState": this.adventure.destinyState,
        "destinyCountry": this.adventure.destinyCountry,
        "certifications": certifications,
        "languages": languages,
        "exceptions_date": this.availability,
        "exceptions_week_day": this.exceptions_week_day,
        "gallery": data,
        "observation": this.adventure.hour,
        "status": this.adventure.status,
        "ownerId": this.user.uid,
        "ownerEmail": this.user.email,
        "difficulty": this.adventure.difficulty,
        "adventures": this.adventure.adventures,
        "localExpert": this.adventure.localExpert,
        "socialSecurity": "000",
        "warnings": "none",
        "location": { "type": "Point", "coordinates": [this.destinyLat, this.destinyLong] }
      };
    }
    else {
      adventure = {
        "title": this.adventure.title,
        "id": this.adventure.id,
        "description": this.adventure.description,
        "stateLongName": this.adventure.stateLongName,
        "price": num,
        "duration": this.adventure.duration,
        "travellers": this.adventure.travellers,
        "gear": this.adventure.gear,
        "requirements": requirements,
        "minAge": this.adventure.minAge,
        "originId": this.adventure.originId,
        "meetingId": this.adventure.meetingId,
        "destinyId": this.adventure.destinyId,
        "destinyCity": this.adventure.destinyCity,
        "destinyState": this.adventure.destinyState,
        "destinyCountry": this.adventure.destinyCountry,
        "certifications": certifications,
        "languages": languages,
        "exceptions_date": this.availability,
        "exceptions_week_day": this.exceptions_week_day,
        "gallery": data,
        "observation": this.adventure.hour,
        "status": 'pending',
        "ownerId": this.user.uid,
        "ownerEmail": this.user.email,
        "difficulty": this.adventure.difficulty,
        "adventures": this.adventure.adventures,
        "localExpert": this.adventure.localExpert,
        "socialSecurity": "000",
        "warnings": "none",
        "location": { "type": "Point", "coordinates": [this.destinyLat, this.destinyLong] }
      };


      if (this.destinyLat) {
        adventure.location = {
          "type": "Point", "coordinates": [this.destinyLat, this.destinyLong]
        }
      }
    }

    // VERIFY UNDEFINED FIELDS
    for (var key in adventure) {
      if (adventure.hasOwnProperty(key)) {
        if (!adventure[key]) {
          adventure[key] = "";
        }
      }
    }

    if (!adventure.location.coordinates[0]) {
      adventure.location.coordinates[0] = '';
      adventure.location.coordinates[1] = '';
    }

    this.publishAdv(adventure);
  }

  publishAdv(adventure) {

    //Only save adventure
    if (this.edit) {
      this.firebaseService.saveAdventure(adventure)
        .then(() => {
          //Facebook log
          this.facebook.logEvent('EDITED_ADVENTURE');
          //Analytics log
          this.firebaseService.eventEditedAdventure(adventure.ownerId, adventure.id);
          this.loading.dismiss();
          this.viewCtrl.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Yeah!',
            subTitle: 'Your experience is awaiting approval.',
            buttons: ['Ok']
          });
          alert.present();
        })

    }
    //Create adventure
    else {
      this.firebaseService.createAdventure(adventure)
        .then((docRef) => {
          let data = {
            id: docRef.id
          }
          this.firebaseService.saveAdventure(data)
            .then(() => {
              //Facebook log
              this.facebook.logEvent('CREATED_ADVENTURE');
              //Analytics log
              this.firebaseService.eventCreatedAdventure(adventure.ownerId, data.id);
              this.loading.dismiss();
              this.viewCtrl.dismiss();
              let alert = this.alertCtrl.create({
                title: 'Yeah!',
                subTitle: 'Your experience is awaiting approval.',
                buttons: ['Ok']
              });
              alert.present();
            })
        })
    }
    this.storage.remove("manage");
  }
}