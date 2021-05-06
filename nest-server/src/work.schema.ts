import * as mongoose from 'mongoose';

export const WorkSchema = new mongoose.Schema({
  userId: Number,
  insertTime: Number,
  content: String,
  startTime: Number,
  endTime: Number,
  startEndTime: String,
  cost: String
});