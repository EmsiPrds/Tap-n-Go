import { Schema, model } from 'mongoose';
const timeLogSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  timeIn: { type: Date },
  timeOut: { type: Date },
  date: { type: Date, default: Date.now },
  photoVerification: { type: String },
});
export default model('TimeLog', timeLogSchema);