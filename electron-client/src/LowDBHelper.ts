import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import  moment, { Moment } from 'moment';
import { Work } from './Work';

const adapter = new FileSync('db.json'); // 申明一个适配器
const db = low(adapter);

db.defaults({works: [], startWorkTime: -1})
  .write();

export class LowDBHelper {
  static getStartWorkTime():number {
    return db.get("startWorkTime").value();
  }

  static setStartWorkTime(time: number):void {
    return db.set("startWorkTime", time).write();
  }

  static getUserWorks(userid: number, date: Moment): Work[] {
    return db.get("works").filter({function(work:Work) {
      return work.userId == userid && work.delete == false && moment(work.endTime).isSame(date, 'days');
    }}).value();
  }

  static insertWork(work:Work): void {
    db.get('works')
          .push(work)
          .write();
  }

  static removeWork(work:Work): void {
    db.get('works')
      .find({insertTime: work.insertTime})
      .assign({delete: true})
      .write();
  }
  
  static updateWork(work: Work): void {
    db.get('works')
      .find({insertTime: work.insertTime})
      .assign({delete: true})
      .write();
    work.insertTime = moment().valueOf();
    db.get('works')
          .push(work)
          .write();
  }
}

