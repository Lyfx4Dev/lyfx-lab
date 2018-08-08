import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class ToastProvider {
    constructor(public toastCtrl: ToastController) {
    }

    present(message){
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
        });

        return toast.present();
    }
}