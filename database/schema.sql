-- =====================================================================
-- Employee Payroll Management System (EPMS)
-- Database: employee_payroll_db
-- Target: MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `employee_payroll_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `employee_payroll_db`;

-- Drop tables in reverse foreign key order if needed
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `payroll_details`;
DROP TABLE IF EXISTS `salary_components`;
DROP TABLE IF EXISTS `payroll`;
DROP TABLE IF EXISTS `payroll_periods`;
DROP TABLE IF EXISTS `leave_balances`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `leave_types`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `salary_structures`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `designations`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'hr', 'employee') NOT NULL DEFAULT 'employee',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. DEPARTMENTS TABLE
CREATE TABLE `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_name` VARCHAR(100) NOT NULL UNIQUE,
  `department_code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `head_of_department` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DESIGNATIONS TABLE
CREATE TABLE `designations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NOT NULL,
  `designation_name` VARCHAR(100) NOT NULL,
  `designation_code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_designation_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. EMPLOYEES TABLE
CREATE TABLE `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_code` VARCHAR(30) NOT NULL UNIQUE,
  `user_id` INT NULL UNIQUE,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `date_of_joining` DATE NOT NULL,
  `department_id` INT NOT NULL,
  `designation_id` INT NOT NULL,
  `employment_type` ENUM('Full-time', 'Part-time', 'Contract', 'Intern') NOT NULL DEFAULT 'Full-time',
  `address` TEXT NULL,
  `bank_name` VARCHAR(100) DEFAULT 'State Bank of India',
  `bank_account_number` VARCHAR(50) NOT NULL,
  `bank_ifsc` VARCHAR(20) NOT NULL,
  `pan_number` VARCHAR(20) NULL,
  `profile_picture` VARCHAR(255) NULL,
  `status` ENUM('Active', 'Inactive', 'Terminated', 'On Leave') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`designation_id`) REFERENCES `designations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_emp_code` (`employee_code`),
  INDEX `idx_emp_dept` (`department_id`),
  INDEX `idx_emp_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SALARY_STRUCTURES TABLE
CREATE TABLE `salary_structures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL UNIQUE,
  `basic_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `hra` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `da` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `special_allowance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `other_allowances` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `bonus` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `pf_deduction` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `esi_deduction` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `professional_tax` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tds_deduction` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `other_deductions` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `effective_from` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ATTENDANCE TABLE
CREATE TABLE `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `check_in` TIME NULL,
  `check_out` TIME NULL,
  `total_hours` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Present', 'Absent', 'Half-day', 'Holiday', 'On-Leave') NOT NULL DEFAULT 'Present',
  `remarks` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_emp_attendance_date` (`employee_id`, `attendance_date`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_att_date` (`attendance_date`),
  INDEX `idx_att_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. LEAVE_TYPES TABLE
CREATE TABLE `leave_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `leave_name` VARCHAR(50) NOT NULL UNIQUE,
  `leave_code` VARCHAR(10) NOT NULL UNIQUE,
  `days_allowed_per_year` INT NOT NULL DEFAULT 12,
  `is_paid` TINYINT(1) NOT NULL DEFAULT 1,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. LEAVE_BALANCES TABLE
CREATE TABLE `leave_balances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `leave_type_id` INT NOT NULL,
  `year` INT NOT NULL,
  `allocated_days` DECIMAL(4,1) NOT NULL DEFAULT 12.0,
  `used_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  `remaining_days` DECIMAL(4,1) NOT NULL DEFAULT 12.0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_emp_leave_year` (`employee_id`, `leave_type_id`, `year`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LEAVE_REQUESTS TABLE
CREATE TABLE `leave_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `leave_type_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `days_count` DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `reviewed_by` INT NULL,
  `reviewed_at` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_leave_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PAYROLL_PERIODS TABLE
CREATE TABLE `payroll_periods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `period_name` VARCHAR(50) NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_working_days` INT NOT NULL DEFAULT 30,
  `status` ENUM('Draft', 'Processing', 'Approved', 'Paid', 'Closed') NOT NULL DEFAULT 'Draft',
  `processed_by` INT NULL,
  `processed_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_period_month_year` (`month`, `year`),
  FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PAYROLL TABLE
CREATE TABLE `payroll` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `period_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `total_days` INT NOT NULL DEFAULT 30,
  `worked_days` DECIMAL(4,1) NOT NULL DEFAULT 30.0,
  `paid_leave_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  `loss_of_pay_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  `basic_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_allowances` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `bonus` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `gross_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_deductions` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `net_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('Pending', 'Paid', 'On-Hold') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_employee_period_payroll` (`period_id`, `employee_id`),
  FOREIGN KEY (`period_id`) REFERENCES `payroll_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_payroll_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. SALARY_COMPONENTS TABLE (Configurable items for flexibility)
CREATE TABLE `salary_components` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `component_name` VARCHAR(50) NOT NULL,
  `component_code` VARCHAR(20) NOT NULL UNIQUE,
  `component_type` ENUM('Earning', 'Deduction') NOT NULL,
  `calculation_type` ENUM('Fixed', 'Percentage') NOT NULL DEFAULT 'Fixed',
  `default_percentage` DECIMAL(5,2) NULL DEFAULT 0.00,
  `is_statutory` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. PAYROLL_DETAILS TABLE (Line items for each processed payroll entry)
CREATE TABLE `payroll_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payroll_id` INT NOT NULL,
  `component_name` VARCHAR(100) NOT NULL,
  `component_type` ENUM('Earning', 'Deduction') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (`payroll_id`) REFERENCES `payroll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_details_payroll` (`payroll_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PAYMENTS TABLE
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payroll_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `amount_paid` DECIMAL(12,2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` ENUM('Bank Transfer', 'NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash') NOT NULL DEFAULT 'Bank Transfer',
  `transaction_reference` VARCHAR(100) NOT NULL UNIQUE,
  `payment_status` ENUM('Completed', 'Pending', 'Failed') NOT NULL DEFAULT 'Completed',
  `remarks` VARCHAR(255) NULL,
  `recorded_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`payroll_id`) REFERENCES `payroll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_pay_date` (`payment_date`),
  INDEX `idx_pay_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. PAYSLIPS TABLE
CREATE TABLE `payslips` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payroll_id` INT NOT NULL UNIQUE,
  `employee_id` INT NOT NULL,
  `payslip_number` VARCHAR(50) NOT NULL UNIQUE,
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_path` VARCHAR(255) NULL,
  `is_viewed` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`payroll_id`) REFERENCES `payroll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_payslip_emp` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- INITIAL SEED DATA
-- Default Passwords are all hashed with bcrypt: 'Password@123'
-- Hash: $2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m
-- =====================================================================

-- 1. Insert Users
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `is_active`) VALUES
(1, 'admin', 'admin@epms-corp.com', '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', 'admin', 1),
(2, 'hrmanager', 'hr@epms-corp.com', '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', 'hr', 1),
(3, 'huzefa', 'huzefa@epms-corp.com', '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', 'employee', 1),
(4, 'sarah.connor', 'sarah.c@epms-corp.com', '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', 'employee', 1),
(5, 'raj.patel', 'raj.patel@epms-corp.com', '$2b$10$vI8aWBnW3fID.ZQ4/ZO1G.q1pB6J7uN21NZZV7lQ5rQ8YyEw1Zz1m', 'employee', 1);

-- 2. Insert Departments
INSERT INTO `departments` (`id`, `department_name`, `department_code`, `description`, `head_of_department`) VALUES
(1, 'Engineering & Technology', 'ENG', 'Software development, infrastructure, and technical innovations', 'Dr. Alan Vance'),
(2, 'Human Resources', 'HR', 'Talent acquisition, employee welfare, payroll, and compliance', 'Priya Sharma'),
(3, 'Finance & Accounts', 'FIN', 'Financial reporting, accounting, statutory audits, and tax filings', 'Michael Scott'),
(4, 'Marketing & Sales', 'MKT', 'Brand marketing, customer outreach, campaigns, and partnerships', 'Elena Rostova'),
(5, 'Operations & Logistics', 'OPS', 'Day-to-day office operations, facilities, and vendor administration', 'David Kim');

-- 3. Insert Designations
INSERT INTO `designations` (`id`, `department_id`, `designation_name`, `designation_code`, `description`) VALUES
(1, 1, 'Senior Software Engineer', 'SR_SWE', 'Full-stack engineering, architecture, and code mentorship'),
(2, 1, 'DevOps & Cloud Engineer', 'OPS_ENG', 'CI/CD pipelines, cloud scalability, and security hardening'),
(3, 2, 'HR Operations Lead', 'HR_LEAD', 'Employee lifecycle management, compliance, and dispute resolution'),
(4, 3, 'Senior Financial Analyst', 'SR_FA', 'Financial budget analysis, treasury, and tax management'),
(5, 4, 'Digital Marketing Strategist', 'MKT_STRAT', 'SEO, social media campaigns, brand elevation, and lead generation'),
(6, 1, 'QA Automation Engineer', 'QA_ENG', 'Automated test suite maintenance and quality assurance');

-- 4. Insert Employees (Using user photo for Huzefa)
INSERT INTO `employees` (`id`, `employee_code`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `date_of_birth`, `date_of_joining`, `department_id`, `designation_id`, `employment_type`, `address`, `bank_name`, `bank_account_number`, `bank_ifsc`, `pan_number`, `profile_picture`, `status`) VALUES
(1, 'EMP1001', 3, 'Huzefa', 'Ali', 'huzefa@epms-corp.com', '+91 98765 43210', 'Male', '1998-05-14', '2023-02-01', 1, 1, 'Full-time', '42 Silicon Avenue, IT Park, Tech Corridor', 'HDFC Bank', '50100492817263', 'HDFC0001234', 'ABCDE1234F', '/assets/aistudio/WhatsApp_Image_2026-08-10_at_11.59.10__2__21d628fb.jpeg', 'Active'),
(2, 'EMP1002', 4, 'Sarah', 'Connor', 'sarah.c@epms-corp.com', '+91 98765 43211', 'Female', '1995-09-22', '2022-07-15', 1, 2, 'Full-time', '18 Cyber City Blvd, Suite 400', 'ICICI Bank', '00230192847581', 'ICIC0000023', 'BCDEF2345G', '', 'Active'),
(3, 'EMP1003', 5, 'Raj', 'Patel', 'raj.patel@epms-corp.com', '+91 98765 43212', 'Male', '1997-12-03', '2023-08-10', 4, 5, 'Full-time', '88 Sunset Crest Road, Midtown', 'State Bank of India', '30948572619284', 'SBIN0004928', 'CDEFG3456H', '', 'Active'),
(4, 'EMP1004', 2, 'Priya', 'Sharma', 'hr@epms-corp.com', '+91 98765 43213', 'Female', '1992-04-18', '2021-03-01', 2, 3, 'Full-time', '12 Emerald Greens, Executive Enclave', 'Axis Bank', '91402004827164', 'UTIB0000914', 'DEFGH4567I', '', 'Active'),
(5, 'EMP1005', NULL, 'Vikram', 'Mehta', 'vikram.m@epms-corp.com', '+91 98765 43214', 'Male', '1994-01-28', '2023-11-01', 3, 4, 'Full-time', '74 Financial Heights, Commercial Zone', 'Kotak Mahindra Bank', '849201948271', 'KKBK0000849', 'EFGHI5678J', '', 'Active');

-- 5. Insert Salary Structures
INSERT INTO `salary_structures` (`id`, `employee_id`, `basic_salary`, `hra`, `da`, `special_allowance`, `other_allowances`, `bonus`, `pf_deduction`, `esi_deduction`, `professional_tax`, `tds_deduction`, `other_deductions`, `effective_from`) VALUES
(1, 1, 65000.00, 26000.00, 9750.00, 12000.00, 4250.00, 5000.00, 7800.00, 0.00, 200.00, 5000.00, 0.00, '2024-01-01'),
(2, 2, 60000.00, 24000.00, 9000.00, 10000.00, 3000.00, 3000.00, 7200.00, 0.00, 200.00, 4500.00, 0.00, '2024-01-01'),
(3, 3, 42000.00, 16800.00, 6300.00, 7000.00, 2500.00, 2000.00, 5040.00, 0.00, 200.00, 2500.00, 0.00, '2024-01-01'),
(4, 4, 55000.00, 22000.00, 8250.00, 9000.00, 3000.00, 4000.00, 6600.00, 0.00, 200.00, 3800.00, 0.00, '2024-01-01'),
(5, 5, 48000.00, 19200.00, 7200.00, 8000.00, 2000.00, 2500.00, 5760.00, 0.00, 200.00, 3000.00, 0.00, '2024-01-01');

-- 6. Insert Leave Types
INSERT INTO `leave_types` (`id`, `leave_name`, `leave_code`, `days_allowed_per_year`, `is_paid`, `description`) VALUES
(1, 'Casual Leave', 'CL', 12, 1, 'Short personal leaves for errands or unplanned events'),
(2, 'Sick Leave', 'SL', 10, 1, 'Medical or health recuperation leaves'),
(3, 'Earned / Paid Leave', 'PL', 18, 1, 'Planned annual vacation days accrued monthly'),
(4, 'Maternity / Paternity Leave', 'ML', 90, 1, 'Parental care leaves as per statutory norms'),
(5, 'Unpaid Leave / LOP', 'LOP', 0, 0, 'Leave without pay deducted from monthly salary');

-- 7. Insert Leave Balances for 2026
INSERT INTO `leave_balances` (`employee_id`, `leave_type_id`, `year`, `allocated_days`, `used_days`, `remaining_days`) VALUES
(1, 1, 2026, 12.0, 2.0, 10.0),
(1, 2, 2026, 10.0, 1.0, 9.0),
(1, 3, 2026, 18.0, 3.0, 15.0),
(2, 1, 2026, 12.0, 1.0, 11.0),
(2, 2, 2026, 10.0, 0.0, 10.0),
(2, 3, 2026, 18.0, 4.0, 14.0),
(3, 1, 2026, 12.0, 3.0, 9.0),
(3, 2, 2026, 10.0, 2.0, 8.0),
(3, 3, 2026, 18.0, 0.0, 18.0);

-- 8. Insert Salary Components
INSERT INTO `salary_components` (`id`, `component_name`, `component_code`, `component_type`, `calculation_type`, `default_percentage`, `is_statutory`, `description`) VALUES
(1, 'Basic Salary', 'BASIC', 'Earning', 'Fixed', 0.00, 1, 'Base wage excluding allowances'),
(2, 'House Rent Allowance', 'HRA', 'Earning', 'Percentage', 40.00, 1, '40% of basic salary for non-metro, 50% for metro'),
(3, 'Dearness Allowance', 'DA', 'Earning', 'Percentage', 15.00, 1, 'Cost of living adjustment component'),
(4, 'Special Allowance', 'SPECIAL', 'Earning', 'Fixed', 0.00, 0, 'Performance or role-specific fixed allowance'),
(5, 'Conveyance & Other Allowance', 'OTHER_EARN', 'Earning', 'Fixed', 0.00, 0, 'Travel and miscellaneous allowance'),
(6, 'Performance Bonus', 'BONUS', 'Earning', 'Fixed', 0.00, 0, 'Variable quarterly or monthly achievement bonus'),
(7, 'Provident Fund (PF)', 'PF', 'Deduction', 'Percentage', 12.00, 1, 'Employee contribution of 12% of basic salary'),
(8, 'Employee State Insurance (ESI)', 'ESI', 'Deduction', 'Percentage', 0.75, 1, 'Statutory medical contribution for eligible thresholds'),
(9, 'Professional Tax (PT)', 'PT', 'Deduction', 'Fixed', 0.00, 1, 'State government professional tax deduction'),
(10, 'Tax Deducted at Source (TDS)', 'TDS', 'Deduction', 'Fixed', 0.00, 1, 'Income tax deduction as per IT declaration slabs');

-- 9. Insert Sample Attendance Records
INSERT INTO `attendance` (`employee_id`, `attendance_date`, `check_in`, `check_out`, `total_hours`, `status`, `remarks`) VALUES
(1, '2026-11-01', '09:02:00', '18:15:00', 9.22, 'Present', 'On time'),
(1, '2026-11-02', '08:55:00', '18:05:00', 9.17, 'Present', 'On time'),
(1, '2026-11-03', '09:12:00', '18:30:00', 9.30, 'Present', 'Sprint planning meet'),
(1, '2026-11-04', '09:00:00', '18:00:00', 9.00, 'Present', 'Normal hours'),
(1, '2026-11-05', '09:05:00', '18:10:00', 9.08, 'Present', 'Code review session'),
(2, '2026-11-01', '09:15:00', '18:10:00', 8.92, 'Present', 'Normal hours'),
(2, '2026-11-02', '09:00:00', '13:00:00', 4.00, 'Half-day', 'Doctor appointment afternoon'),
(2, '2026-11-03', '08:58:00', '18:02:00', 9.07, 'Present', 'On time'),
(3, '2026-11-01', '09:30:00', '18:30:00', 9.00, 'Present', 'Client call'),
(3, '2026-11-02', NULL, NULL, 0.00, 'Absent', 'Unplanned absence'),
(3, '2026-11-03', '09:05:00', '18:00:00', 8.92, 'Present', 'Campaign launch');

-- 10. Insert Sample Leave Requests
INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days_count`, `reason`, `status`, `reviewed_by`, `reviewed_at`) VALUES
(1, 1, 1, '2026-10-14', '2026-10-15', 2.0, 'Family celebration and personal commitment', 'Approved', 2, '2026-10-12 11:30:00'),
(2, 1, 2, '2026-11-10', '2026-11-11', 2.0, 'Medical checkup and dental appointment', 'Pending', NULL, NULL),
(3, 2, 3, '2026-10-20', '2026-10-23', 4.0, 'Annual planned vacation with family', 'Approved', 2, '2026-10-15 15:45:00'),
(4, 3, 1, '2026-11-15', '2026-11-16', 2.0, 'Personal errand and vehicle servicing', 'Pending', NULL, NULL);

-- 11. Insert Payroll Period for October 2026
INSERT INTO `payroll_periods` (`id`, `period_name`, `month`, `year`, `start_date`, `end_date`, `total_working_days`, `status`, `processed_by`, `processed_at`) VALUES
(1, 'October 2026 Payroll', 10, 2026, '2026-10-01', '2026-10-31', 31, 'Approved', 2, '2026-10-31 17:00:00');

-- 12. Insert Processed Payroll Records
INSERT INTO `payroll` (`id`, `period_id`, `employee_id`, `total_days`, `worked_days`, `paid_leave_days`, `loss_of_pay_days`, `basic_salary`, `total_allowances`, `bonus`, `gross_salary`, `total_deductions`, `net_salary`, `payment_status`) VALUES
(1, 1, 1, 31, 29.0, 2.0, 0.0, 65000.00, 52000.00, 5000.00, 122000.00, 13000.00, 109000.00, 'Paid'),
(2, 1, 2, 31, 27.0, 4.0, 0.0, 60000.00, 46000.00, 3000.00, 109000.00, 11900.00, 97100.00, 'Paid'),
(3, 1, 3, 31, 29.0, 1.0, 1.0, 42000.00, 32600.00, 2000.00, 76600.00, 7740.00, 68860.00, 'Pending'),
(4, 1, 4, 31, 31.0, 0.0, 0.0, 55000.00, 42250.00, 4000.00, 101250.00, 10600.00, 90650.00, 'Paid'),
(5, 1, 5, 31, 31.0, 0.0, 0.0, 48000.00, 36400.00, 2500.00, 86900.00, 8960.00, 77940.00, 'Pending');

-- 13. Insert Payroll Line Item Details
INSERT INTO `payroll_details` (`payroll_id`, `component_name`, `component_type`, `amount`) VALUES
(1, 'Basic Salary', 'Earning', 65000.00),
(1, 'House Rent Allowance (HRA)', 'Earning', 26000.00),
(1, 'Dearness Allowance (DA)', 'Earning', 9750.00),
(1, 'Special Allowance', 'Earning', 12000.00),
(1, 'Other Allowances', 'Earning', 4250.00),
(1, 'Performance Bonus', 'Earning', 5000.00),
(1, 'Provident Fund (PF)', 'Deduction', 7800.00),
(1, 'Professional Tax (PT)', 'Deduction', 200.00),
(1, 'Tax Deducted at Source (TDS)', 'Deduction', 5000.00);

-- 14. Insert Payments
INSERT INTO `payments` (`id`, `payroll_id`, `employee_id`, `amount_paid`, `payment_date`, `payment_method`, `transaction_reference`, `payment_status`, `remarks`, `recorded_by`) VALUES
(1, 1, 1, 109000.00, '2026-11-01', 'NEFT', 'NEFT20261101HDFC8392019', 'Completed', 'Monthly salary disbursed to HDFC A/C', 2),
(2, 2, 2, 97100.00, '2026-11-01', 'Bank Transfer', 'CMS20261101ICIC9482710', 'Completed', 'Monthly salary disbursed to ICICI A/C', 2),
(3, 4, 4, 90650.00, '2026-11-01', 'Bank Transfer', 'CMS20261101AXIS7182940', 'Completed', 'Monthly salary disbursed to Axis A/C', 2);

-- 15. Insert Payslip records
INSERT INTO `payslips` (`id`, `payroll_id`, `employee_id`, `payslip_number`, `generated_at`, `file_path`, `is_viewed`) VALUES
(1, 1, 1, 'PAYSLIP-202610-EMP1001', '2026-10-31 18:00:00', '/payslips/PAYSLIP-202610-EMP1001.pdf', 1),
(2, 2, 2, 'PAYSLIP-202610-EMP1002', '2026-10-31 18:00:00', '/payslips/PAYSLIP-202610-EMP1002.pdf', 0),
(3, 3, 3, 'PAYSLIP-202610-EMP1003', '2026-10-31 18:00:00', '/payslips/PAYSLIP-202610-EMP1003.pdf', 0),
(4, 4, 4, 'PAYSLIP-202610-EMP1004', '2026-10-31 18:00:00', '/payslips/PAYSLIP-202610-EMP1004.pdf', 1),
(5, 5, 5, 'PAYSLIP-202610-EMP1005', '2026-10-31 18:00:00', '/payslips/PAYSLIP-202610-EMP1005.pdf', 0);
