const mongoose = require('mongoose');
const timeLogSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  timeIn: { type: Date },
  timeOut: { type: Date },
  date: { type: Date, default: Date.now },
  photoVerification: { type: String },
});
module.exports = mongoose.model('TimeLog', timeLogSchema);