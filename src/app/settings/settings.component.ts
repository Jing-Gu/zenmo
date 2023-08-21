import { Component, OnInit } from '@angular/core';
import { Device } from '@capacitor/device';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  os: string;
  osVersion: string;
  model: string;

  constructor() { }

  ngOnInit() {
    this.getDeviceInfo();
  }

  async getDeviceInfo() {
    const info = await Device.getInfo();
      this.os = info.operatingSystem;
      this.osVersion = info.osVersion;
      this.model = info.model;
  }

  async recommendApp() {
    await Share.share({
      //title: 'See cool stuff',
      text: 'Zenmo is a beautiful zen-style memo. Get it for free!',
      url: 'http://ionicframework.com/',
      //dialogTitle: 'Share with buddies',
    });
  }


}
