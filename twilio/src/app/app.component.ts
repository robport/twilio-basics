import {Component, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as Twilio from "twilio-client";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  url = 'http://localhost:8000/token';
  device;
  clientName: string;
  isDeviceReady = false;
  loggedMessages: string[] = [];
  displayVolumeIndicators = false;
  connection: any;
  inputBarStyles: any = {};
  outputBarStyles: any = {};
  showAnswerBtn = false;
  showCallBtn = true;
  showHangupBtn = false;

  constructor(private http: HttpClient){}

  async ngOnInit(){
    const tokenData: any = await this.http.get(this.url).toPromise();
    console.log(tokenData);
    this.clientName = tokenData.identity;
    this.device = Twilio.Device.setup(tokenData.token);

    this.device.on('ready', (device) => {
      this.log('Twilio.Device Ready!');
      document.getElementById('call-controls').style.display = 'block';
    });

    this.device.on('error', (error) => {
      this.log('Twilio.Device Error: ' + error.message);
    });

    this.device.on('connect', (conn) => {
      this.log('Successfully established call!');
      this.showCallBtn = false;
      this.showHangupBtn = true;
      this.showAnswerBtn = false;
      this.displayVolumeIndicators = true;
      this.bindVolumeIndicators();
    });

    this.device.on('disconnect', (conn) => {
      this.log('Call ended.');
      this.showCallBtn = true;
      this.showHangupBtn = false;
      this.showAnswerBtn = false;
      this.displayVolumeIndicators = false;
    });

    this.device.on('incoming', (conn) => {
      this.log('Incoming connection from ' + conn.parameters.From);
      console.log(JSON.stringify(conn.parameters, null, 2));
      this.showCallBtn = false;
      this.showHangupBtn = false;
      this.showAnswerBtn = true;
      this.connection = conn;
    });
  }

  answer(){
    this.log('Answering call');
    if (this.device && this.connection) {
      this.connection.accept();
    }
  }

  call(){
    // get the phone number to connect the call to
    const params = {
      To: (document.getElementById('phone-number') as any).value
    };
    this.placeCall(params);
  }

  getFromQueue(){
    const params = {
      To: 'queue'
    };
    this.placeCall(params);
  }

  private placeCall(params: any){
    if (this.device) {
      this.log('Calling ' + params.To + '...');
      this.device.connect(params);
    }
  }

  hangup(){
    this.log('Hanging up...');
    if (this.device) {
      this.device.disconnectAll();
    }
  }

  reject(){
    this.log('Rejected incoming call');
    if (this.device && this.connection) {
      this.connection.reject();
    }
  }

  // Activity log
  private log(message) {
    this.loggedMessages.push(message)
  }

  private bindVolumeIndicators(){
    if(this.connection) {
      this.connection.on('volume', function (inputVolume, outputVolume) {
        let outputColor = 'red';
        let inputColor = 'red';
        if (inputVolume < .50) {
          inputColor = 'green';
        } else if (inputVolume < .75) {
          inputColor = 'yellow';
        }

        this.inputBarStyles.width = Math.floor(inputVolume * 300) + 'px';
        this.inputBarStyles.background = this.inputColor;

        if (outputVolume < .50) {
          outputColor = 'green';
        } else if (outputVolume < .75) {
          outputColor = 'yellow';
        }

        this.outputBarStyles.width = Math.floor(outputVolume * 300) + 'px';
        this.outputBarStyles.background = outputColor;
      });
    }
  }
}
