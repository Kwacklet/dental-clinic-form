-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2026 at 07:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dental_clinic_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `clinic_settings`
--

CREATE TABLE `clinic_settings` (
  `id` int(11) NOT NULL,
  `dentist_name` varchar(100) NOT NULL DEFAULT 'Dr. Sample Dentist',
  `clinic_name` varchar(100) NOT NULL DEFAULT 'Meg''s Clinic',
  `form_title` varchar(150) NOT NULL DEFAULT 'Dental Assessment Form',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinic_settings`
--

INSERT INTO `clinic_settings` (`id`, `dentist_name`, `clinic_name`, `form_title`, `updated_at`) VALUES
(1, 'Dr. Sample Dentist', 'Meg\'s Clinic', 'Dental Assessment Form', '2026-09-30 14:46:56');

-- --------------------------------------------------------

--
-- Table structure for table `dental_assessments`
--

CREATE TABLE `dental_assessments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `clinic_name` varchar(100) NOT NULL DEFAULT 'Meg''s Clinic',
  `form_title` varchar(150) NOT NULL DEFAULT 'Dental Assessment Form',
  `status` enum('New','Reviewed','Archived') NOT NULL DEFAULT 'New',
  `visit_reasons` text DEFAULT NULL,
  `visit_reasons_other` varchar(150) DEFAULT NULL,
  `concern_description` text DEFAULT NULL,
  `toothache_pain_level` tinyint(4) DEFAULT NULL,
  `anxiety_level` tinyint(4) DEFAULT NULL,
  `has_medical_conditions` tinyint(1) NOT NULL DEFAULT 0,
  `taking_medications` enum('No','Yes','Not sure') DEFAULT NULL,
  `has_allergies` enum('No','Yes','Not sure') DEFAULT NULL,
  `pregnancy` enum('No','Yes','Not sure','Not applicable','Prefer not to say') DEFAULT NULL,
  `consent_accurate` tinyint(1) NOT NULL DEFAULT 1,
  `consent_inform_changes` tinyint(1) NOT NULL DEFAULT 1,
  `consent_privacy` tinyint(1) NOT NULL DEFAULT 1,
  `all_answers_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`all_answers_payload`)),
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `dental_assessments`
--

INSERT INTO `dental_assessments` (`id`, `patient_id`, `clinic_name`, `form_title`, `status`, `visit_reasons`, `visit_reasons_other`, `concern_description`, `toothache_pain_level`, `anxiety_level`, `has_medical_conditions`, `taking_medications`, `has_allergies`, `pregnancy`, `consent_accurate`, `consent_inform_changes`, `consent_privacy`, `all_answers_payload`, `submitted_at`) VALUES
(1, 1, 'Meg\'s Clinic', 'Dental Assessment Form', 'New', 'Routine dental check-up', NULL, NULL, NULL, NULL, 0, 'No', 'No', 'No', 1, 1, 1, '{\"fullName\":\"Margaret Anne Fajardo\",\"preferredName\":\"Meg\",\"dateOfBirth\":\"2005-07-01\",\"age\":\"21\",\"sex\":\"Female\",\"pregnancy\":\"No\",\"mobileNumber\":\"0978654656\",\"email\":\"fajardomarga01@gmail.com\",\"address\":\"Gomburza St\",\"occupation\":\"Student\",\"emergencyContactName\":\"Uno\",\"emergencyContactNumber\":\"092764932594\",\"emergencyContactRelationship\":\"sikret\",\"visitReasons\":[\"Routine dental check-up\"],\"checkupLastVisit\":\"Less than 6 months ago\",\"checkupProblemsSince\":\"No\",\"medicalConditions\":[\"None\"],\"takingMedications\":\"No\",\"bloodThinners\":\"No\",\"boneMedication\":\"No\",\"hasAllergies\":\"No\",\"anesthesiaReaction\":\"No\",\"excessiveBleeding\":\"No\",\"fainting\":\"No\",\"antibioticPremedication\":\"No\",\"negativeExperience\":\"No\",\"consentAccurate\":true,\"consentInformChanges\":true,\"consentPrivacy\":true}', '2026-10-03 05:08:39');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_records`
--

CREATE TABLE `inventory_records` (
  `id` int(11) NOT NULL,
  `sku_code` varchar(50) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `quantity_in_stock` int(11) NOT NULL DEFAULT 0,
  `minimum_required_stock` int(11) NOT NULL DEFAULT 5,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `supplier_name` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `status` enum('in_stock','low_stock','out_of_stock','discontinued') NOT NULL DEFAULT 'in_stock',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `inventory_records`
--

INSERT INTO `inventory_records` (`id`, `sku_code`, `item_name`, `category`, `quantity_in_stock`, `minimum_required_stock`, `unit_price`, `supplier_name`, `expiration_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DEN-LIDO-2PC', 'Lidocaine 2% with Epinephrine 1:100k', 'Anesthetics', 50, 15, 65.00, NULL, NULL, 'in_stock', '2026-09-30 14:46:56', '2026-09-30 14:46:56'),
(2, 'DEN-NITR-M', 'Nitrile Examination Gloves (Medium, Box 100)', 'PPE', 12, 20, 15.50, NULL, NULL, 'low_stock', '2026-09-30 14:46:56', '2026-09-30 14:46:56'),
(3, 'DEN-COMP-A2', 'Universal Microhybrid Composite Shade A2', 'Restorative', 30, 10, 48.00, NULL, NULL, 'in_stock', '2026-09-30 14:46:56', '2026-09-30 14:46:56');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `preferred_name` varchar(60) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `age` tinyint(3) UNSIGNED DEFAULT NULL,
  `sex` enum('Male','Female','Prefer not to say','Other') DEFAULT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `emergency_contact_relationship` varchar(60) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `full_name`, `preferred_name`, `date_of_birth`, `age`, `sex`, `mobile_number`, `email`, `address`, `occupation`, `emergency_contact_name`, `emergency_contact_number`, `emergency_contact_relationship`, `created_at`) VALUES
(1, 'Margaret Anne Fajardo', 'Meg', '2005-07-01', 21, 'Female', '0978654656', 'fajardomarga01@gmail.com', 'Gomburza St', 'Student', 'Uno', '092764932594', 'sikret', '2026-10-03 05:08:39');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `role` enum('dentist','staff','patient','admin') NOT NULL DEFAULT 'staff',
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `first_name`, `last_name`, `email`, `phone_number`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Meg', 'Santos', 'meg@megsclinic.com', '09171234567', 'dentist', 'active', '2026-09-30 14:46:56', '2026-09-30 14:46:56'),
(2, 'Maria', 'Cruz', 'staff@megsclinic.com', '09187654321', 'staff', 'active', '2026-09-30 14:46:56', '2026-09-30 14:46:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clinic_settings`
--
ALTER TABLE `clinic_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dental_assessments`
--
ALTER TABLE `dental_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `idx_assessment_status` (`status`),
  ADD KEY `idx_assessment_date` (`submitted_at`);

--
-- Indexes for table `inventory_records`
--
ALTER TABLE `inventory_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_code` (`sku_code`),
  ADD KEY `idx_inventory_sku` (`sku_code`),
  ADD KEY `idx_inventory_category` (`category`),
  ADD KEY `idx_inventory_status` (`status`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patient_name` (`full_name`),
  ADD KEY `idx_patient_mobile` (`mobile_number`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_email` (`email`),
  ADD KEY `idx_user_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clinic_settings`
--
ALTER TABLE `clinic_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dental_assessments`
--
ALTER TABLE `dental_assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_records`
--
ALTER TABLE `inventory_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dental_assessments`
--
ALTER TABLE `dental_assessments`
  ADD CONSTRAINT `dental_assessments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
