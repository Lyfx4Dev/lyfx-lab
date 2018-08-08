import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { AngularFireAuth } from "angularfire2/auth";
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
// import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';

@Injectable()
export class FirebaseService {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    // private firebaseAnalytics: FirebaseAnalytics
  ) {
    //Firestore config
    afs.firestore.settings({
      timestampsInSnapshots: true,
    });
  }

  /////////* AUTH */////////
  login(data) {
    return this.afAuth.auth.signInWithEmailAndPassword(data.email, data.password);
  }
  register(data) {
    return this.afAuth.auth.createUserWithEmailAndPassword(data.email, data.password);
  }
  resetPassword(email) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  /////////* USERS */////////
  postUser(data) {
    return this.afs.collection("users").doc(data.uid).set(data);
  }
  saveUser(data) {
    return this.afs.collection("users").doc(data.uid).update(data);
  }
  getCurrentUser(uid) {

    const collection = this.afs.firestore.collection('users').doc(uid)
      .get()
      .then((res) => {
        return res.data();
      })

    return collection
  }
  getUserFromNickname(nickname) {
    const collection = this.afs.collection(
      "users",
      ref => ref.where("nickname", "==", nickname)
    );
    const collection$ = collection
      .snapshotChanges()
      .map(actions => {
        return actions.map(action => ({
          $key: action.payload.doc.id,
          ...action.payload.doc.data()
        }));
      });
    return collection$;
  }

  /////////* MESSAGES */////////
  postMessageToCurrent(current, friend, data) {
    let content = {
      id: current
    }
    return this.afs.collection('chat').doc(current).set(content).then(() => {
      return this.afs.collection('chat').doc(current).collection(friend).add(data)
    })
  }
  postMessageToFriend(current, friend, data) {
    let content = {
      id: friend
    }
    return this.afs.collection('chat').doc(friend).set(content).then(() => {
      return this.afs.collection('chat').doc(friend).collection(current).add(data)
    })
  }
  getMessages(current, friend) {
    const collection: AngularFirestoreCollection<any> = this.afs.collection('chat').doc(current).collection(friend, ref => ref
      .orderBy('createdAt'))
    const collection$: Observable<any> = collection.snapshotChanges()
      .map(actions => {
        return actions.map(action => ({ $key: action.payload.doc.id, ...action.payload.doc.data() }));
      });
    return collection$;
  }

  /////////* CARDS */////////
  createCard(data) {
    return this.afs.firestore.collection('payment-methods').add(data);
  }
  getCards(uid) {
    return this.afs.firestore.collection("payment-methods")
      .where("ownerId", "==", uid)
      .get();
  }

  /////////* REVIEWS */////////
  createReview(data) {
    return this.afs.firestore.collection('reviews').add(data);
  }
  getReviews(id) {
    const collection = this.afs.collection('reviews', ref => ref
      .where("targetId", "==", id)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        //Get reference to other document
        const id = data.ownerId;
        //Get related document
        return this.afs.collection('users').doc(id).snapshotChanges().take(1).map(actions => {
          return actions.payload.data();
        }).map(user => {
          let res = <any>{};
          res = data;
          res.user = user;
          return res
        });
      })
    }).flatMap(feeds =>
      Observable.combineLatest(feeds)
    );
  }

  /////////* ORDERS */////////
  createOrder(data) {
    return this.afs.firestore.collection("orders").add(data);
  }
  getOrders(uid) {
    return this.afs.firestore.collection("orders")
      .where("ownerId", "==", uid)
      .get();
  }
  getOrdersByLocal(uid) {
    return this.afs.firestore.collection("orders")
      .where("localId", "==", uid)
      .get();
  }
  getOrdersWithAdventuresLocal(uid) {
    const collection = this.afs.collection('orders', ref => ref
      .where("localId", "==", uid)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        data.id = result.payload.doc.id;
        //Get reference to other document
        const id = data.adventureId;
        //Get related document
        return this.afs.collection('adventures').doc(id).snapshotChanges().take(1).map(actions => {
          return actions.payload.data();
        }).map(adv => {
          let res = <any>{};
          res = data;
          res.experience = adv;
          res.recentMessage = 'da';
          return res
        });
      })
    }).flatMap(feeds =>
      Observable.combineLatest(feeds)
    );
  }
  getOrdersWithAdventures(uid) {
    const collection = this.afs.collection('orders', ref => ref
      .where("ownerId", "==", uid)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        data.id = result.payload.doc.id;
        //Get reference to other document
        const id = data.adventureId;
        //Get related document
        return this.afs.collection('adventures').doc(id).snapshotChanges().take(1).map(actions => {
          return actions.payload.data();
        }).map(adv => {
          let res = <any>{};
          res = data;
          res.experience = adv;
          res.recentMessage = '';
          return res
        });
      })
    }).flatMap(feeds =>
      Observable.combineLatest(feeds)
    );
  }
  getRecent(data) {
    const collection = this.afs.collection('chat').doc(data.fromOwnerId).collection(data.toOwnerId, ref => ref
      .orderBy('createdAt', 'desc')
      .limit(1)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        return data
      })
    })
  }

  /////////* ADVENTURES */////////
  createAdventure(adventure) {
    return this.afs.firestore.collection("adventures").add(adventure);
  }
  saveAdventure(data) {
    return this.afs.firestore.collection("adventures").doc(data.id).update(data);
  }
  getAdventures(skip, limit, order) {
    return this.afs.firestore.collection("adventures")
      //Query required
      .where("status", "==", "ready")
      //Order for random
      .orderBy(order)
      //Pagination
      .startAfter(skip)
      .limit(limit)
      .get();
  }
  getAdventuresFromOwnerId(uid) {
    return this.afs.firestore.collection("adventures")
      .where("ownerId", "==", uid)
      .get();
  }
  getAdventure(id) {
    return this.afs.firestore.collection("adventures")
      .where("id", "==", id)
      .where("status", "==", "ready")
      .get();
  }
  searchAdventure(keyword) {
    return this.afs.firestore.collection("adventures")
      .where("title", "==", keyword)
      .get();
  }
  searchFromCategorie(categorie) {
    return this.afs.firestore.collection("adventures")
      .where("adventures", "==", categorie)
      .where("status", "==", "ready")
      .get();
  }
  getAdventureState() {
    return this.afs.firestore.collection("adventures")
      .orderBy('destinyState')
      .where("status", "==", "ready")
      .get();
  }
  getAdventuresByHiking() {
    return this.afs.firestore.collection("adventures")
      .where('adventures', '==', 'hiking')
      .where("status", "==", "ready")
      .limit(9)
      .get();
  }
  getAdventuresToFIlter1(toFilter) {
    return this.afs.firestore.collection("adventures")
      .where('adventures', '==', toFilter)
      .where("status", "==", "ready")
      .get();
  }
  getAdventuresByRunning() {
    return this.afs.firestore.collection("adventures")
      .where('adventures', '==', 'running')
      .where("status", "==", "ready")
      .limit(9)
      .get();
  }
  getAdventuresByCycling() {
    return this.afs.firestore.collection("adventures")
      .where('adventures', '==', 'cycling')
      .where("status", "==", "ready")
      .limit(9)
      .get();
  }
  getAdventuresByStateAndCategorie(cat, state) {
    return this.afs.firestore.collection("adventures")
      .where('adventures', '==', cat)
      .where('destinyState', '==', state)
      .where("status", "==", "ready")
      .get();
  }
  getAdventuresByStateAndCategorieLimit(cat, state) {
    return this.afs.firestore.collection("adventures")
      .where('adventures', '==', cat)
      .where('destinyState', '==', state)
      .where("status", "==", "ready")
      .limit(9)
      .get();
  }

  /////////* TEST CRON EMAILS LOGIC */////////
  testEmails() {
    this.afs.firestore.collection('users')
      .where("local.status", "==", "approved")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((item) => {
          let user = item.data();
          //Se tiver data de aprovação
          if (user.hasOwnProperty('localSince')) {
            //Verificar de está há mais de dois dias aprovado e ainda assim sem aventura
            let now = new Date();
            let since = user.localSince;
            //Comparar dias
            let dt2 = now;
            let dt1 = new Date(since.seconds * 1000);
            let diff = Math.abs(dt2.getTime() - dt1.getTime()) / 3600000;
            if (diff >= 72) {
              this.afs.firestore.collection('adventures')
                .where("ownerId", "==", user.uid)
                .get()
                .then((querySnapshot2) => {
                  let adventures = [];
                  querySnapshot2.forEach((adventure) => {
                    adventures.push(adventure.data());
                  });
                  //Se não cadastrou nenhuma aventura ainda, enviar email
                  if (adventures.length === 0) {
                    if (user.hasOwnProperty('emailUploadAdventure')) {
                      let sended = new Date(user.emailUploadAdventureDate.seconds * 1000);
                      let diff2 = Math.abs(dt2.getTime() - sended.getTime()) / 3600000;
                      if (diff2 >= 96) {
                        //Enviar e-mail 2

                      }
                    }
                    else {
                      //Enviar e-mail 1

                    }
                  };
                })
            }
          }
          // Se não tiver data de aprovação, enviar
          else {
            let now = new Date();
            let dt2 = now;
            this.afs.firestore.collection('adventures')
              .where("ownerId", "==", user.uid)
              .get()
              .then((querySnapshot2) => {
                let adventures = [];
                querySnapshot2.forEach((adventure) => {
                  adventures.push(adventure.data());
                });
                //Se não cadastrou nenhuma aventura ainda, enviar email
                if (adventures.length === 0) {
                  if (user.hasOwnProperty('emailUploadAdventure')) {
                    let sended = new Date(user.emailUploadAdventureDate.seconds * 1000);
                    let diff2 = Math.abs(dt2.getTime() - sended.getTime()) / 3600000;
                    if (diff2 >= 96) {
                      //Enviar e-mail 2

                    }
                  }
                  else {
                    //Enviar e-mail 1

                  }
                };
              })
          }
        });
      });
  }

  /////////* CATEGORIES */////////
  getCategories() {
    const collection = this.afs.collection('acts');
    const collection$: Observable<any> = collection.snapshotChanges()
      .map(actions => {
        return actions.map(action => ({ $key: action.payload.doc.id, ...action.payload.doc.data() }));
      });
    return collection$;
  }

  /////////* CONTACTS */////////
  createContact(data) {
    return this.afs.firestore.collection('contacts').add(data);
  }
  findContact(current, friend) {
    const collection = this.afs.collection('contacts', ref => ref
      .where('fromOwnerId', '==', current)
      .where('toOwnerId', '==', friend)
    );
    return collection.snapshotChanges().map(changes => {
      return changes
    })
  }
  getContacts(ownerId) {
    const collection = this.afs.collection('contacts', ref => ref
      .where('fromOwnerId', '==', ownerId)
    );
    return collection.snapshotChanges().map(changes => {
      return changes
    })
  }
  getContactsWithCol(ownerId) {
    const collection = this.afs.collection('contacts', ref => ref
      .where('fromOwnerId', '==', ownerId)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        //Get reference to other document
        const id = data.toOwnerId;
        //Get related document
        return this.afs.collection('users').doc(id).snapshotChanges().take(1).map(actions => {
          return actions.payload.data();
        }).map(user => {
          // let res = data;
          data.toUser = user;
          return data
        });
      })
    }).flatMap(feeds =>
      Observable.combineLatest(feeds)
    );
  }
  getContactsSpecific(ownerId, friendId) {
    const collection = this.afs.collection('contacts', ref => ref
      .where('fromOwnerId', '==', ownerId)
      .where('toOwnerId', '==', friendId)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        //Get reference to other document
        const id = data.toOwnerId;
        //Get related document
        return this.afs.collection('users').doc(id).snapshotChanges().take(1).map(actions => {
          return actions.payload.data();
        }).map(user => {
          // let res = data;
          data.toUser = user;
          return data
        });
      })
    }).flatMap(feeds =>
      Observable.combineLatest(feeds)
    );
  }

  /////////* WISHES */////////
  deleteWish(id) {
    return this.afs.firestore.collection('wishes').doc(id).delete();
  }
  createWish(data) {
    return this.afs.firestore.collection('wishes').add(data);
  }
  getWishes(ownerId) {
    const collection = this.afs.collection('wishes', ref => ref
      .where('ownerId', '==', ownerId)
    );
    return collection.snapshotChanges().map(changes => {
      return changes
    })
  }
  getColWithWishes(ownerId) {
    const collection = this.afs.collection('wishes', ref => ref
      .where('ownerId', '==', ownerId)
    );
    return collection.snapshotChanges().map(changes => {
      return changes.map(result => {
        let data = <any>{};
        data = result.payload.doc.data();
        //Get reference to other document
        const id = data.adventureId;
        //Get related document
        return this.afs.collection('adventures').doc(id).snapshotChanges().take(1).map(actions => {
          return actions.payload.data();
        }).map(adv => {
          return adv
        });
      })
    }).flatMap(feeds =>
      Observable.combineLatest(feeds)
    );
  }

  getWish(uid, id) {
    const collection = this.afs.collection('wishes', ref => ref
      .where('ownerId', '==', uid)
      .where('adventureId', '==', id)
    );
    const collection$: Observable<any> = collection.snapshotChanges()
      .map(actions => {
        return actions.map(action => ({ $key: action.payload.doc.id, ...action.payload.doc.data() }));
      });
    return collection$;
  }

  /////////* ANALYTICS */////////
  eventPageView(page) {
    // this.firebaseAnalytics.logEvent('page_view', { page: page })
  }
  eventCreatedAdventure(id, advId) {
    // this.firebaseAnalytics.logEvent('created_adventure', { ownerId: id, adventureId: advId })
  }
  eventEditedAdventure(id, advId) {
    // this.firebaseAnalytics.logEvent('edited_adventure', { ownerId: id, adventureId: advId })
  }
  eventAdventureView(id, title) {
    // this.firebaseAnalytics.logEvent('page_view', { page: 'Adventure page', adventureId: id, adventureTitle: title })
  }
  eventNewUser(id, email) {
    // this.firebaseAnalytics.logEvent('new_user', { userUid: id, userEmail: email })
  }
  eventLocal(id, email) {
    // this.firebaseAnalytics.logEvent('become_a_local', { userUid: id, userEmail: email })
  }
  eventOrder(id, email, advId, price) {
    // this.firebaseAnalytics.logEvent('new_order', {
    //   userUid: id,
    //   userEmail: email,
    //   adventureId: advId,
    //   amount: price
    // })
  }

}
