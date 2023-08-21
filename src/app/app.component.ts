import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatabaseService } from './services/database.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  appPages = [
    { title: 'All Memos', url: '/folder/memo-list', icon: 'reader-outline' },
    { title: 'Settings', url: '/folder/settings', icon: 'settings-outline' },
  ];
  labels = [
    {
      name: 'personal',
      icon: 'man-outline',
    },
    {
      name: 'work',
      icon: 'briefcase-outline'
    },
    {
      name: 'leisure',
      icon: 'musical-note-outline'
    }
  ];
  tags = [];
  showEditOptions = false;

  unsubscribe$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private platform: Platform,
    private splashScreen:  SplashScreen,
    private statusBar: StatusBar,
    private dbService: DatabaseService) {
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#4f9a6e');
      this.splashScreen.hide();
    });
    //this.getTags();
  }

/*   getTags() {
    this.dbService.tags$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(tags => {
      alert('tags sub: ' + tags);
      this.tags = Array.from(tags);
    });
  } */

  toggleEdit() {
    this.showEditOptions = !this.showEditOptions;
  }

  deleteTag(tag) {
    this.dbService.deleteTag(tag.id);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}


