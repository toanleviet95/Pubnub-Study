import {Component, OnInit} from '@angular/core';
import {PubNubAngular} from 'pubnub-angular2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  channelName: string;
  userId: string;
  messages = [];
  newMessage: string;
  mood = 'happy';
  usersConnected = 0;
  occupants: any;

  constructor(private pubnub: PubNubAngular) {
  }

  ngOnInit() {
    this.channelName = 'toanlv_channel';
    this.userId = 'User_' + Math.round(Math.random() * 1000);
    this.pubnub.init({
      publishKey: 'pub-c-3a860273-17ae-4aef-a9a0-9f66a0240d32',
      subscribeKey: 'sub-c-3d4e59ce-dcdb-11e7-b4b6-6a46027b7961',
      uuid: this.userId
    });

    this.pubnub.subscribe({
      channels: [this.channelName],
      withPresence: true,
      triggerEvents: true,
      autoload: 100
    });

    this.pubnub.getMessage(this.channelName, message => {
      if(message) {
        this.messages.unshift(message);
      }
    });

    this.pubnub.getPresence(this.channelName, presence => {
      this.usersConnected = presence.occupancy ? presence.occupancy : 0;

      this.pubnub.hereNow({
        channels: [this.channelName],
        includeUUIDs: true,
        includeState: true
      }).then((response) => {
        if(response){
          this.occupants = response.channels[this.channelName].occupants;
        }
      }).catch((error) => {
        console.log(error);
      });

      this.updateMood();
    });

    // this.pubnub.getStatus(this.channelName, status => {
    //   console.log(status);
    // });

    this.pubnub.history(
      {
        channel: this.channelName,
        count: 100, // 100 is the default
      },
      (status, response) => {
        if (response) {
          response.messages.forEach((x) => {
            this.messages.unshift({message: x.entry});
          });
        }
      }
    );
  }

  publish(): void {
    if (this.newMessage !== '') {
      this.pubnub.publish({channel: this.channelName, message: '[' + this.userId + '] ' + this.newMessage});
      this.newMessage = '';
    }
  }

  updateMood(): void {
    this.pubnub.setState({state: {mood: this.mood}, uuid: this.userId, channels: [this.channelName]});
  }
}
