/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject } from 'rxjs';

const MEMO_TABLE_NAME = 'memos';
const TAG_TABLE_NAME = 'tags';

export interface Memo {
  id: number;
  title: string;
  content: string;
  creationTime: string;
  modifiedTime: string;
  pinned: string;
  tag: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  storage: SQLiteObject;
  _memosSub = new BehaviorSubject([]);
  memos$ = this._memosSub.asObservable();
  _currentMemoSub = new BehaviorSubject(null);
  currentMemo$ = this._currentMemoSub.asObservable();
  _tagsSub = new BehaviorSubject([]);
  tags$ = this._tagsSub.asObservable();
  currentMemo: Memo;


  constructor(
    private platform: Platform,
    private sqlite: SQLite) {
    this.platform.ready().then(() => {
      this.createDatabase();
    }).catch(error => {
      alert('error on constructor: ' + JSON.stringify(error));
    });
  }

  createDatabase() {
    this.sqlite.create({
      name: 'memo_db.db',
      location: 'default',
    }).then((db: SQLiteObject) => {
      this.storage = db;
      this.createMemoTable();
      this.createTagTable();
    }).catch(error => {
      alert('error on memo db creation: ' + JSON.stringify(error));
    });
  }

  async createMemoTable() {
    try {
      await this.storage.executeSql(`CREATE TABLE IF NOT EXISTS ${MEMO_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, creationTime TEXT, modifiedTime TEXT, pinned TEXT, tag TEXT)`,
        []);
      await this.loadMemos();
    } catch(error) {
      alert('Error on memo table creation:' + JSON.stringify(error));
    }
  }

  async createTagTable() {
    try {
      await this.storage.executeSql(`CREATE TABLE IF NOT EXISTS ${TAG_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)`, []);
      await this.loadTags();
    } catch(error) {
      alert('Error on tag table creation:' + JSON.stringify(error));
    }
  }

  async addMemo(title, content, pinned, tag) {
    const d = new Date();
    const dateString = d.toString();
    const newMemo = [title, content, dateString, 'none', pinned, tag];
    try {
      await this.storage.executeSql(`INSERT INTO ${MEMO_TABLE_NAME} (
        title, content, creationTime, modifiedTime, pinned, tag) VALUES (?, ?, ?, ?, ?, ?)`, newMemo);
      await this.loadMemos();
    } catch(error) {
      alert('Error on addMemo: ' + JSON.stringify(error));
    }
  }

  async addTag(name) {
    try {
      await this.storage.executeSql(`INSERT OR IGNORE INTO ${TAG_TABLE_NAME} (name) VALUES ('${name}')`, );
      await this.loadTags();
    } catch(error) {
      alert('Error on addTag: ' + JSON.stringify(error));
    }
  }

  async getMemo(id: number) {
    try {
      const selected = await this.storage.executeSql(`SELECT * FROM ${MEMO_TABLE_NAME} WHERE id = ?`, [id]);
      this.currentMemo = {
        id: selected.rows.item(0).id,
        title: selected.rows.item(0).title,
        content: selected.rows.item(0).content,
        creationTime: selected.rows.item(0).creationTime,
        modifiedTime: selected.rows.item(0).modifiedTime,
        pinned: selected.rows.item(0).pinned,
        tag: selected.rows.item(0).tag
      };
      this._currentMemoSub.next(this.currentMemo);
    } catch(error) {
      alert('Error on getMemo: ' + JSON.stringify(error));
    }
  }

  async updateMemo(id: number, title: string, content: string) {
    const d = new Date();
    const dateString = d.toString();
    try {
      await this.storage.executeSql(`UPDATE ${MEMO_TABLE_NAME}
        SET title = '${title}', content = '${content}', modifiedTime = '${dateString}'
        WHERE id = ${id}`, []);
    } catch(error) {
      alert('Error on updateMemo: ' + JSON.stringify(error));
    }
  }

  async updatePin(id: number, pinned: string) {
    const d = new Date();
    const dateString = d.toString();
    try {
      await this.storage.executeSql(`UPDATE ${MEMO_TABLE_NAME}
        SET pinned = '${pinned}', modifiedTime = '${dateString}'
        WHERE id = ${id}`, []);
      const selected = await this.storage.executeSql(`SELECT * FROM ${MEMO_TABLE_NAME} WHERE id = ?`, [id]);
      this.currentMemo = {
        ...this.currentMemo,
        modifiedTime: selected.rows.item(0).modifiedTime,
        pinned: selected.rows.item(0).pinned
      };
      this._currentMemoSub.next(this.currentMemo);
    } catch(error) {
      alert('Error on pinMemo: ' + JSON.stringify(error));
    }
  }

  async updateTag(id: number, tag: string) {
    const d = new Date();
    const dateString = d.toString();
    try {
      await this.storage.executeSql(`UPDATE ${MEMO_TABLE_NAME}
        SET tag = '${tag}', modifiedTime = '${dateString}'
        WHERE id = ${id}`, []);
      const selected = await this.storage.executeSql(`SELECT * FROM ${MEMO_TABLE_NAME} WHERE id = ?`, [id]);
      this.currentMemo = {
        ...this.currentMemo,
        modifiedTime: selected.rows.item(0).modifiedTime,
        tag: selected.rows.item(0).tag
      };
      this._currentMemoSub.next(this.currentMemo);
    } catch(error) {
      alert('Error on editMemoTag: ' + JSON.stringify(error));
    }
  }

  async deleteMemo(id: number) {
    try {
      await this.storage.executeSql(`DELETE FROM ${MEMO_TABLE_NAME} WHERE id = ?`, [id]);
      await this.loadMemos();
    } catch(error) {
      alert('Error on deleteMemo: ' + JSON.stringify(error));
    }
  }

  async deleteTag(tag) {
    try {
      await this.storage.executeSql(`DELETE FROM ${TAG_TABLE_NAME} WHERE id = ?`, [tag.id]);
      await this.loadTags();
      // remove tags from memos with it
      const memosWithTag = await this.storage.executeSql(`SELECT * FROM ${MEMO_TABLE_NAME} WHERE tag LIKE '${tag.name}'`, []);
      memosWithTag.forEach(memo => {
        this.storage.executeSql(`UPDATE ${MEMO_TABLE_NAME} SET tag = 'none' WHERE id = ${memo.id}`, []);
      });
    } catch(error) {
      alert('Error on deleteTag: ' + JSON.stringify(error));
    }
  }


  async loadMemos() {
    try {
      const data = await this.storage.executeSql(`SELECT * FROM ${MEMO_TABLE_NAME}`, []);
      this.retrieveDataToArray(data);
    } catch(error) {
      return alert('Error on loading memos: ' + JSON.stringify(error));
    }
  }

  async loadTaggedMemos(tag: string) {
    try {
      const data = await this.storage.executeSql(`SELECT * FROM ${MEMO_TABLE_NAME} WHERE tag LIKE '${tag}'`, []);
      this.retrieveDataToArray(data);
    } catch (error) {
      return alert('Error on loading TaggedMemos: ' + JSON.stringify(error));
    }
  }

  async loadTags() {
    try {
      const data = await this.storage.executeSql(`SELECT * FROM ${TAG_TABLE_NAME}`, []);
      const tags = [];
      if(data.rows.length > 0) {
        for(let i = 0; i < data.rows.length; i++) {
          tags.push({
            id: data.rows.item(i).id,
            name: data.rows.item(i).name,
          });
        }
        this._tagsSub.next(tags);
      } else {
        this._tagsSub.next([]);
      }
    } catch(error) {
      return alert('Error on loading tags: ' + JSON.stringify(error));
    }
  }

  retrieveDataToArray(data) {
    const memos: Memo[] = [];

    if(data.rows.length > 0) {
      for(let i = 0; i < data.rows.length; i++) {
        memos.push({
          id: data.rows.item(i).id,
          title: data.rows.item(i).title,
          content: data.rows.item(i).content,
          creationTime: data.rows.item(i).creationTime,
          modifiedTime: data.rows.item(i).modifiedTime,
          pinned: data.rows.item(i).pinned,
          tag: data.rows.item(i).tag
        });
      }
      this._memosSub.next(memos);
    } else {
      this._memosSub.next([]);
    }
  }


}
