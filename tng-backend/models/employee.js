const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },  // Ensure position is included and required
});

module.exports = mongoose.model('Employee', employeeSchema);
