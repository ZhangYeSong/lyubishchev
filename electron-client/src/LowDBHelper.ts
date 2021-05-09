import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import  moment, { Moment } from 'moment';
import { Work } from './Work';

const adapter = new FileSync('db.json'); // 申明一个适配器
const db = low(adapter);

db.defaults({works: [], deletes: [], startWorkTime: -1})
  .write();

export class LowDBHelper {
  static getStartWorkTime():number {
    return db.get("startWorkTime").value();
  }

  static setStartWorkTime(time: number):void {
    return db.set("startWorkTime", time).write();
  }

  static getCurrentContent():string {
    return db.get("currentContent").value();
  }

  static setCurrentContent(content: string):void {
    return db.set("currentContent", content).write();
  }

  static getUserWorks(userid: number, date: Moment): Work[] {
    return db.get("works").filter(function(work:Work) {
      return work.userId == userid && moment(work.endTime).isSame(date, 'days');
    }).value();
  }

  static getUserAllWorks(userid: number): Work[] {
    return db.get("works").filter(function(work:Work) {
      return work.userId == userid;
    }).value();
  }

  static getUserDeletes(): number[] {
    return db.get("deletes");
  }

  static syncWorks(works: Work[]) {
    db.get("deletes").remove().write();
    db.set("works", works).write();
  }

  static insertWork(work:Work): void {
    db.get('works')
          .push(work)
          .write();
  }

  static removeWork(work:Work): void {
    db.get('works')
      .remove({insertTime: work.insertTime})
      .write();

    db.get('deletes').push(work.insertTime).write();;
  }
  
  static updateWork(work: Work): void {
    db.get('works')
      .remove({insertTime: work.insertTime})
      .write();
    db.get('deletes').push(work.insertTime).write();;
    work.insertTime = moment().valueOf();
    db.get('works')
          .push(work)
          .write();
  }
}

