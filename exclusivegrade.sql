-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 19, 2026 at 09:25 AM
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
-- Database: `exclusivegrade`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_sessions`
--

CREATE TABLE `academic_sessions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_lesson_notes`
--

CREATE TABLE `ai_lesson_notes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `topic` varchar(255) NOT NULL,
  `class_level` varchar(100) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `days_present` int(11) DEFAULT 0,
  `days_absent` int(11) DEFAULT 0,
  `days_late` int(11) DEFAULT 0,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_tokens`
--

INSERT INTO `auth_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(67, 8, 'ea7ac713d59f3ad791776524ade79a831ec3dd796dc435c99a8acd3519a925a9', '2026-07-19 09:25:01', '2026-06-19 07:25:01');

-- --------------------------------------------------------

--
-- Table structure for table `cbt_questions`
--

CREATE TABLE `cbt_questions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `class_level` varchar(100) NOT NULL,
  `question` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `correct_answer` varchar(10) NOT NULL,
  `explanation` text DEFAULT NULL,
  `is_premium` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cbt_results`
--

CREATE TABLE `cbt_results` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `score` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `promotion_class_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `school_id`, `name`, `display_order`, `promotion_class_id`, `description`, `created_at`) VALUES
(6, 3, 'KG 1', 0, NULL, 'Kindergarten Year 1', '2026-06-19 01:32:22'),
(7, 3, 'KG 2', 0, NULL, 'Kindergarten Year 2', '2026-06-19 01:32:22'),
(8, 3, 'Primary 1', 0, NULL, 'Primary School Year 1', '2026-06-19 01:32:22'),
(9, 3, 'Primary 2', 0, NULL, 'Primary School Year 2', '2026-06-19 01:32:22'),
(10, 3, 'JSS 3', 0, NULL, 'Junior Secondary School Year 3', '2026-06-19 01:32:22'),
(11, 3, 'JSS 2', 0, NULL, 'Junior Secondary School Year 2', '2026-06-19 01:32:22'),
(12, 3, 'SSS 2', 0, NULL, 'Senior Secondary School Year 2', '2026-06-19 01:32:22'),
(13, 3, 'SSS 3', 0, NULL, 'Senior Secondary School Year 3', '2026-06-19 01:32:22'),
(14, 3, 'KG 3', 0, NULL, 'Kindergarten Year 3', '2026-06-19 01:32:22'),
(15, 3, 'Primary 3', 0, NULL, 'Primary School Year 3', '2026-06-19 01:32:22'),
(16, 3, 'Primary 5', 0, NULL, 'Primary School Year 5', '2026-06-19 01:32:22'),
(17, 3, 'Primary 4', 0, NULL, 'Primary School Year 4', '2026-06-19 01:32:22'),
(18, 3, 'Primary 6', 0, NULL, 'Primary School Year 6', '2026-06-19 01:32:22'),
(19, 3, 'SSS 1', 0, NULL, 'Senior Secondary School Year 1', '2026-06-19 01:32:22'),
(20, 3, 'JSS 1', 0, NULL, 'Junior Secondary School Year 1', '2026-06-19 01:32:42'),
(21, 3, 'Nur 2', 0, NULL, 'Nursery Year 2', '2026-06-19 01:36:39'),
(22, 3, 'Nur 1', 0, NULL, 'Nursery Year 1', '2026-06-19 01:36:39'),
(23, 3, 'SSS 1 Commercial', 0, NULL, 'Senior Secondary School Year 1 - Commercial', '2026-06-19 01:36:39'),
(24, 3, 'SSS 1 Science', 0, NULL, 'Senior Secondary School Year 1 - Science', '2026-06-19 01:36:39'),
(25, 3, 'SSS 1 Arts', 0, NULL, 'Senior Secondary School Year 1 - Arts', '2026-06-19 01:36:39'),
(26, 3, 'SSS 2 Science', 0, NULL, 'Senior Secondary School Year 2 - Science', '2026-06-19 01:36:39'),
(27, 3, 'SSS 3 Science', 0, NULL, 'Senior Secondary School Year 3 - Science', '2026-06-19 01:36:39'),
(28, 3, 'SSS 2 Commercial', 0, NULL, 'Senior Secondary School Year 2 - Commercial', '2026-06-19 01:36:39'),
(29, 3, 'SSS 2 Arts', 0, NULL, 'Senior Secondary School Year 2 - Arts', '2026-06-19 01:36:39'),
(30, 3, 'SSS 3 Arts', 0, NULL, 'Senior Secondary School Year 3 - Arts', '2026-06-19 01:36:39'),
(31, 3, 'SSS 3 Commercial', 0, NULL, 'Senior Secondary School Year 3 - Commercial', '2026-06-19 01:36:39');

-- --------------------------------------------------------

--
-- Table structure for table `class_subjects`
--

CREATE TABLE `class_subjects` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_subjects`
--

INSERT INTO `class_subjects` (`id`, `class_id`, `subject_id`, `teacher_id`, `created_at`) VALUES
(9, 6, 5, NULL, '2026-06-19 01:48:44'),
(10, 6, 6, NULL, '2026-06-19 01:49:03'),
(11, 6, 7, NULL, '2026-06-19 01:49:03'),
(12, 6, 8, NULL, '2026-06-19 01:49:03'),
(13, 6, 9, NULL, '2026-06-19 01:52:11'),
(14, 6, 10, NULL, '2026-06-19 01:52:11'),
(15, 6, 11, NULL, '2026-06-19 01:52:11');

-- --------------------------------------------------------

--
-- Table structure for table `cognitive_assignments`
--

CREATE TABLE `cognitive_assignments` (
  `id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cognitive_rating_scales`
--

CREATE TABLE `cognitive_rating_scales` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `rating` varchar(50) NOT NULL,
  `display_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cognitive_rating_scales`
--

INSERT INTO `cognitive_rating_scales` (`id`, `school_id`, `rating`, `display_order`) VALUES
(1, 0, 'Excellent', 1),
(2, 0, 'Good', 2),
(3, 0, 'Average', 3),
(4, 0, 'Poor', 4),
(5, 0, 'Needs Improvement', 5),
(6, 0, 'Excellent', 1),
(7, 0, 'Good', 2),
(8, 0, 'Average', 3),
(9, 0, 'Poor', 4),
(10, 0, 'Needs Improvement', 5);

-- --------------------------------------------------------

--
-- Table structure for table `cognitive_results`
--

CREATE TABLE `cognitive_results` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `skill_ratings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`skill_ratings`)),
  `status` enum('draft','published') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cognitive_skills`
--

CREATE TABLE `cognitive_skills` (
  `id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cognitive_templates`
--

CREATE TABLE `cognitive_templates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grading_systems`
--

CREATE TABLE `grading_systems` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `min_score` int(11) NOT NULL,
  `max_score` int(11) NOT NULL,
  `grade` varchar(5) NOT NULL,
  `remark` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `id_cards`
--

CREATE TABLE `id_cards` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `template` varchar(50) DEFAULT 'classic',
  `file_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_notes`
--

CREATE TABLE `lesson_notes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `topic` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `is_ai_generated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pending_payments`
--

CREATE TABLE `pending_payments` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `screenshot_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pins`
--

CREATE TABLE `pins` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `pin_code` varchar(20) NOT NULL,
  `status` enum('unused','partially_used','used','expired') DEFAULT 'unused',
  `usage_limit` int(11) DEFAULT 3,
  `usage_count` int(11) DEFAULT 0,
  `cost` decimal(8,2) NOT NULL DEFAULT 0.00,
  `used_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
(1, 'pin_expiry_days', '365', '2026-06-14 23:07:45'),
(2, 'default_pin_usage_limit', '3', '2026-06-14 23:07:45'),
(3, 'pin_price_starter', '100', '2026-06-14 23:07:45'),
(4, 'pin_price_pro', '80', '2026-06-14 23:07:45'),
(5, 'pin_price_enterprise', '50', '2026-06-14 23:07:45'),
(6, 'pro_price_monthly', '10000', '2026-06-14 23:07:45'),
(7, 'pro_price_annual', '80000', '2026-06-14 23:07:45'),
(8, 'enterprise_price_monthly', '25000', '2026-06-14 23:07:45'),
(9, 'enterprise_price_annual', '240000', '2026-06-14 23:07:45'),
(10, 'ai_notes_pro_limit', '20', '2026-06-14 23:07:45'),
(11, 'ai_notes_price', '100', '2026-06-14 23:07:45');

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `ca1` decimal(5,2) DEFAULT 0.00,
  `ca2` decimal(5,2) DEFAULT 0.00,
  `exam` decimal(5,2) DEFAULT 0.00,
  `total` decimal(5,2) GENERATED ALWAYS AS (`ca1` + `ca2` + `exam`) STORED,
  `grade` varchar(5) DEFAULT NULL,
  `remark` varchar(100) DEFAULT NULL,
  `status` enum('draft','published','returned') DEFAULT 'draft',
  `teacher_comment` text DEFAULT NULL,
  `admin_comment` text DEFAULT NULL,
  `next_term_begins` date DEFAULT NULL,
  `teacher_signature_url` varchar(500) DEFAULT NULL,
  `admin_signature_url` varchar(500) DEFAULT NULL,
  `school_stamp_url` varchar(500) DEFAULT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_templates`
--

CREATE TABLE `result_templates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `components` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`components`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `email` varchar(200) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `admin_signature_url` varchar(500) DEFAULT NULL,
  `school_stamp_url` varchar(500) DEFAULT NULL,
  `welcome_text` text DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `primary_color` varchar(10) DEFAULT '#7c3aed',
  `status` enum('pending','active','suspended') DEFAULT 'pending',
  `plan` enum('starter','pro','enterprise') DEFAULT 'starter',
  `wallet_balance` decimal(12,2) DEFAULT 0.00,
  `about` text DEFAULT NULL,
  `motto` varchar(255) DEFAULT NULL,
  `founded_year` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `name`, `slug`, `email`, `logo_url`, `admin_signature_url`, `school_stamp_url`, `welcome_text`, `phone`, `address`, `primary_color`, `status`, `plan`, `wallet_balance`, `about`, `motto`, `founded_year`, `created_at`, `updated_at`) VALUES
(3, 'Tender Minds School', 'tender-minds-school', 'babafemiolawuni@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '#7c3aed', 'active', 'starter', 0.00, NULL, NULL, NULL, '2026-06-19 01:15:10', '2026-06-19 01:15:10');

-- --------------------------------------------------------

--
-- Table structure for table `school_settings`
--

CREATE TABLE `school_settings` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scoring_components`
--

CREATE TABLE `scoring_components` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `max_score` int(11) NOT NULL,
  `percentage` int(11) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `admission_number` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `sex` enum('Male','Female') DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `school_id`, `class_id`, `first_name`, `surname`, `last_name`, `admission_number`, `date_of_birth`, `sex`, `photo_url`, `is_active`, `created_at`, `updated_at`) VALUES
(8, 3, 20, 'John', 'Alice', 'Kotoja', 'TMC/012/028', '2026-06-02', 'Female', 'http://localhost/exclusivegrade/backend/uploads/gallery/tender-minds-school_1781831803.png', 1, '2026-06-19 01:16:43', '2026-06-19 01:35:53'),
(9, 3, 18, 'ettet', 'test', 'ttwtw', 'ttwwtwt', '2026-06-24', 'Male', 'http://localhost/exclusivegrade/backend/uploads/gallery/tender-minds-school_1781831905.png', 1, '2026-06-19 01:18:25', '2026-06-19 01:35:45');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `school_id`, `class_id`, `name`, `created_at`) VALUES
(5, 3, 6, 'Letter Work', '2026-06-19 01:48:44'),
(6, 3, 6, 'Mathematics', '2026-06-19 01:49:03'),
(7, 3, 6, 'Civic Education', '2026-06-19 01:49:03'),
(8, 3, 6, 'Basic Science', '2026-06-19 01:49:03'),
(9, 3, 6, 'English Language', '2026-06-19 01:52:11'),
(10, 3, 6, 'Social Studies', '2026-06-19 01:52:11'),
(11, 3, 6, 'Basic Technology', '2026-06-19 01:52:11'),
(15, 3, 20, 'Test Subject 085919', '2026-06-19 06:59:19');

-- --------------------------------------------------------

--
-- Table structure for table `template_assignments`
--

CREATE TABLE `template_assignments` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `template_type` enum('result','cognitive') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `terms`
--

CREATE TABLE `terms` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` enum('First Term','Second Term','Third Term') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `type` enum('topup','pin_purchase','subscription','addon','adjustment') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `balance_before` decimal(12,2) NOT NULL,
  `balance_after` decimal(12,2) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `gateway` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','success','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usage_tracking`
--

CREATE TABLE `usage_tracking` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `month` varchar(7) NOT NULL,
  `id_cards` int(11) DEFAULT 0,
  `lesson_notes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `role` enum('super_admin','school_admin','teacher') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(200) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `signature_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `school_id`, `role`, `first_name`, `last_name`, `email`, `username`, `password_hash`, `signature_url`, `is_active`, `created_at`, `last_login_at`) VALUES
(8, 3, 'school_admin', 'OLAWUNI', 'BABAFEMI DAVID', 'babafemiolawuni@gmail.com', NULL, '$2y$12$XN8tDwI.BD4JtmMGJP6NTeoQmqOYN.OvF7sc70vLLdRyj8iOumpHa', NULL, 1, '2026-06-19 01:15:11', NULL),
(9, 3, 'teacher', 'OLAWUNI', 'BABAFEMI DAVID', 'teacher@example.com', 'tender-minds-school_olawuni.babafemidavid', '$2y$12$hZQAiLRFQEGNt2cD6RBoHev.UfQEYp1B/AJh88QfHIz8pdGBBsq4a', NULL, 1, '2026-06-19 01:19:59', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `ai_lesson_notes`
--
ALTER TABLE `ai_lesson_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`class_id`,`term_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `term_id` (`term_id`),
  ADD KEY `idx_attendance_student` (`student_id`);

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_auth_tokens_token` (`token`);

--
-- Indexes for table `cbt_questions`
--
ALTER TABLE `cbt_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `cbt_results`
--
ALTER TABLE `cbt_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`name`);

--
-- Indexes for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_id` (`class_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `cognitive_assignments`
--
ALTER TABLE `cognitive_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `cognitive_rating_scales`
--
ALTER TABLE `cognitive_rating_scales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cognitive_results`
--
ALTER TABLE `cognitive_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`class_id`,`term_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `term_id` (`term_id`),
  ADD KEY `idx_cognitive_results_student` (`student_id`);

--
-- Indexes for table `cognitive_skills`
--
ALTER TABLE `cognitive_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `cognitive_templates`
--
ALTER TABLE `cognitive_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `grading_systems`
--
ALTER TABLE `grading_systems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `id_cards`
--
ALTER TABLE `id_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `lesson_notes`
--
ALTER TABLE `lesson_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `pending_payments`
--
ALTER TABLE `pending_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_pending_payments_status` (`status`);

--
-- Indexes for table `pins`
--
ALTER TABLE `pins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pin_code` (`pin_code`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `idx_pins_school` (`school_id`),
  ADD KEY `idx_pins_code` (`pin_code`),
  ADD KEY `idx_pins_status` (`status`);

--
-- Indexes for table `platform_settings`
--
ALTER TABLE `platform_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`subject_id`,`term_id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_results_student` (`student_id`),
  ADD KEY `idx_results_term` (`term_id`),
  ADD KEY `idx_results_status` (`status`);

--
-- Indexes for table `result_templates`
--
ALTER TABLE `result_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`name`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `school_settings`
--
ALTER TABLE `school_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`setting_key`);

--
-- Indexes for table `scoring_components`
--
ALTER TABLE `scoring_components`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`admission_number`),
  ADD KEY `idx_students_school` (`school_id`),
  ADD KEY `idx_students_class` (`class_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`name`),
  ADD UNIQUE KEY `unique_subject` (`school_id`,`class_id`,`name`),
  ADD KEY `idx_class_id` (`class_id`);

--
-- Indexes for table `template_assignments`
--
ALTER TABLE `template_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_id` (`class_id`,`template_type`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `terms`
--
ALTER TABLE `terms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `idx_transactions_school` (`school_id`);

--
-- Indexes for table `usage_tracking`
--
ALTER TABLE `usage_tracking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`month`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_users_school` (`school_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ai_lesson_notes`
--
ALTER TABLE `ai_lesson_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `cbt_questions`
--
ALTER TABLE `cbt_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cbt_results`
--
ALTER TABLE `cbt_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `class_subjects`
--
ALTER TABLE `class_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `cognitive_assignments`
--
ALTER TABLE `cognitive_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cognitive_rating_scales`
--
ALTER TABLE `cognitive_rating_scales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cognitive_results`
--
ALTER TABLE `cognitive_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cognitive_skills`
--
ALTER TABLE `cognitive_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cognitive_templates`
--
ALTER TABLE `cognitive_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `grading_systems`
--
ALTER TABLE `grading_systems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `id_cards`
--
ALTER TABLE `id_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lesson_notes`
--
ALTER TABLE `lesson_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pending_payments`
--
ALTER TABLE `pending_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pins`
--
ALTER TABLE `pins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `result_templates`
--
ALTER TABLE `result_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `school_settings`
--
ALTER TABLE `school_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scoring_components`
--
ALTER TABLE `scoring_components`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `template_assignments`
--
ALTER TABLE `template_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `terms`
--
ALTER TABLE `terms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usage_tracking`
--
ALTER TABLE `usage_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  ADD CONSTRAINT `academic_sessions_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_lesson_notes`
--
ALTER TABLE `ai_lesson_notes`
  ADD CONSTRAINT `ai_lesson_notes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_lesson_notes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cbt_questions`
--
ALTER TABLE `cbt_questions`
  ADD CONSTRAINT `cbt_questions_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cbt_results`
--
ALTER TABLE `cbt_results`
  ADD CONSTRAINT `cbt_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_subjects_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cognitive_assignments`
--
ALTER TABLE `cognitive_assignments`
  ADD CONSTRAINT `cognitive_assignments_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `cognitive_templates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cognitive_assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cognitive_results`
--
ALTER TABLE `cognitive_results`
  ADD CONSTRAINT `cognitive_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cognitive_results_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cognitive_results_ibfk_3` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cognitive_skills`
--
ALTER TABLE `cognitive_skills`
  ADD CONSTRAINT `cognitive_skills_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `cognitive_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cognitive_templates`
--
ALTER TABLE `cognitive_templates`
  ADD CONSTRAINT `cognitive_templates_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grading_systems`
--
ALTER TABLE `grading_systems`
  ADD CONSTRAINT `grading_systems_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `id_cards`
--
ALTER TABLE `id_cards`
  ADD CONSTRAINT `id_cards_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `id_cards_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_notes`
--
ALTER TABLE `lesson_notes`
  ADD CONSTRAINT `lesson_notes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_notes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_notes_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lesson_notes_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pending_payments`
--
ALTER TABLE `pending_payments`
  ADD CONSTRAINT `pending_payments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pending_payments_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pins`
--
ALTER TABLE `pins`
  ADD CONSTRAINT `pins_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pins_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `results_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `results_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `results_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `results_ibfk_5` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `result_templates`
--
ALTER TABLE `result_templates`
  ADD CONSTRAINT `result_templates_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `school_settings`
--
ALTER TABLE `school_settings`
  ADD CONSTRAINT `school_settings_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scoring_components`
--
ALTER TABLE `scoring_components`
  ADD CONSTRAINT `scoring_components_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `template_assignments`
--
ALTER TABLE `template_assignments`
  ADD CONSTRAINT `template_assignments_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `template_assignments_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `result_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `terms`
--
ALTER TABLE `terms`
  ADD CONSTRAINT `terms_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `terms_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `usage_tracking`
--
ALTER TABLE `usage_tracking`
  ADD CONSTRAINT `usage_tracking_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
