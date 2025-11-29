import { Schema, model, Model } from 'mongoose';
import { IEmployee } from '../types/index.js';

const employeeSchema = new Schema<IEmployee>({
    name: { type: String, required: true },
    position: { type: String, required: true },  // Ensure position is included and required
}, {
    timestamps: true
});

const Employee: Model<IEmployee> = model<IEmployee>('Employee', employeeSchema);

export default Employee;

