import { Schema, model } from 'mongoose';

const employeeSchema = new Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },  // Ensure position is included and required
});

export default model('Employee', employeeSchema);
