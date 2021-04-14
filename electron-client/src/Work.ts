import moment from 'moment';

export class Work {
  userId: number;
  insertTime: number;
  content: string;
  startTime: number;
  endTime: number;
  startEndTime: string;
  cost: string

  constructor(userId: number, insertTime: number, content: string, startTime: number, endTime: number) {
    this.userId = userId;
    this.insertTime = insertTime;
    this.content = content;
    this.startTime = startTime;
    this.endTime = endTime;
    this.startEndTime = this.getStartEndTimeString();
    this.cost = this.getCostTimeString();
  }

  public getStartEndTimeString() {
    return moment(this.startTime).format("LT")
      + " - "
      + moment(this.endTime).format("LT");
  }

  public getCostTimeString() {
    return(moment(this.endTime).diff(moment(this.startTime), "minutes") + 1) + "分钟";
  }
}
