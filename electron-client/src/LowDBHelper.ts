import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import  moment, { Moment } from 'moment';
import { Work } from './Work';

const adapter = new FileSync('db.json'); // 申明一个适配器
const db = low(adapter);

db.defaults({works: []})
  .write();

export function getUserWorks(userid: number, date: Moment): Work[] {
  return db.get("works").filter({function(work:Work) {
    return work.userId == userid && moment(work.endTime).isSame(date, 'days');
  }}).value();
}

export function updateWorkTime(work: Work): void {
  db.get('works')
      .find({ insertTime: work.insertTime })
      .assign({ startTime: work.startTime, endTime: work.endTime,
        startEndTime: work.startEndTime, cost: work.cost
      })
      .write();
}

export function insertWork(work:Work): void {
  db.get('works')
        .push(work)
        .write();
}

export function removeWork(work:Work): void {
  db.get('works').remove({insertTime: work.insertTime}).write();
}

export function updateWorkContent(work:Work) {
  db.get('works')
      .find({ insertTime: work.insertTime })
      .assign({ content: work.content})
      .write();
}