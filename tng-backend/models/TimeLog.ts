import { Schema, model, Model } from 'mongoose';
import { ITimeLog } from '../types/index.js';

const timeLogSchema = new Schema<ITimeLog>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  timeIn: { type: Date },
  timeOut: { type: Date },
  date: { type: Date, default: Date.now },
  photoVerification: { type: String },
}, {
  timestamps: true
});

const TimeLog: Model<ITimeLog> = model<ITimeLog>('TimeLog', timeLogSchema);

export default TimeLog;

