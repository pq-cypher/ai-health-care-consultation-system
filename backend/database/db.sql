-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2025 at 06:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ai-health-care-consultation-system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(6) UNSIGNED NOT NULL,
  `admin_id` longtext DEFAULT NULL,
  `email` longtext DEFAULT NULL,
  `password_hash` longtext DEFAULT NULL,
  `created_at` longtext DEFAULT NULL,
  `row_updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `admin_id`, `email`, `password_hash`, `created_at`, `row_updated_date`) VALUES
(1, 'FMC-AI-57974', 'admin@fmckeffi.com', '$2y$10$3IxlCHYUFwt8Ee1NCjwQxOlZAWOYEL2PYSCN5KYxiS5QY8L83OLlC', '2025-07-20 20:47:37', '2025-08-02 16:03:49');

-- --------------------------------------------------------

--
-- Table structure for table `medical_professionals`
--

CREATE TABLE `medical_professionals` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `availability` enum('Available','Busy','On Call','Off Duty') DEFAULT 'Available',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_professionals`
--

INSERT INTO `medical_professionals` (`id`, `name`, `specialty`, `phone`, `email`, `department`, `availability`, `status`, `created_at`, `updated_at`) VALUES
(6, 'Robert Chang', 'Cardiologist', '+234-806-926-8287', 'r.chang@fmckeffi.gov.ng', 'Cardiology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-21 01:06:45'),
(7, 'Dalton Glass', 'Emergency Medicine', '+234-807-267-9736', 'd.glass@fmckeffi.gov.ng', 'Emergency', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(8, 'Whitney Phillips', 'General Practitioner', '+234-806-886-5530', 'w.phillips@fmckeffi.gov.ng', 'General Medicine', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(9, 'Anthony Brown', 'Pulmonologist', '+234-804-244-2754', 'a.brown@fmckeffi.gov.ng', 'Pulmonology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(10, 'John Campbell', 'Neurologist', '+234-808-434-6674', 'j.campbell@fmckeffi.gov.ng', 'Neurology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(11, 'Pamela Black', 'Endocrinologist', '+234-809-146-8478', 'p.black@fmckeffi.gov.ng', 'Endocrinology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(12, 'Lisa Mejia', 'Dermatologist', '+234-803-594-4173', 'l.mejia@fmckeffi.gov.ng', 'Dermatology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(13, 'Joshua Cruz', 'Pediatrician', '+234-805-808-8575', 'j.cruz@fmckeffi.gov.ng', 'Pediatrics', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(14, 'James Woods', 'Orthopedic Surgeon', '+234-804-345-9896', 'j.woods@fmckeffi.gov.ng', 'Orthopedics', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(15, 'Carla Page', 'Radiologist', '+234-805-677-8441', 'c.page@fmckeffi.gov.ng', 'Radiology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(16, 'Andrea Snyder', 'Oncologist', '+234-804-141-4641', 'a.snyder@fmckeffi.gov.ng', 'Oncology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(17, 'Sean Stewart', 'Urologist', '+234-804-188-1599', 's.stewart@fmckeffi.gov.ng', 'Urology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(18, 'Derrick Ball', 'Nephrologist', '+234-804-948-2557', 'd.ball@fmckeffi.gov.ng', 'Nephrology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(19, 'Emily Meyer', 'Psychiatrist', '+234-809-296-6975', 'e.meyer@fmckeffi.gov.ng', 'Psychiatry', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(20, 'Rebecca Craig', 'Hematologist', '+234-805-754-7376', 'r.craig@fmckeffi.gov.ng', 'Hematology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(21, 'Aaron Bowen', 'Obstetrician', '+234-807-598-3926', 'a.bowen@fmckeffi.gov.ng', 'Obstetrics', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(22, 'Amber Brown', 'Gynecologist', '+234-803-537-4232', 'a.brown@fmckeffi.gov.ng', 'Gynecology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(23, 'Kara Nichols', 'Gastroenterologist', '+234-807-449-5225', 'k.nichols@fmckeffi.gov.ng', 'Gastroenterology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(24, 'Bryan Sims', 'Rheumatologist', '+234-804-771-3024', 'b.sims@fmckeffi.gov.ng', 'Rheumatology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(25, 'Ronald Byrd', 'Ophthalmologist', '+234-808-961-3956', 'r.byrd@fmckeffi.gov.ng', 'Ophthalmology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(26, 'Tiffany Ortega', 'Anesthesiologist', '+234-809-537-6481', 't.ortega@fmckeffi.gov.ng', 'Anesthesiology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(27, 'Travis Nelson', 'Pathologist', '+234-803-422-7704', 't.nelson@fmckeffi.gov.ng', 'Pathology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(28, 'Melissa Evans', 'Allergist', '+234-805-831-3600', 'm.evans@fmckeffi.gov.ng', 'Allergy and Immunology', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(29, 'Wanda Gibbs', 'Infectious Disease Specialist', '+234-805-376-1279', 'w.gibbs@fmckeffi.gov.ng', 'Infectious Disease', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(30, 'Clifford Bryant', 'Otolaryngologist', '+234-805-143-7456', 'c.bryant@fmckeffi.gov.ng', 'ENT', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(31, 'Sandra Warner', 'Plastic Surgeon', '+234-807-339-7904', 's.warner@fmckeffi.gov.ng', 'Plastic Surgery', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(32, 'Dennis Harper', 'Thoracic Surgeon', '+234-803-751-3636', 'd.harper@fmckeffi.gov.ng', 'Thoracic Surgery', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(33, 'Christina Mann', 'Vascular Surgeon', '+234-808-188-1765', 'c.mann@fmckeffi.gov.ng', 'Vascular Surgery', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(34, 'Jacqueline Marsh', 'Palliative Care Specialist', '+234-808-902-1061', 'j.marsh@fmckeffi.gov.ng', 'Palliative Care', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(35, 'Annette Fletcher', 'Rehabilitation Specialist', '+234-808-284-8429', 'a.fletcher@fmckeffi.gov.ng', 'Rehabilitation', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(36, 'Matthew Walsh', 'Geriatrician', '+234-808-828-7712', 'm.walsh@fmckeffi.gov.ng', 'Geriatrics', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(37, 'Julia Weaver', 'Occupational Medicine Specialist', '+234-803-413-8312', 'j.weaver@fmckeffi.gov.ng', 'Occupational Medicine', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-19 18:59:10'),
(38, 'Brian Sutton', 'Sports Medicine Specialist', '+234-809-237-4771', 'b.sutton@fmckeffi.gov.ng', 'Sports Medicine', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35'),
(39, 'Dana French', 'Clinical Geneticist', '+234-807-612-5937', 'd.french@fmckeffi.gov.ng', 'Genetics', 'Available', 'active', '2025-07-19 18:59:10', '2025-07-20 11:08:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medical_professionals`
--
ALTER TABLE `medical_professionals`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `medical_professionals`
--
ALTER TABLE `medical_professionals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
