import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-memo-details',
  templateUrl: './memo-details.page.html',
  styleUrls: ['./memo-details.page.scss'],
})
export class MemoDetailsPage implements OnInit {

  noteForm: FormGroup;
  pinTouched = false;
  showAllTags = false;
  memoReady = false;
  formId: string;
  memoTag: string;
  defaultTags = ['personal', 'work', 'leisure'];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dbService: DatabaseService) { }

  ngOnInit() {
    this.noteForm = new FormGroup({
      title: new FormControl(),
      content: new FormControl('', Validators.required)
    });
    this.formId = this.route.snapshot.paramMap.get('id');
    this.memoTag = this.route.snapshot.queryParamMap.get('tag');

    this.dbService.getMemo(+this.formId).then(() => {
      this.memoReady = true;
    });

  }

  updateMemo() {
    const title = this.noteForm.get('title');
    const content = this.noteForm.get('content');

    if (!this.memoTag) {
      if (title.touched || content.touched) {
        const sanitizedTitle = title.value.replaceAll(`'`, `''`);
        const sanitizedContent = content.value.replaceAll(`'`, `''`);
        this.dbService.updateMemo(+this.formId, sanitizedTitle, sanitizedContent).then(
          () => this.dbService.loadMemos());
      } else if (this.pinTouched) {
        this.dbService.loadMemos();
      } else {
        return;
      }
    } else {
      if (title.touched || content.touched) {
        this.dbService.updateMemo(+this.formId, title.value, content.value).then(
          () => this.dbService.loadTaggedMemos(this.memoTag));
      } else if (this.pinTouched) {
        this.dbService.loadTaggedMemos(this.memoTag);
      } else {
        return;
      }
    }
  }


  toggleMemoPin(pinned: string) {
    if (pinned === 'yes') {
      this.dbService.updatePin(+this.formId, 'no');
    }
    if (pinned === 'no') {
      this.dbService.updatePin(+this.formId, 'yes');
    }
    this.pinTouched = true;
  }

  toggleTagsVisibility() {
    this.showAllTags = !this.showAllTags;
  }

  setMemoTag(tag: string) {
    this.dbService.updateTag(+this.formId, tag).then(() => {
      if (tag !== 'none') {
        this.dbService.addTag(tag);
      }
    });
    this.showAllTags = false;
  }

  deleteMemo() {
    this.dbService.deleteMemo(+this.formId);
    this.router.navigateByUrl('folder/memo-list');
  }

}
