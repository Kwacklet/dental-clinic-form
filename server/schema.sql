SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS dental_clinic_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dental_clinic_db;

CREATE TABLE clinic_settings (
  id INT(11) NOT NULL AUTO_INCREMENT,
  dentist_name VARCHAR(100) NOT NULL DEFAULT 'Dr. Sample Dentist',
  clinic_name VARCHAR(100) NOT NULL DEFAULT 'Meg''s Clinic',
  form_title VARCHAR(150) NOT NULL DEFAULT 'Dental Assessment Form',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_profiles (
  id INT(11) NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  role ENUM('dentist','staff','patient','admin') NOT NULL DEFAULT 'staff',
  status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_user_email (email),
  KEY idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patients (
  id INT(11) NOT NULL AUTO_INCREMENT,
  last_name VARCHAR(60) NOT NULL,
  first_name VARCHAR(60) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(60) DEFAULT NULL,
  date_of_birth DATE NOT NULL,
  age TINYINT(3) UNSIGNED DEFAULT NULL,
  sex ENUM('Male','Female','Prefer not to say','Other') DEFAULT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  address VARCHAR(200) DEFAULT NULL,
  occupation VARCHAR(100) DEFAULT NULL,
  emergency_contact_name VARCHAR(100) DEFAULT NULL,
  emergency_contact_number VARCHAR(20) DEFAULT NULL,
  emergency_contact_relationship VARCHAR(60) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_patient_name (full_name),
  KEY idx_patient_mobile (mobile_number),
  KEY idx_patient_last_first (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dental_assessments (
  id INT(11) NOT NULL AUTO_INCREMENT,
  patient_id INT(11) DEFAULT NULL,
  clinic_name VARCHAR(100) NOT NULL DEFAULT 'Meg''s Clinic',
  form_title VARCHAR(150) NOT NULL DEFAULT 'Dental Assessment Form',
  status ENUM('New','Reviewed','Archived') NOT NULL DEFAULT 'New',
  visit_reasons TEXT DEFAULT NULL,
  visit_reasons_other VARCHAR(150) DEFAULT NULL,
  concern_description TEXT DEFAULT NULL,
  toothache_pain_level TINYINT(4) DEFAULT NULL,
  anxiety_level TINYINT(4) DEFAULT NULL,
  has_medical_conditions TINYINT(1) NOT NULL DEFAULT 0,
  taking_medications ENUM('No','Yes','Not sure') DEFAULT NULL,
  has_allergies ENUM('No','Yes','Not sure') DEFAULT NULL,
  pregnancy ENUM('No','Yes','Not sure','Not applicable','Prefer not to say') DEFAULT NULL,
  consent_accurate TINYINT(1) NOT NULL DEFAULT 1,
  consent_inform_changes TINYINT(1) NOT NULL DEFAULT 1,
  consent_privacy TINYINT(1) NOT NULL DEFAULT 1,
  all_answers_payload LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (JSON_VALID(all_answers_payload)),
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY patient_id (patient_id),
  KEY idx_assessment_status (status),
  KEY idx_assessment_date (submitted_at),
  CONSTRAINT dental_assessments_ibfk_1 FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO clinic_settings (dentist_name, clinic_name, form_title) VALUES
  ('Dr. Sample Dentist', 'Meg''s Clinic', 'Dental Assessment Form');

INSERT INTO user_profiles (first_name, last_name, email, role, status) VALUES
  ('Sample', 'Dentist', 'dentist@example.com', 'dentist', 'active'),
  ('Sample', 'Staff', 'staff@example.com', 'staff', 'active');

INSERT INTO patients (last_name, first_name, full_name, date_of_birth, age, sex, mobile_number, email) VALUES
  ('Dela Cruz', 'Juan', 'Juan Dela Cruz', '1990-04-12', 36, 'Male', '09170000001', 'juan@example.com'),
  ('Reyes', 'Angela', 'Angela Reyes', '1998-11-03', 27, 'Female', '09170000002', NULL),
  ('Villanueva', 'Mark', 'Mark Villanueva', '1985-02-20', 41, 'Male', '09170000003', NULL);

INSERT INTO dental_assessments
  (patient_id, status, visit_reasons, toothache_pain_level, anxiety_level, has_medical_conditions,
   taking_medications, has_allergies, pregnancy, all_answers_payload)
VALUES
  (1, 'New', 'Toothache', 7, 5, 0, 'No', 'No', 'Not applicable',
   '{"lastName":"Dela Cruz","firstName":"Juan","fullName":"Juan Dela Cruz","dateOfBirth":"1990-04-12","age":"36","sex":"Male","mobileNumber":"09170000001","email":"juan@example.com","visitReasons":["Toothache"],"toothacheLocation":"Lower right","toothacheStart":"1–3 days ago","toothachePain":"7","medicalConditions":["None"],"takingMedications":"No","hasAllergies":"No","pregnancy":"Not applicable","anxietyLevel":"5","consentAccurate":true,"consentInformChanges":true,"consentPrivacy":true}'),
  (2, 'Reviewed', 'Routine dental check-up, Dental cleaning', NULL, 2, 0, 'No', 'No', 'No',
   '{"lastName":"Reyes","firstName":"Angela","fullName":"Angela Reyes","dateOfBirth":"1998-11-03","age":"27","sex":"Female","mobileNumber":"09170000002","visitReasons":["Routine dental check-up","Dental cleaning"],"checkupLastVisit":"6–12 months ago","cleaningBrushing":"Twice a day","medicalConditions":["None"],"takingMedications":"No","hasAllergies":"No","pregnancy":"No","anxietyLevel":"2","consentAccurate":true,"consentInformChanges":true,"consentPrivacy":true}'),
  (3, 'New', 'Bleeding gums', NULL, NULL, 1, 'Yes', 'Not sure', 'Not applicable',
   '{"lastName":"Villanueva","firstName":"Mark","fullName":"Mark Villanueva","dateOfBirth":"1985-02-20","age":"41","sex":"Male","mobileNumber":"09170000003","visitReasons":["Bleeding gums"],"bleedingFrequency":"Frequently","medicalConditions":["High blood pressure"],"medicalConditionDetails":"Diagnosed in 2020.","takingMedications":"Yes","medicationList":"Losartan 50 mg daily","hasAllergies":"Not sure","pregnancy":"Not applicable","consentAccurate":true,"consentInformChanges":true,"consentPrivacy":true}');
