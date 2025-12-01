import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';

// Extend Express Request to include admin info
export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
  };
  refreshToken?: string;
}

// Admin interface
export interface IAdmin extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  refreshToken?: string | null;
  lastLogin?: Date | null;
  loginAttempts: number;
  lockUntil?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<IAdmin>;
  resetLoginAttempts(): Promise<IAdmin>;
}

// Employee interface
export interface IEmployee extends Document {
  _id: Types.ObjectId;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  avatar_url?: string;
  shift_start: string;
  shift_end: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

// TimeLog interface
export interface ITimeLog extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  timeIn?: Date;
  breakOut?: Date;
  breakIn?: Date;
  timeOut?: Date;
  date: Date;
  status?: "present" | "late" | "absent" | "on-break";
  notes?: string;
  photoVerification?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Express types
export type ExpressHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
export type AuthHandler = (req: AuthRequest, res: Response, next: NextFunction) => void | Promise<void>;

