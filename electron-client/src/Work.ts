import moment from 'moment';

export class  Work {
  userId: number;
  insertTime: number;
  content: string;
  startTime: number;
  endTime: number;
  startEndTime: string;
  cost: string;
  delete: boolean;

  constructor(userId: number, insertTime: number, content: string, startTime: number, endTime: number) {
    this.userId = userId;
    this.insertTime = insertTime;
    this.content = content;
    this.startTime = startTime;
    this.endTime = endTime;
    this.delete = false;
    updateTimeString(this);
  }
}

export function updateTimeString(work: Work):void {
  work.startEndTime = 
    moment(work.startTime).format("LT")
    + " - "
    + moment(work.endTime).format("LT");
  work.cost = (moment(work.endTime).diff(moment(work.startTime), "minutes") + 1) + "分钟";
}
