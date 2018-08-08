import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';

@Injectable()
export class ApiServices {

    firebase = 'https://lyfx-lab.firebaseapp.com';
    elastic = 'https://35.202.133.36/elasticsearch';
    auth = 'dXNlcjphYmZ1cDNEMnV4TGg=';


    constructor(
        private http: HttpClient,
        private httpNative: HTTP
    ) { }

    /////////* CALENDAR */////////
    getAvailability(id, month, year) {
        let data = {
            adventureId: id,
            month: month,
            year: year
        }
        let endpoint = '/calendar';
        let url = this.firebase + endpoint;
        return this.http.post(url, data, {})
    }

    /////////* STRIPE  */////////
    createCustomer(data) {
        let endpoint = '/create-customer';
        let url = this.firebase + endpoint;
        return this.http.post(url, data, {})
    }
    cancelOrder(data) {
        let endpoint = '/cancel-order';
        let url = this.firebase + endpoint;
        return this.http.post(url, data, {})
    }

    /////////* ELASTIC SEARCH  */////////
    searchAdv(keyword) {
        let url = 'https://elasticsearch.lyfx.co/elasticsearch/adventures/_search?q=' + keyword + "&size=30";
        let url2 = encodeURI(url);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Basic ' + btoa('user' + ":" + 'abfup3D2uxLh')
            })
        };
        return this.http.get(url2, httpOptions).toPromise();
    }  
    
}