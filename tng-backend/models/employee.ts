import { Schema, model, Model } from 'mongoose';
import { IEmployee } from '../types/index.js';

const employeeSchema = new Schema<IEmployee>({
    employee_id: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        uppercase: true
    },
    first_name: { 
        type: String, 
        required: true,
        trim: true
    },
    last_name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    department: { 
        type: String, 
        required: true,
        trim: true
    },
    position: { 
        type: String, 
        required: true,
        trim: true
    },
    avatar_url: { 
        type: String, 
        trim: true
    },
    shift_start: { 
        type: String, 
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
    },
    shift_end: { 
        type: String, 
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for faster searches (employee_id and email already have unique indexes)
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

const Employee: Model<IEmployee> = model<IEmployee>('Employee', employeeSchema);

export default Employee;

