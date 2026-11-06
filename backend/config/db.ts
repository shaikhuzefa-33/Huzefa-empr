import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// In-memory fallback dataset mirroring the exact MySQL 8.0 schema and seed data
export interface DbUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'hr' | 'employee';
  is_active: number;
}

export interface DbDepartment {
  id: number;
  department_name: string;
  department_code: string;
  description: string;
  head_of_department: string;
}

export interface DbDesignation {
  id: number;
  department_id: number;
  designation_name: string;
  designation_code: string;
  description: string;
}

export interface DbEmployee {
  id: number;
  employee_code: string;
  user_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  date_of_joining: string;
  department_id: number;
  designation_id: number;
  employment_type: string;
  address: string;
  bank_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  pan_number: string;
  profile_picture: string;
  status: 'Active' | 'Inactive' | 'Terminated' | 'On Leave';
}

export interface DbSalaryStructure {
  id: number;
  employee_id: number;
  basic_salary: number;
  hra: number;
  da: number;
  special_allowance: number;
  other_allowances: number;
  bonus: number;
  pf_deduction: number;
  esi_deduction: number;
  professional_tax: number;
  tds_deduction: number;
  other_deductions: number;
  effective_from: string;
}

export interface DbAttendance {
  id: number;
  employee_id: number;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number;
  status: 'Present' | 'Absent' | 'Half-day' | 'Holiday' | 'On-Leave';
  remarks: string;
}

export interface DbLeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason?: string;
}

export interface DbLeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  allocated_days: number;
  used_days: number;
  remaining_days: number;
}

export interface DbPayrollPeriod {
  id: number;
  period_name: string;
  month: number;
  year: number;
  start_date: string;
  end_date: string;
  total_working_days: number;
  status: 'Draft' | 'Processing' | 'Approved' | 'Paid' | 'Closed';
  processed_by: number | null;
  processed_at: string | null;
}

export interface DbPayroll {
  id: number;
  period_id: number;
  employee_id: number;
  total_days: number;
  worked_days: number;
  paid_leave_days: number;
  loss_of_pay_days: number;
  basic_salary: number;
  total_allowances: number;
  bonus: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  payment_status: 'Pending' | 'Paid' | 'On-Hold';
}

export interface DbPayment {
  id: number;
  payroll_id: number;
  employee_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_reference: string;
  payment_status: 'Completed' | 'Pending' | 'Failed';
  remarks: string;
  recorded_by: number | null;
}

// In-memory data store with realistic initial mock data
export const store = {
  users: [
    { id: 1, username: 'admin', email: 'admin@epms-corp.com', password_hash: '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', role: 'admin', is_active: 1 },
    { id: 2, username: 'hrmanager', email: 'hr@epms-corp.com', password_hash: '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', role: 'hr', is_active: 1 },
    { id: 3, username: 'huzefa', email: 'huzefa@epms-corp.com', password_hash: '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', role: 'employee', is_active: 1 },
    { id: 4, username: 'sarah.connor', email: 'sarah.c@epms-corp.com', password_hash: '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', role: 'employee', is_active: 1 },
    { id: 5, username: 'raj.patel', email: 'raj.patel@epms-corp.com', password_hash: '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', role: 'employee', is_active: 1 },
  ] as DbUser[],

  departments: [
    { id: 1, department_name: 'Engineering & Technology', department_code: 'ENG', description: 'Software development, cloud infrastructure, and core products', head_of_department: 'Dr. Alan Vance' },
    { id: 2, department_name: 'Human Resources', department_code: 'HR', description: 'Talent recruitment, employee relations, and compensation', head_of_department: 'Priya Sharma' },
    { id: 3, department_name: 'Finance & Accounts', department_code: 'FIN', description: 'Corporate accounting, tax compliances, and audit reporting', head_of_department: 'Michael Scott' },
    { id: 4, department_name: 'Marketing & Growth', department_code: 'MKT', description: 'Brand expansion, digital marketing, and client outreach', head_of_department: 'Elena Rostova' },
    { id: 5, department_name: 'Operations & Logistics', department_code: 'OPS', description: 'Office management, vendor coordination, and infrastructure', head_of_department: 'David Kim' },
  ] as DbDepartment[],

  designations: [
    { id: 1, department_id: 1, designation_name: 'Senior Software Engineer', designation_code: 'SR_SWE', description: 'Core full-stack development and architecture' },
    { id: 2, department_id: 1, designation_name: 'DevOps & Cloud Engineer', designation_code: 'OPS_ENG', description: 'CI/CD pipelines, container orchestration, monitoring' },
    { id: 3, department_id: 2, designation_name: 'HR Operations Lead', designation_code: 'HR_LEAD', description: 'Employee benefits, payroll management, and onboarding' },
    { id: 4, department_id: 3, designation_name: 'Senior Financial Analyst', designation_code: 'SR_FA', description: 'Balance sheet reconciliation and tax strategy' },
    { id: 5, department_id: 4, designation_name: 'Digital Marketing Strategist', designation_code: 'MKT_STRAT', description: 'Performance marketing and brand campaigns' },
    { id: 6, department_id: 1, designation_name: 'QA Automation Engineer', designation_code: 'QA_ENG', description: 'End-to-end testing and quality control' },
  ] as DbDesignation[],

  employees: [
    {
      id: 1,
      employee_code: 'EMP1001',
      user_id: 3,
      first_name: 'Huzefa',
      last_name: 'Ali',
      email: 'huzefa@epms-corp.com',
      phone: '+91 98765 43210',
      gender: 'Male',
      date_of_birth: '1998-05-14',
      date_of_joining: '2023-02-01',
      department_id: 1,
      designation_id: 1,
      employment_type: 'Full-time',
      address: '42 Silicon Avenue, IT Park, Tech Corridor',
      bank_name: 'HDFC Bank',
      bank_account_number: '50100492817263',
      bank_ifsc: 'HDFC0001234',
      pan_number: 'ABCDE1234F',
      profile_picture: '/assets/aistudio/WhatsApp_Image_2026-08-10_at_11.59.10__2__21d628fb.jpeg',
      status: 'Active',
    },
    {
      id: 2,
      employee_code: 'EMP1002',
      user_id: 4,
      first_name: 'Sarah',
      last_name: 'Connor',
      email: 'sarah.c@epms-corp.com',
      phone: '+91 98765 43211',
      gender: 'Female',
      date_of_birth: '1995-09-22',
      date_of_joining: '2022-07-15',
      department_id: 1,
      designation_id: 2,
      employment_type: 'Full-time',
      address: '18 Cyber City Blvd, Suite 400',
      bank_name: 'ICICI Bank',
      bank_account_number: '00230192847581',
      bank_ifsc: 'ICIC0000023',
      pan_number: 'BCDEF2345G',
      profile_picture: '',
      status: 'Active',
    },
    {
      id: 3,
      employee_code: 'EMP1003',
      user_id: 5,
      first_name: 'Raj',
      last_name: 'Patel',
      email: 'raj.patel@epms-corp.com',
      phone: '+91 98765 43212',
      gender: 'Male',
      date_of_birth: '1997-12-03',
      date_of_joining: '2023-08-10',
      department_id: 4,
      designation_id: 5,
      employment_type: 'Full-time',
      address: '88 Sunset Crest Road, Midtown',
      bank_name: 'State Bank of India',
      bank_account_number: '30948572619284',
      bank_ifsc: 'SBIN0004928',
      pan_number: 'CDEFG3456H',
      profile_picture: '',
      status: 'Active',
    },
    {
      id: 4,
      employee_code: 'EMP1004',
      user_id: 2,
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'hr@epms-corp.com',
      phone: '+91 98765 43213',
      gender: 'Female',
      date_of_birth: '1992-04-18',
      date_of_joining: '2021-03-01',
      department_id: 2,
      designation_id: 3,
      employment_type: 'Full-time',
      address: '12 Emerald Greens, Executive Enclave',
      bank_name: 'Axis Bank',
      bank_account_number: '91402004827164',
      bank_ifsc: 'UTIB0000914',
      pan_number: 'DEFGH4567I',
      profile_picture: '',
      status: 'Active',
    },
    {
      id: 5,
      employee_code: 'EMP1005',
      user_id: null,
      first_name: 'Vikram',
      last_name: 'Mehta',
      email: 'vikram.m@epms-corp.com',
      phone: '+91 98765 43214',
      gender: 'Male',
      date_of_birth: '1994-01-28',
      date_of_joining: '2023-11-01',
      department_id: 3,
      designation_id: 4,
      employment_type: 'Full-time',
      address: '74 Financial Heights, Commercial Zone',
      bank_name: 'Kotak Mahindra Bank',
      bank_account_number: '849201948271',
      bank_ifsc: 'KKBK0000849',
      pan_number: 'EFGHI5678J',
      profile_picture: '',
      status: 'Active',
    },
  ] as DbEmployee[],

  salary_structures: [
    { id: 1, employee_id: 1, basic_salary: 65000, hra: 26000, da: 9750, special_allowance: 12000, other_allowances: 4250, bonus: 5000, pf_deduction: 7800, esi_deduction: 0, professional_tax: 200, tds_deduction: 5000, other_deductions: 0, effective_from: '2024-01-01' },
    { id: 2, employee_id: 2, basic_salary: 60000, hra: 24000, da: 9000, special_allowance: 10000, other_allowances: 3000, bonus: 3000, pf_deduction: 7200, esi_deduction: 0, professional_tax: 200, tds_deduction: 4500, other_deductions: 0, effective_from: '2024-01-01' },
    { id: 3, employee_id: 3, basic_salary: 42000, hra: 16800, da: 6300, special_allowance: 7000, other_allowances: 2500, bonus: 2000, pf_deduction: 5040, esi_deduction: 0, professional_tax: 200, tds_deduction: 2500, other_deductions: 0, effective_from: '2024-01-01' },
    { id: 4, employee_id: 4, basic_salary: 55000, hra: 22000, da: 8250, special_allowance: 9000, other_allowances: 3000, bonus: 4000, pf_deduction: 6600, esi_deduction: 0, professional_tax: 200, tds_deduction: 3800, other_deductions: 0, effective_from: '2024-01-01' },
    { id: 5, employee_id: 5, basic_salary: 48000, hra: 19200, da: 7200, special_allowance: 8000, other_allowances: 2000, bonus: 2500, pf_deduction: 5760, esi_deduction: 0, professional_tax: 200, tds_deduction: 3000, other_deductions: 0, effective_from: '2024-01-01' },
  ] as DbSalaryStructure[],

  leave_types: [
    { id: 1, leave_name: 'Casual Leave', leave_code: 'CL', days_allowed_per_year: 12, is_paid: 1, description: 'Short personal leaves' },
    { id: 2, leave_name: 'Sick Leave', leave_code: 'SL', days_allowed_per_year: 10, is_paid: 1, description: 'Medical recovery leaves' },
    { id: 3, leave_name: 'Earned / Paid Leave', leave_code: 'PL', days_allowed_per_year: 18, is_paid: 1, description: 'Planned annual vacation days' },
    { id: 4, leave_name: 'Maternity / Paternity Leave', leave_code: 'ML', days_allowed_per_year: 90, is_paid: 1, description: 'Parental leave' },
    { id: 5, leave_name: 'Unpaid Leave (LOP)', leave_code: 'LOP', days_allowed_per_year: 0, is_paid: 0, description: 'Deducted from salary' },
  ],

  leave_balances: [
    { id: 1, employee_id: 1, leave_type_id: 1, year: 2026, allocated_days: 12, used_days: 2, remaining_days: 10 },
    { id: 2, employee_id: 1, leave_type_id: 2, year: 2026, allocated_days: 10, used_days: 1, remaining_days: 9 },
    { id: 3, employee_id: 1, leave_type_id: 3, year: 2026, allocated_days: 18, used_days: 3, remaining_days: 15 },
    { id: 4, employee_id: 2, leave_type_id: 1, year: 2026, allocated_days: 12, used_days: 1, remaining_days: 11 },
    { id: 5, employee_id: 2, leave_type_id: 2, year: 2026, allocated_days: 10, used_days: 0, remaining_days: 10 },
    { id: 6, employee_id: 2, leave_type_id: 3, year: 2026, allocated_days: 18, used_days: 4, remaining_days: 14 },
    { id: 7, employee_id: 3, leave_type_id: 1, year: 2026, allocated_days: 12, used_days: 3, remaining_days: 9 },
    { id: 8, employee_id: 3, leave_type_id: 2, year: 2026, allocated_days: 10, used_days: 2, remaining_days: 8 },
    { id: 9, employee_id: 3, leave_type_id: 3, year: 2026, allocated_days: 18, used_days: 0, remaining_days: 18 },
  ] as DbLeaveBalance[],

  leave_requests: [
    { id: 1, employee_id: 1, leave_type_id: 1, start_date: '2026-10-14', end_date: '2026-10-15', days_count: 2, reason: 'Family celebration and personal commitment', status: 'Approved', reviewed_by: 2, reviewed_at: '2026-10-12 11:30:00' },
    { id: 2, employee_id: 1, leave_type_id: 2, start_date: '2026-11-10', end_date: '2026-11-11', days_count: 2, reason: 'Medical checkup and dental appointment', status: 'Pending', reviewed_by: null, reviewed_at: null },
    { id: 3, employee_id: 2, leave_type_id: 3, start_date: '2026-10-20', end_date: '2026-10-23', days_count: 4, reason: 'Annual planned vacation with family', status: 'Approved', reviewed_by: 2, reviewed_at: '2026-10-15 15:45:00' },
    { id: 4, employee_id: 3, leave_type_id: 1, start_date: '2026-11-15', end_date: '2026-11-16', days_count: 2, reason: 'Personal errand and vehicle maintenance', status: 'Pending', reviewed_by: null, reviewed_at: null },
  ] as DbLeaveRequest[],

  attendance: [
    { id: 1, employee_id: 1, attendance_date: '2026-11-01', check_in: '09:02', check_out: '18:15', total_hours: 9.22, status: 'Present', remarks: 'On time' },
    { id: 2, employee_id: 1, attendance_date: '2026-11-02', check_in: '08:55', check_out: '18:05', total_hours: 9.17, status: 'Present', remarks: 'On time' },
    { id: 3, employee_id: 1, attendance_date: '2026-11-03', check_in: '09:12', check_out: '18:30', total_hours: 9.30, status: 'Present', remarks: 'Sprint planning' },
    { id: 4, employee_id: 1, attendance_date: '2026-11-04', check_in: '09:00', check_out: '18:00', total_hours: 9.00, status: 'Present', remarks: 'Normal hours' },
    { id: 5, employee_id: 1, attendance_date: '2026-11-05', check_in: '09:05', check_out: '18:10', total_hours: 9.08, status: 'Present', remarks: 'Code review' },
    { id: 6, employee_id: 1, attendance_date: '2026-11-06', check_in: '09:00', check_out: null, total_hours: 5.50, status: 'Present', remarks: 'Today' },
    { id: 7, employee_id: 2, attendance_date: '2026-11-06', check_in: '09:15', check_out: null, total_hours: 5.25, status: 'Present', remarks: 'Today' },
    { id: 8, employee_id: 3, attendance_date: '2026-11-06', check_in: null, check_out: null, total_hours: 0, status: 'Absent', remarks: 'Unplanned' },
    { id: 9, employee_id: 4, attendance_date: '2026-11-06', check_in: '08:45', check_out: null, total_hours: 5.75, status: 'Present', remarks: 'Today' },
    { id: 10, employee_id: 5, attendance_date: '2026-11-06', check_in: '09:10', check_out: null, total_hours: 5.30, status: 'Present', remarks: 'Today' },
  ] as DbAttendance[],

  payroll_periods: [
    { id: 1, period_name: 'October 2026 Payroll', month: 10, year: 2026, start_date: '2026-10-01', end_date: '2026-10-31', total_working_days: 31, status: 'Approved', processed_by: 2, processed_at: '2026-10-31 17:00:00' },
    { id: 2, period_name: 'November 2026 Payroll', month: 11, year: 2026, start_date: '2026-11-01', end_date: '2026-11-30', total_working_days: 30, status: 'Draft', processed_by: null, processed_at: null },
  ] as DbPayrollPeriod[],

  payroll: [
    { id: 1, period_id: 1, employee_id: 1, total_days: 31, worked_days: 29.0, paid_leave_days: 2.0, loss_of_pay_days: 0.0, basic_salary: 65000, total_allowances: 52000, bonus: 5000, gross_salary: 122000, total_deductions: 13000, net_salary: 109000, payment_status: 'Paid' },
    { id: 2, period_id: 1, employee_id: 2, total_days: 31, worked_days: 27.0, paid_leave_days: 4.0, loss_of_pay_days: 0.0, basic_salary: 60000, total_allowances: 46000, bonus: 3000, gross_salary: 109000, total_deductions: 11900, net_salary: 97100, payment_status: 'Paid' },
    { id: 3, period_id: 1, employee_id: 3, total_days: 31, worked_days: 29.0, paid_leave_days: 1.0, loss_of_pay_days: 1.0, basic_salary: 42000, total_allowances: 32600, bonus: 2000, gross_salary: 76600, total_deductions: 7740, net_salary: 68860, payment_status: 'Pending' },
    { id: 4, period_id: 1, employee_id: 4, total_days: 31, worked_days: 31.0, paid_leave_days: 0.0, loss_of_pay_days: 0.0, basic_salary: 55000, total_allowances: 42250, bonus: 4000, gross_salary: 101250, total_deductions: 10600, net_salary: 90650, payment_status: 'Paid' },
    { id: 5, period_id: 1, employee_id: 5, total_days: 31, worked_days: 31.0, paid_leave_days: 0.0, loss_of_pay_days: 0.0, basic_salary: 48000, total_allowances: 36400, bonus: 2500, gross_salary: 86900, total_deductions: 8960, net_salary: 77940, payment_status: 'Pending' },
  ] as DbPayroll[],

  payments: [
    { id: 1, payroll_id: 1, employee_id: 1, amount_paid: 109000, payment_date: '2026-11-01', payment_method: 'NEFT', transaction_reference: 'NEFT20261101HDFC8392019', payment_status: 'Completed', remarks: 'Disbursed to HDFC A/C', recorded_by: 2 },
    { id: 2, payroll_id: 2, employee_id: 2, amount_paid: 97100, payment_date: '2026-11-01', payment_method: 'Bank Transfer', transaction_reference: 'CMS20261101ICIC9482710', payment_status: 'Completed', remarks: 'Disbursed to ICICI A/C', recorded_by: 2 },
    { id: 3, payroll_id: 4, employee_id: 4, amount_paid: 90650, payment_date: '2026-11-01', payment_method: 'Bank Transfer', transaction_reference: 'CMS20261101AXIS7182940', payment_status: 'Completed', remarks: 'Disbursed to Axis A/C', recorded_by: 2 },
  ] as DbPayment[],

  salary_components: [
    { id: 1, component_name: 'Basic Salary', component_code: 'BASIC', component_type: 'Earning', calculation_type: 'Fixed', default_percentage: 0, is_statutory: 1, description: 'Base wage' },
    { id: 2, component_name: 'House Rent Allowance', component_code: 'HRA', component_type: 'Earning', calculation_type: 'Percentage', default_percentage: 40, is_statutory: 1, description: '40% of basic' },
    { id: 3, component_name: 'Dearness Allowance', component_code: 'DA', component_type: 'Earning', calculation_type: 'Percentage', default_percentage: 15, is_statutory: 1, description: 'Cost of living' },
    { id: 4, component_name: 'Special Allowance', component_code: 'SPECIAL', component_type: 'Earning', calculation_type: 'Fixed', default_percentage: 0, is_statutory: 0, description: 'Role allowance' },
    { id: 5, component_name: 'Conveyance & Other Allowance', component_code: 'OTHER_EARN', component_type: 'Earning', calculation_type: 'Fixed', default_percentage: 0, is_statutory: 0, description: 'Travel' },
    { id: 6, component_name: 'Performance Bonus', component_code: 'BONUS', component_type: 'Earning', calculation_type: 'Fixed', default_percentage: 0, is_statutory: 0, description: 'Variable bonus' },
    { id: 7, component_name: 'Provident Fund (PF)', component_code: 'PF', component_type: 'Deduction', calculation_type: 'Percentage', default_percentage: 12, is_statutory: 1, description: '12% of basic' },
    { id: 8, component_name: 'Employee State Insurance (ESI)', component_code: 'ESI', component_type: 'Deduction', calculation_type: 'Percentage', default_percentage: 0.75, is_statutory: 1, description: '0.75% of gross' },
    { id: 9, component_name: 'Professional Tax (PT)', component_code: 'PT', component_type: 'Deduction', calculation_type: 'Fixed', default_percentage: 0, is_statutory: 1, description: 'Fixed tax slab' },
    { id: 10, component_name: 'Tax Deducted at Source (TDS)', component_code: 'TDS', component_type: 'Deduction', calculation_type: 'Fixed', default_percentage: 0, is_statutory: 1, description: 'Income tax' },
  ],
};

let mysqlPool: mysql.Pool | null = null;
let isUsingMySQL = false;

// Attempt to connect to MySQL if configured in environment
export async function initializeDatabase() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'employee_payroll_db';
  const port = Number(process.env.DB_PORT) || 3306;

  if (host && user) {
    try {
      mysqlPool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      // Test query
      const [rows] = await mysqlPool.query('SELECT 1 as connected');
      isUsingMySQL = true;
      console.log(`[EPMS DB] Successfully connected to live MySQL 8.0 instance on ${host}:${port}/${database}`);
      return;
    } catch (err: any) {
      console.warn(`[EPMS DB] MySQL host specified but connection test failed (${err.message}). Using resilient embedded storage.`);
      isUsingMySQL = false;
      mysqlPool = null;
    }
  } else {
    console.log('[EPMS DB] No DB_HOST/DB_USER set. Running with embedded in-memory database with full MySQL 8.0 schema seeds.');
  }
}

export function isLiveMySQL(): boolean {
  return isUsingMySQL;
}

export function getPool(): mysql.Pool | null {
  return mysqlPool;
}
