import { Document } from 'mongoose';

export interface Work extends Document {
  userId: number;
  insertTime: number;
  content: string;
  startTime: number;
  endTime: number;
  startEndTime: string;
  cost: string;
}