import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export default model('Admin', adminSchema);  // This should create 'admins' collection
