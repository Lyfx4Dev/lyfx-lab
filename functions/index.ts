// import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


const functions = require('firebase-functions');
const _ = require('lodash');
const request = require('request-promise');
const moment = require('moment');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
//Express
const express = require('express')
const app = express();


// ADVENTURE CALENDAR
app.get('/adventure-calendar', function (req, res) {
  res.send('Hello World')
})


// Everything to ElasticSearch
// ===========================
export const indexadventuresToElastic = functions.firestore.document('/adventures/{adventureId}').onWrite((change, context) => {
  const adventureData = change.after.exists ? change.after.data() : null;
  // const adventureData = event.data.val();
  const adventureId = change.params.adventureId;

  console.log('Indexing adventure ', adventureId, adventureData);

  const elasticsearchFields = ['  title', 'stateLongName', 'destinyCity', 'destinyState', 'description'];
  const elasticSearchConfig = functions.config().elasticsearch;
  const elasticSearchUrl = elasticSearchConfig.url + 'adventures/' + adventureId;
  const elasticSearchMethod = adventureData ? 'POST' : 'DELETE';

  const elasticsearchRequest = {
    method: elasticSearchMethod,
    uri: elasticSearchUrl,
    auth: {
      username: elasticSearchConfig.username,
      password: elasticSearchConfig.password,
    },
    body: _.pick(adventureData, elasticsearchFields),
    json: true
  };

  return request(elasticsearchRequest).then(response => {
    console.log('Elasticsearch response', response);
  })

});
// ============================

// Availability By Adventure (Calendar)
// ===========================
export const availabilityByAdventure = functions.firestore.document('/adventures/{adventureId}').onWrite((change, context) => {
  let adventureId = context.params.adventureId || null;
  let currentYear = new Date().getFullYear();
  let month = new Date().getMonth();
  let year = currentYear;

  if (context.params.hasOwnProperty('month')) {
    month = context.params.month;
  }

  if (context.params.hasOwnProperty('year')) {
    year = context.params.year;
  }

  // month = parseInt(month);
  // year = parseInt(year);

  if (year > currentYear + 1) {
    return;
  }

  if (year < currentYear - 1) {
    return;
  }

  if (month < 0) {
    return;
  }

  if (month > 11) {
    return;
  }

  if (null === adventureId) {
    return;
  }

  // context
  //   .app
  //   .service('experiences')
  //   .Model
  //   .find({ _id: experienceId })
  //   .then(experience => {
  //     if (experience.length === 0) {
  //       throw new Error();
  //     }

  //     experience = experience[0];
  //     experience.travellers = experience.travellers || 0;
  //     experience.exceptions_week_day = experience.exceptions_week_day || [];

  //     let built = {};

  //     built.monthText = monthNames[month];
  //     built.month = month;
  //     built.year = year;
  //     built.experienceId = experienceId;

  //     let date = new Date();
  //     date.setFullYear(year, month, 1);

  //     let begin = moment(date).clone().startOf('month');
  //     let end = moment(date).endOf('month');
  //     let today = moment().format('YYYY-MM-DD');

  //     built.today = today;

  //     let nextMonth = 0;
  //     let nextYear = 0;
  //     let prevMonth = 0;
  //     let prevYear = 0;

  //     if (month === 11) {
  //       nextMonth = 1;
  //       nextYear = parseInt(year) + 1;
  //     } else {
  //       nextMonth = parseInt(month) + 1;
  //       nextYear = year;
  //     }

  //     if (month === 0) {
  //       prevMonth = 11;
  //       prevYear = parseInt(year) - 1;
  //     } else {
  //       prevMonth = parseInt(month) - 1;
  //       prevYear = year;
  //     }

  //     built.startAt = begin.format('YYYY-MM-DD');
  //     built.endAt = end.format('YYYY-MM-DD');
  //     built.prev = 'availability-by-experience?experienceId=' + experienceId + '&month=' + prevMonth + '&year=' + prevYear;
  //     built.next = 'availability-by-experience?experienceId=' + experienceId + '&month=' + nextMonth + '&year=' + nextYear;
  //     built.days = [];

  //     let current = begin.clone();

  //     while (current.isBefore(end)) {
  //       let date = current.format('YYYY-MM-DD');
  //       built.days.push({
  //         day: current.format('D'),
  //         date: date,
  //         weekday: current.isoWeekday(),
  //         availability: experience.travellers,
  //         today: today === date
  //       });

  //       current.add(1, 'days');
  //     }

  //     context.built = built;
  //     context.exceptions_date = experience.exceptions_date;
  //     context.exceptions_week_day = experience.exceptions_week_day;
  //     context.begin = begin;
  //     context.end = end;

  //     next();
  //   }).catch(function (e) {
  //     context.result = { message: 'Experience ' + experienceId + ' not found' };
  //     next();
  //   });
});


// ===========================
// ===========================

// Another Functions
// ===========================
export const adventuresCreatedAt = functions.firestore.document('adventures/{adventureId}').onCreate((snap, context) => {
  // const data = snap.data();
  // data.set({ 'createdAt': new Date().toISOString() }, { merge: true })
  return snap.ref.set({ 'createdAt': new Date().toISOString() })

  /////

  // firestore.collection('adventures').add({ 'createdAt': new Date().toISOString() }).then(writeResult => {
  //   // write is complete here
  // });
});



