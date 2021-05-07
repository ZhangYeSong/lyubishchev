import * as mongoose from 'mongoose';

export const WorkSchema = new mongoose.Schema({
  userId: Number,
  insertTime: {type: Number, unique: true},
  content: String,
  startTime: Number,
  endTime: Number,
  startEndTime: String,
  cost: String
});