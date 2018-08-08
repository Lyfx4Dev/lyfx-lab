import { Injectable} from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class Helpers {
    constructor() {}

    //Format price
    formatPrice(value){
        return (value / 100).toFixed(2);
    }

    //Format date to calendar component
    // formatDateToCalendarComponent(date){
    //     let formatedDate = moment(date, moment.ISO_8601);
    //     let year = formatedDate.get('year');
    //     let month = formatedDate.get('month');
    //     let day = formatedDate.get('date')
    //     let selectedDate = new Date(Date.UTC(year, month, day, 0, 1, 0));
    //     return selectedDate.toISOString();
    // }
    formatDateToCalendarComponent(date){
        let formatedDate = moment(date, moment.ISO_8601);
        let year = formatedDate.get('year');
        let month = formatedDate.get('month');
        let day = formatedDate.get('date');
        let fim = new Date(year, month, day)
        // let selectedDate = new Date(Date.UTC(year, month, day, 0, 1, 0));
        return fim.toISOString();
    }


    //Format date
    formatDate(date){
        let formatedDate = moment(date, moment.ISO_8601);
        let year = formatedDate.get('year');
        let month = formatedDate.get('month');
        let day = formatedDate.get('date');
        let fim = new Date(year, month, day)
        // let selectedDate = new Date(Date.UTC(year, month, day, 0, 1, 0));
        return fim
    }

    //Compare calendar dates
    compareCalendarDates(day){
        let currentDate = moment().format('YYYY-MM-DD');
        //If it is not an old date
        if(currentDate <= day){
            return true
        }
    }
}