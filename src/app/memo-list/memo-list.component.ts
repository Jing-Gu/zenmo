import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-memo-list',
  templateUrl: './memo-list.component.html',
  styleUrls: ['./memo-list.component.scss'],
})
export class MemoListComponent implements OnInit {

  isModalOpen = false;
  //showTaggedList = false;
  firstLoad = true;
  noteForm: FormGroup;
  allMemos = [];
  memoTag: string | null;
  pinned = false;
  showAllTags = false;
  defaultTags = ['personal', 'work', 'leisure'];
  newMemoTag = 'none';

  dummyMemos = [
    {
      id: 1,
      title: 'test one',
      // eslint-disable-next-line max-len
      content: 'If you want to be sure the splash screen never disappears before your app is ready, set launchAutoHide to false; the splash screen will then stay visible until manually hidden. For the best user experience, your app should call hide() as soon as possible.',
      pinned: 1,
      tag: 'personal'
    },
    {
      id: 2,
      title: 'Background Color',
      // eslint-disable-next-line max-len
      content: 'Terminal software ',
      pinned: 0,
      tag: 'leisure'
    },
    {
      id: 3,
      title: 'Hiding the Splash Screen',
      // eslint-disable-next-line max-len
      content: 'that the emulator is not the shell. Its just a piece of softnt.',
      pinned: 1,
      tag: 'leisure'
    },
    {
      id: 4,
      title: 'The Terminal (Emulator)',
      // eslint-disable-next-line max-len
      content: 'written by Steve Bourne. Since it was highly inspired by the sh, which was written by Steve Bourne, the folks at the GNU project decided to name the new.',
      pinned: 0,
      tag: 'leisure'
    },
    {
      id: 5,
      title: 'What Can You Do Next ',
      // eslint-disable-next-line max-len
      content: 'If you want to be sure the splash screen never disappears before your app is ready, set launchAutoHide to false; the splash screen will then stay visible until manually hidden. For the best user experience, your app should call hide() as soon as possible.',
      pinned: 1,
      tag: 'work'
    },
  ];



  constructor(
    private alertController: AlertController,
    private route: ActivatedRoute,
    private dbService: DatabaseService) { }

  ngOnInit() {
    this.noteForm = new FormGroup({
      title: new FormControl(''),
      content: new FormControl('', Validators.required)
    });

    this.route.queryParamMap.subscribe(params => {
      if (params.get('tag')) {
        this.memoTag = params.get('tag');
        this.firstLoad = false;
        this.dbService.loadTaggedMemos(this.memoTag);
      } else {
        this.memoTag = null;
        if (!this.firstLoad) {
          this.dbService.loadMemos();
        }
      }
    });
  }



  addNewMemo() {
    this.isModalOpen = true;
    this.noteForm.reset();
    this.newMemoTag = 'none';
    this.pinned = false;
  }

  closeModal() {
    const title = this.noteForm.get('title').value;
    const content = this.noteForm.get('content').value;
    if (!title && !content) {
      this.isModalOpen = false;
    } else {
      this.presentAlert();
    }
  }

  toggleMemoPin() {
    this.pinned = !this.pinned;
  }

  toggleTagsVisibility() {
    this.showAllTags = !this.showAllTags;
  }

  setMemoTag(tag: string) {
    this.newMemoTag = tag;
    this.showAllTags = false;
  }

  submitMemo() {
    this.isModalOpen = false;
    const title = this.noteForm.get('title').value;
    const content = this.noteForm.get('content').value;
    const sanitizedTitle = title.replaceAll(`'`, `''`);
    const sanitizedContent = content.replaceAll(`'`, `''`);
    const pin = this.pinned ? 'yes' : 'no';
    this.dbService.addMemo(sanitizedTitle, sanitizedContent, pin, this.newMemoTag).then(() => {
      if (this.newMemoTag !== 'none') {
        this.dbService.addTag(this.newMemoTag);
      }
    });
  }

  deleteMemo(id: number) {
    this.dbService.deleteMemo(id);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Memo not saved',
      message: 'Do you want to save it?',
      backdropDismiss: false,
      cssClass: 'alertbox',
      buttons: [{
        text: 'Delete',
        role: 'cancel',
        cssClass: 'btnCancel',
        handler: () => {
          this.isModalOpen = false;
        },
      },
      {
        text: 'Save',
        role: 'confirm',
        cssClass: 'btnSave',
        handler: () => {
          this.submitMemo();
        },
      },],
    });

    await alert.present();
  }

}
