export interface Employee {
  id: string;
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
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  time_in?: string;
  break_out?: string;
  break_in?: string;
  time_out?: string;
  status: "present" | "late" | "absent" | "on-break";
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  employee_id: string;
  action: string;
  performed_by: string;
  timestamp: string;
  details?: string;
}

export interface DashboardStats {
  totalPresent: number;
  lateEmployees: number;
  onBreak: number;
  timedOut: number;
}

export type TapAction = "time-in" | "break-out" | "break-in" | "time-out";
