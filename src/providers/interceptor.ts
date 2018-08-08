import { Injectable, NgModule} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/do';
import { App } from 'ionic-angular';
import { ToastProvider } from './toast';
import { LoadingProvider } from './loading';

@Injectable()
export class HttpsRequestInterceptor implements HttpInterceptor {

    dupReq;
    token = '';

    constructor(
        public storage: Storage,
        public appCtrl: App,
        public toast: ToastProvider,
        public loading: LoadingProvider
    ) {
    };

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = localStorage.getItem('access-token');
        if(token){
            this.token = token;
        }
        // this.dupReq = req.clone({setHeaders: {
        //     "Content-Type": "application/json",
        //     "Authorization": this.token
        // }});

        return next.handle(this.dupReq).do((event: HttpEvent<any>) => {
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                //Close loading
                this.loading.dismiss();
                //Unauthorized
                if(err.status === 401){
                    //Redirect to login
                    // this.appCtrl.getRootNav().setRoot('AuthPage');
                }
                //Bad request
                else if(err.status === 400){
                    let message = 'Oops. Please, complete all fields.';
                    this.toast.present(message);
                }
                else if(err.status === 502){
                    let message = 'Oops. Please, try again.';
                    this.toast.present(message);
                }
                else if(err.status === 500){
                    let message = 'Oops. Please, try again.';
                    this.toast.present(message);
                }
                //Other errors
                else {
                    // let message = 'Oops. Please, try again.';
                    // this.toast.present(message);
                }
            }
        });
    }
};

@NgModule({
    providers: [
        // {provide: HTTP_INTERCEPTORS, useClass: HttpsRequestInterceptor, multi: true}
    ]
})
export class InterceptorModule { }
