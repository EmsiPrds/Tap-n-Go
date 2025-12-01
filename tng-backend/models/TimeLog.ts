import { Schema, model, Model } from 'mongoose';
import { ITimeLog } from '../types/index.js';

const timeLogSchema = new Schema<ITimeLog>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  timeIn: { type: Date },
  breakOut: { type: Date },
  breakIn: { type: Date },
  timeOut: { type: Date },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['present', 'late', 'absent', 'on-break'],
    default: 'present'
  },
  notes: { type: String },
  photoVerification: { type: String },
}, {
  timestamps: true
});

// Index for faster queries
timeLogSchema.index({ employeeId: 1, date: 1 });
timeLogSchema.index({ date: 1 });
timeLogSchema.index({ status: 1 });

const TimeLog: Model<ITimeLog> = model<ITimeLog>('TimeLog', timeLogSchema);

export default TimeLog;

