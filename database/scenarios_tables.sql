-- Migration: Create scenarios and scenario_results tables
-- For Scenario Management feature

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

--
-- Table structure for table `scenarios`
--

CREATE TABLE `scenarios` (
  `scenario_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `profile_id` int(11) DEFAULT NULL,
  `offer_ids` text DEFAULT NULL,
  `comparison_data` text DEFAULT NULL,
  `status` enum('DRAFT','ACTIVE','ARCHIVED') DEFAULT 'DRAFT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`scenario_id`),
  KEY `fk_scenario_user` (`user_id`),
  KEY `fk_scenario_profile` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `scenario_results`
--

CREATE TABLE `scenario_results` (
  `result_id` int(11) NOT NULL AUTO_INCREMENT,
  `scenario_id` int(11) NOT NULL,
  `profile_id` int(11) DEFAULT NULL,
  `offer_id` int(11) DEFAULT NULL,
  `base_cost` decimal(10,2) DEFAULT NULL,
  `overage_cost` decimal(10,2) DEFAULT NULL,
  `roaming_cost` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `satisfaction_score` int(11) DEFAULT NULL,
  `recommendation` varchar(50) DEFAULT NULL,
  `rank_by_cost` int(11) DEFAULT NULL,
  `rank_by_score` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`result_id`),
  KEY `fk_result_scenario` (`scenario_id`),
  KEY `fk_result_profile` (`profile_id`),
  KEY `fk_result_offer` (`offer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for scenarios tables
--

ALTER TABLE `scenarios`
  ADD CONSTRAINT `fk_scenario_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_scenario_profile` FOREIGN KEY (`profile_id`) REFERENCES `customer_profiles` (`profile_id`) ON DELETE SET NULL;

ALTER TABLE `scenario_results`
  ADD CONSTRAINT `fk_result_scenario` FOREIGN KEY (`scenario_id`) REFERENCES `scenarios` (`scenario_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_result_profile` FOREIGN KEY (`profile_id`) REFERENCES `customer_profiles` (`profile_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_result_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`offer_id`) ON DELETE SET NULL;

COMMIT;