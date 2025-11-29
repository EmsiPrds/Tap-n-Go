import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IAdmin } from '../types/index.js';

const adminSchema = new Schema<IAdmin>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [3, 'Password must be at least 3 characters'],
        select: false // Don't return password by default
    },
    refreshToken: {
        type: String,
        default: null,
        select: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshToken;
            delete ret.loginAttempts;
            delete ret.lockUntil;
            return ret;
        }
    }
});

// Index for faster queries (username already indexed via unique: true)
adminSchema.index({ refreshToken: 1 });

// Pre-save hook to hash password before saving (only if password is modified)
adminSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        // Hash password with bcrypt
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        // If password is not loaded, fetch it
        if (!this.password) {
            const admin = await Admin.findById(this._id).select('+password');
            if (!admin || !admin.password) {
                return false;
            }
            this.password = admin.password;
        }
        
        // Compare password
        if (!this.password) {
            return false;
        }
        
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = async function(): Promise<IAdmin> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.loginAttempts = 1;
        this.lockUntil = undefined;
        return await this.save();
    }
    
    this.loginAttempts += 1;
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts >= 5 && !this.isLocked) {
        this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }
    
    return await this.save();
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = async function(): Promise<IAdmin> {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return await this.save();
};

const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;

