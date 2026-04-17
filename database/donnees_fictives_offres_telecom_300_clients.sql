-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 17, 2026 at 05:05 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bd_pfe`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `customer_profiles`
--

CREATE TABLE `customer_profiles` (
  `profile_id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `minutes_avg` int(11) DEFAULT 0,
  `sms_avg` int(11) DEFAULT 0,
  `data_avg_gb` decimal(10,2) DEFAULT 0.00,
  `night_usage_pct` int(11) DEFAULT 0,
  `roaming_days` int(11) DEFAULT 0,
  `budget_max` decimal(10,2) DEFAULT 0.00,
  `priority` enum('PRICE','QUALITY','BALANCED') DEFAULT 'BALANCED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `customer_profiles`
--

INSERT INTO `customer_profiles` (`profile_id`, `label`, `minutes_avg`, `sms_avg`, `data_avg_gb`, `night_usage_pct`, `roaming_days`, `budget_max`, `priority`) VALUES
(1, 'Client 1', 796, 1925, '12.64', 31, 17, '97.72', 'QUALITY'),
(2, 'Client 2', 152, 2121, '109.05', 16, 16, '74.09', 'PRICE'),
(3, 'Client 3', 2492, 416, '89.48', 89, 4, '26.50', 'PRICE'),
(4, 'Client 4', 484, 227, '76.59', 17, 2, '35.32', 'BALANCED'),
(5, 'Client 5', 3471, 1682, '88.11', 99, 7, '86.78', 'PRICE'),
(6, 'Client 6', 487, 1274, '93.65', 53, 3, '39.04', 'BALANCED'),
(7, 'Client 7', 992, 439, '99.88', 29, 19, '71.45', 'QUALITY'),
(8, 'Client 8', 2935, 510, '131.21', 23, 16, '118.86', 'QUALITY'),
(9, 'Client 9', 925, 1599, '101.97', 39, 10, '115.36', 'QUALITY'),
(10, 'Client 10', 2553, 2166, '63.47', 98, 18, '36.00', 'BALANCED'),
(11, 'Client 11', 1825, 1107, '61.79', 52, 18, '106.17', 'BALANCED'),
(12, 'Client 12', 374, 522, '23.26', 68, 7, '29.28', 'PRICE'),
(13, 'Client 13', 3367, 2763, '136.97', 85, 4, '52.58', 'PRICE'),
(14, 'Client 14', 781, 1951, '57.48', 87, 8, '94.34', 'BALANCED'),
(15, 'Client 15', 1833, 1625, '85.92', 78, 8, '107.32', 'BALANCED'),
(16, 'Client 16', 410, 2590, '15.88', 79, 0, '94.49', 'BALANCED'),
(17, 'Client 17', 755, 670, '57.19', 97, 16, '86.01', 'PRICE'),
(18, 'Client 18', 2531, 1898, '91.70', 31, 11, '47.73', 'PRICE'),
(19, 'Client 19', 2054, 1748, '70.68', 93, 1, '65.18', 'BALANCED'),
(20, 'Client 20', 728, 2318, '25.27', 13, 6, '42.16', 'PRICE'),
(21, 'Client 21', 2411, 2195, '15.74', 24, 9, '105.48', 'BALANCED'),
(22, 'Client 22', 2649, 1460, '28.68', 20, 9, '52.47', 'PRICE'),
(23, 'Client 23', 1850, 427, '72.74', 4, 1, '67.20', 'PRICE'),
(24, 'Client 24', 3359, 2656, '38.61', 11, 2, '131.18', 'QUALITY'),
(25, 'Client 25', 1066, 2329, '147.70', 90, 12, '111.24', 'BALANCED'),
(26, 'Client 26', 3439, 1259, '46.37', 13, 4, '22.76', 'PRICE'),
(27, 'Client 27', 1957, 2241, '81.81', 61, 10, '55.26', 'BALANCED'),
(28, 'Client 28', 620, 364, '88.05', 85, 10, '38.68', 'PRICE'),
(29, 'Client 29', 2586, 2513, '114.24', 40, 0, '31.55', 'PRICE'),
(30, 'Client 30', 2714, 1255, '134.52', 12, 14, '56.16', 'BALANCED'),
(31, 'Client 31', 396, 1872, '62.62', 17, 1, '54.62', 'BALANCED'),
(32, 'Client 32', 1602, 445, '131.31', 85, 14, '77.47', 'BALANCED'),
(33, 'Client 33', 1220, 1032, '25.03', 24, 0, '86.04', 'PRICE'),
(34, 'Client 34', 3293, 1018, '74.10', 51, 9, '77.93', 'BALANCED'),
(35, 'Client 35', 1877, 1116, '19.72', 13, 3, '108.56', 'QUALITY'),
(36, 'Client 36', 3335, 482, '83.61', 16, 19, '55.25', 'BALANCED'),
(37, 'Client 37', 766, 1171, '137.61', 11, 0, '63.65', 'PRICE'),
(38, 'Client 38', 1159, 2914, '80.25', 40, 13, '149.09', 'QUALITY'),
(39, 'Client 39', 695, 2459, '70.85', 74, 16, '108.65', 'BALANCED'),
(40, 'Client 40', 577, 1699, '52.02', 5, 1, '64.82', 'PRICE'),
(41, 'Client 41', 2790, 1930, '32.58', 79, 4, '70.04', 'BALANCED'),
(42, 'Client 42', 3237, 2274, '149.01', 0, 5, '39.97', 'BALANCED'),
(43, 'Client 43', 1019, 2403, '23.70', 12, 15, '101.43', 'QUALITY'),
(44, 'Client 44', 2231, 1960, '109.20', 31, 14, '87.80', 'BALANCED'),
(45, 'Client 45', 1640, 264, '142.56', 47, 10, '84.18', 'QUALITY'),
(46, 'Client 46', 1232, 2959, '7.00', 84, 19, '106.40', 'BALANCED'),
(47, 'Client 47', 1601, 869, '80.18', 99, 15, '59.20', 'BALANCED'),
(48, 'Client 48', 2326, 2157, '111.04', 36, 7, '79.95', 'BALANCED'),
(49, 'Client 49', 1440, 1789, '136.16', 50, 6, '86.77', 'BALANCED'),
(50, 'Client 50', 1496, 2104, '66.57', 40, 5, '22.34', 'PRICE'),
(51, 'Client 51', 484, 437, '99.77', 65, 6, '61.12', 'BALANCED'),
(52, 'Client 52', 118, 529, '129.23', 77, 15, '68.43', 'PRICE'),
(53, 'Client 53', 901, 2619, '21.66', 27, 5, '68.98', 'PRICE'),
(54, 'Client 54', 1028, 2237, '81.77', 20, 10, '111.23', 'BALANCED'),
(55, 'Client 55', 2469, 2249, '94.20', 25, 1, '113.09', 'BALANCED'),
(56, 'Client 56', 1155, 1349, '4.46', 68, 10, '85.01', 'PRICE'),
(57, 'Client 57', 1430, 1119, '140.45', 44, 16, '60.78', 'BALANCED'),
(58, 'Client 58', 2996, 2128, '95.20', 48, 16, '89.54', 'QUALITY'),
(59, 'Client 59', 1202, 2865, '126.66', 92, 18, '94.60', 'BALANCED'),
(60, 'Client 60', 3424, 737, '72.61', 76, 12, '54.22', 'BALANCED'),
(61, 'Client 61', 1624, 1919, '39.41', 28, 9, '67.80', 'BALANCED'),
(62, 'Client 62', 2071, 1989, '129.22', 81, 11, '15.60', 'PRICE'),
(63, 'Client 63', 628, 1390, '126.04', 79, 4, '76.95', 'PRICE'),
(64, 'Client 64', 527, 390, '149.79', 39, 5, '27.32', 'PRICE'),
(65, 'Client 65', 714, 1233, '140.00', 61, 5, '75.57', 'QUALITY'),
(66, 'Client 66', 3433, 1786, '41.32', 79, 9, '68.08', 'PRICE'),
(67, 'Client 67', 3102, 2147, '27.28', 83, 3, '59.17', 'PRICE'),
(68, 'Client 68', 1511, 920, '98.25', 68, 0, '149.95', 'QUALITY'),
(69, 'Client 69', 3472, 362, '109.45', 9, 2, '95.47', 'QUALITY'),
(70, 'Client 70', 3419, 574, '8.66', 42, 7, '98.27', 'QUALITY'),
(71, 'Client 71', 2369, 2059, '123.36', 83, 18, '60.72', 'BALANCED'),
(72, 'Client 72', 1487, 2157, '74.20', 80, 4, '46.51', 'BALANCED'),
(73, 'Client 73', 3130, 2751, '23.88', 9, 6, '40.40', 'BALANCED'),
(74, 'Client 74', 1891, 718, '66.01', 0, 17, '17.79', 'PRICE'),
(75, 'Client 75', 2722, 2252, '26.03', 82, 0, '103.86', 'BALANCED'),
(76, 'Client 76', 556, 1681, '123.06', 53, 0, '66.56', 'BALANCED'),
(77, 'Client 77', 370, 1783, '113.10', 25, 4, '95.02', 'BALANCED'),
(78, 'Client 78', 1789, 962, '33.66', 36, 12, '130.12', 'QUALITY'),
(79, 'Client 79', 768, 2291, '27.27', 8, 3, '80.85', 'PRICE'),
(80, 'Client 80', 654, 2112, '21.44', 99, 19, '50.90', 'PRICE'),
(81, 'Client 81', 2304, 591, '146.36', 87, 19, '30.38', 'PRICE'),
(82, 'Client 82', 3061, 1445, '44.07', 65, 5, '60.31', 'PRICE'),
(83, 'Client 83', 2584, 1182, '106.87', 82, 9, '73.96', 'QUALITY'),
(84, 'Client 84', 141, 1147, '39.77', 48, 5, '95.63', 'BALANCED'),
(85, 'Client 85', 1494, 1078, '58.42', 56, 15, '76.75', 'BALANCED'),
(86, 'Client 86', 983, 1378, '101.82', 56, 16, '15.09', 'PRICE'),
(87, 'Client 87', 277, 1814, '97.30', 89, 15, '86.22', 'PRICE'),
(88, 'Client 88', 643, 2498, '140.40', 47, 9, '87.21', 'QUALITY'),
(89, 'Client 89', 255, 1418, '102.25', 19, 0, '77.93', 'QUALITY'),
(90, 'Client 90', 788, 358, '27.24', 42, 1, '83.82', 'PRICE'),
(91, 'Client 91', 514, 1064, '9.24', 36, 10, '36.18', 'PRICE'),
(92, 'Client 92', 1282, 1285, '133.37', 20, 0, '42.99', 'BALANCED'),
(93, 'Client 93', 3257, 200, '93.32', 11, 8, '83.19', 'PRICE'),
(94, 'Client 94', 470, 355, '79.38', 81, 2, '38.53', 'BALANCED'),
(95, 'Client 95', 3488, 233, '142.35', 32, 1, '134.50', 'QUALITY'),
(96, 'Client 96', 2040, 2413, '75.30', 97, 10, '92.67', 'PRICE'),
(97, 'Client 97', 1753, 2425, '88.13', 39, 9, '40.69', 'PRICE'),
(98, 'Client 98', 491, 2946, '130.06', 10, 0, '43.69', 'PRICE'),
(99, 'Client 99', 2083, 1347, '95.34', 43, 7, '144.62', 'QUALITY'),
(100, 'Client 100', 3247, 2330, '68.21', 32, 19, '51.95', 'PRICE'),
(101, 'Client 101', 2009, 1083, '48.79', 55, 19, '65.29', 'BALANCED'),
(102, 'Client 102', 1242, 951, '108.74', 16, 19, '32.16', 'PRICE'),
(103, 'Client 103', 1392, 2286, '39.36', 75, 10, '144.20', 'QUALITY'),
(104, 'Client 104', 2902, 358, '8.83', 66, 13, '101.40', 'QUALITY'),
(105, 'Client 105', 3312, 2767, '1.69', 57, 12, '89.43', 'BALANCED'),
(106, 'Client 106', 182, 295, '111.78', 2, 3, '109.71', 'QUALITY'),
(107, 'Client 107', 2989, 1383, '118.21', 0, 18, '140.30', 'QUALITY'),
(108, 'Client 108', 1190, 2560, '41.28', 56, 13, '76.99', 'PRICE'),
(109, 'Client 109', 604, 683, '144.85', 53, 1, '138.45', 'QUALITY'),
(110, 'Client 110', 3374, 2796, '131.84', 59, 11, '23.09', 'PRICE'),
(111, 'Client 111', 1341, 1540, '85.09', 48, 12, '83.58', 'BALANCED'),
(112, 'Client 112', 3438, 2808, '63.23', 36, 2, '133.58', 'QUALITY'),
(113, 'Client 113', 458, 253, '46.27', 28, 14, '36.92', 'BALANCED'),
(114, 'Client 114', 3066, 1544, '103.83', 46, 11, '123.47', 'QUALITY'),
(115, 'Client 115', 613, 2381, '6.97', 61, 11, '56.78', 'PRICE'),
(116, 'Client 116', 1642, 1369, '29.08', 13, 9, '22.74', 'PRICE'),
(117, 'Client 117', 1237, 636, '121.54', 40, 8, '41.46', 'BALANCED'),
(118, 'Client 118', 3411, 2972, '95.50', 87, 7, '69.49', 'BALANCED'),
(119, 'Client 119', 1530, 653, '149.04', 53, 9, '18.23', 'PRICE'),
(120, 'Client 120', 3357, 1658, '135.55', 30, 7, '109.87', 'BALANCED'),
(121, 'Client 121', 205, 2739, '9.91', 11, 0, '47.46', 'BALANCED'),
(122, 'Client 122', 2929, 254, '85.55', 91, 14, '105.60', 'QUALITY'),
(123, 'Client 123', 1420, 557, '47.29', 96, 15, '37.88', 'PRICE'),
(124, 'Client 124', 703, 639, '130.23', 9, 2, '101.40', 'BALANCED'),
(125, 'Client 125', 2492, 1876, '141.56', 84, 12, '98.66', 'BALANCED'),
(126, 'Client 126', 487, 1194, '134.94', 54, 4, '126.39', 'QUALITY'),
(127, 'Client 127', 3402, 1397, '58.56', 45, 5, '101.32', 'QUALITY'),
(128, 'Client 128', 1297, 2185, '117.20', 7, 14, '89.45', 'PRICE'),
(129, 'Client 129', 1588, 305, '24.47', 3, 17, '113.06', 'BALANCED'),
(130, 'Client 130', 760, 1181, '140.49', 51, 17, '33.91', 'PRICE'),
(131, 'Client 131', 3421, 1098, '10.44', 15, 2, '60.49', 'PRICE'),
(132, 'Client 132', 723, 819, '94.27', 53, 15, '99.05', 'BALANCED'),
(133, 'Client 133', 746, 1973, '142.38', 86, 2, '42.25', 'BALANCED'),
(134, 'Client 134', 1250, 1251, '141.91', 43, 16, '76.66', 'PRICE'),
(135, 'Client 135', 1355, 1297, '48.79', 18, 3, '123.83', 'QUALITY'),
(136, 'Client 136', 2303, 2433, '108.56', 22, 18, '144.93', 'QUALITY'),
(137, 'Client 137', 632, 2475, '75.15', 10, 10, '55.66', 'PRICE'),
(138, 'Client 138', 1842, 866, '73.46', 99, 10, '103.74', 'QUALITY'),
(139, 'Client 139', 1698, 2215, '34.97', 59, 14, '19.07', 'PRICE'),
(140, 'Client 140', 2249, 101, '134.62', 46, 5, '39.83', 'BALANCED'),
(141, 'Client 141', 1690, 2172, '117.48', 64, 18, '86.03', 'BALANCED'),
(142, 'Client 142', 1527, 2323, '52.80', 63, 8, '88.75', 'BALANCED'),
(143, 'Client 143', 2335, 2129, '64.34', 37, 12, '75.46', 'BALANCED'),
(144, 'Client 144', 2851, 1495, '33.11', 45, 11, '45.49', 'BALANCED'),
(145, 'Client 145', 2620, 1153, '112.34', 62, 4, '36.81', 'PRICE'),
(146, 'Client 146', 3136, 344, '24.01', 95, 5, '38.31', 'PRICE'),
(147, 'Client 147', 731, 607, '114.32', 88, 3, '84.01', 'QUALITY'),
(148, 'Client 148', 2493, 2373, '22.97', 47, 7, '39.67', 'PRICE'),
(149, 'Client 149', 993, 2135, '106.05', 55, 2, '53.49', 'PRICE'),
(150, 'Client 150', 291, 1765, '122.45', 74, 4, '100.64', 'BALANCED'),
(151, 'Client 151', 1596, 1051, '27.28', 36, 4, '46.36', 'PRICE'),
(152, 'Client 152', 1662, 2734, '47.76', 75, 3, '25.47', 'PRICE'),
(153, 'Client 153', 991, 2117, '56.02', 30, 18, '131.05', 'QUALITY'),
(154, 'Client 154', 864, 1126, '96.81', 49, 0, '114.91', 'BALANCED'),
(155, 'Client 155', 3041, 1351, '136.38', 88, 10, '71.87', 'BALANCED'),
(156, 'Client 156', 2780, 2145, '72.10', 1, 9, '47.59', 'PRICE'),
(157, 'Client 157', 1755, 2302, '125.66', 55, 19, '88.01', 'QUALITY'),
(158, 'Client 158', 424, 252, '149.23', 84, 13, '106.19', 'BALANCED'),
(159, 'Client 159', 3061, 428, '40.94', 40, 16, '90.10', 'PRICE'),
(160, 'Client 160', 2141, 2983, '45.15', 55, 4, '30.61', 'PRICE'),
(161, 'Client 161', 635, 1906, '61.03', 94, 1, '69.51', 'PRICE'),
(162, 'Client 162', 2927, 2232, '121.99', 17, 19, '88.06', 'PRICE'),
(163, 'Client 163', 963, 933, '122.36', 67, 8, '37.10', 'PRICE'),
(164, 'Client 164', 861, 1706, '65.06', 26, 19, '55.24', 'BALANCED'),
(165, 'Client 165', 1542, 1844, '57.37', 77, 14, '52.05', 'BALANCED'),
(166, 'Client 166', 2931, 1737, '149.12', 57, 17, '31.64', 'PRICE'),
(167, 'Client 167', 183, 2200, '14.27', 80, 2, '129.77', 'QUALITY'),
(168, 'Client 168', 1413, 747, '30.13', 18, 11, '53.35', 'PRICE'),
(169, 'Client 169', 1464, 1602, '103.87', 64, 2, '67.95', 'BALANCED'),
(170, 'Client 170', 3441, 767, '37.64', 92, 19, '130.37', 'QUALITY'),
(171, 'Client 171', 2567, 1271, '30.88', 46, 3, '52.11', 'PRICE'),
(172, 'Client 172', 689, 617, '136.23', 79, 10, '36.28', 'PRICE'),
(173, 'Client 173', 2819, 399, '21.12', 25, 0, '47.16', 'PRICE'),
(174, 'Client 174', 3306, 1238, '60.48', 84, 5, '27.96', 'PRICE'),
(175, 'Client 175', 171, 1328, '32.43', 78, 7, '103.08', 'BALANCED'),
(176, 'Client 176', 3215, 263, '8.53', 22, 17, '59.46', 'BALANCED'),
(177, 'Client 177', 3042, 1636, '20.12', 75, 2, '110.08', 'BALANCED'),
(178, 'Client 178', 2743, 2926, '131.63', 44, 3, '94.58', 'BALANCED'),
(179, 'Client 179', 1869, 525, '43.89', 74, 8, '54.07', 'BALANCED'),
(180, 'Client 180', 456, 2033, '87.81', 50, 17, '132.95', 'QUALITY'),
(181, 'Client 181', 1413, 2404, '110.74', 24, 5, '76.85', 'BALANCED'),
(182, 'Client 182', 2389, 1044, '144.13', 79, 0, '88.43', 'PRICE'),
(183, 'Client 183', 2540, 1207, '96.10', 35, 13, '113.93', 'BALANCED'),
(184, 'Client 184', 1685, 1812, '131.46', 41, 1, '78.02', 'PRICE'),
(185, 'Client 185', 1029, 1849, '132.65', 97, 15, '76.62', 'PRICE'),
(186, 'Client 186', 1089, 744, '99.11', 60, 18, '16.96', 'PRICE'),
(187, 'Client 187', 2912, 2757, '84.96', 71, 12, '19.42', 'PRICE'),
(188, 'Client 188', 1759, 2463, '5.60', 86, 16, '90.61', 'PRICE'),
(189, 'Client 189', 1417, 1111, '39.38', 74, 10, '74.69', 'PRICE'),
(190, 'Client 190', 3039, 928, '80.16', 21, 8, '54.66', 'BALANCED'),
(191, 'Client 191', 2738, 1252, '143.82', 2, 8, '65.84', 'PRICE'),
(192, 'Client 192', 2499, 2787, '71.94', 53, 2, '86.24', 'BALANCED'),
(193, 'Client 193', 1600, 101, '121.95', 88, 1, '61.29', 'PRICE'),
(194, 'Client 194', 1255, 826, '135.53', 97, 13, '41.57', 'PRICE'),
(195, 'Client 195', 3230, 908, '14.41', 21, 3, '20.70', 'PRICE'),
(196, 'Client 196', 464, 308, '20.75', 7, 10, '81.42', 'BALANCED'),
(197, 'Client 197', 2904, 159, '132.44', 63, 6, '76.77', 'BALANCED'),
(198, 'Client 198', 2252, 1272, '52.56', 44, 3, '48.58', 'BALANCED'),
(199, 'Client 199', 1663, 2355, '23.88', 26, 15, '102.37', 'BALANCED'),
(200, 'Client 200', 899, 2861, '128.61', 68, 17, '76.20', 'PRICE'),
(201, 'Client 201', 318, 2270, '103.65', 21, 13, '38.60', 'PRICE'),
(202, 'Client 202', 3188, 783, '83.59', 28, 5, '118.83', 'QUALITY'),
(203, 'Client 203', 2195, 2777, '104.34', 13, 12, '89.61', 'BALANCED'),
(204, 'Client 204', 2377, 2266, '61.95', 44, 8, '32.79', 'PRICE'),
(205, 'Client 205', 349, 2505, '36.32', 74, 16, '113.66', 'QUALITY'),
(206, 'Client 206', 2912, 2884, '75.38', 47, 1, '109.24', 'BALANCED'),
(207, 'Client 207', 2188, 2879, '90.70', 52, 19, '75.75', 'QUALITY'),
(208, 'Client 208', 2594, 2022, '138.33', 48, 6, '107.47', 'QUALITY'),
(209, 'Client 209', 1752, 1563, '27.95', 45, 8, '42.62', 'BALANCED'),
(210, 'Client 210', 798, 1956, '115.62', 43, 10, '17.57', 'PRICE'),
(211, 'Client 211', 2580, 2927, '141.22', 15, 19, '120.13', 'QUALITY'),
(212, 'Client 212', 627, 1216, '62.43', 64, 5, '33.45', 'PRICE'),
(213, 'Client 213', 2670, 2836, '113.66', 50, 9, '114.91', 'BALANCED'),
(214, 'Client 214', 2981, 2190, '38.31', 28, 13, '61.60', 'PRICE'),
(215, 'Client 215', 956, 76, '79.49', 99, 6, '103.80', 'BALANCED'),
(216, 'Client 216', 2254, 1001, '79.75', 20, 13, '59.26', 'BALANCED'),
(217, 'Client 217', 2923, 762, '147.77', 98, 18, '133.88', 'QUALITY'),
(218, 'Client 218', 3176, 161, '82.55', 32, 1, '55.44', 'PRICE'),
(219, 'Client 219', 1984, 1267, '112.63', 40, 16, '61.45', 'BALANCED'),
(220, 'Client 220', 1200, 1318, '127.73', 18, 19, '33.23', 'PRICE'),
(221, 'Client 221', 1589, 2954, '4.15', 55, 19, '49.16', 'BALANCED'),
(222, 'Client 222', 1141, 2680, '10.68', 27, 0, '81.54', 'BALANCED'),
(223, 'Client 223', 239, 115, '24.15', 84, 10, '50.58', 'PRICE'),
(224, 'Client 224', 2142, 1178, '120.61', 7, 12, '70.88', 'QUALITY'),
(225, 'Client 225', 3131, 1802, '82.87', 90, 13, '31.22', 'PRICE'),
(226, 'Client 226', 567, 465, '90.31', 72, 19, '74.53', 'BALANCED'),
(227, 'Client 227', 3338, 2766, '54.59', 47, 14, '18.68', 'PRICE'),
(228, 'Client 228', 824, 1472, '3.75', 71, 6, '66.52', 'PRICE'),
(229, 'Client 229', 1565, 1913, '121.77', 77, 4, '43.22', 'BALANCED'),
(230, 'Client 230', 2505, 1881, '37.59', 60, 3, '87.89', 'QUALITY'),
(231, 'Client 231', 196, 528, '27.32', 41, 2, '144.05', 'QUALITY'),
(232, 'Client 232', 2894, 1845, '3.66', 92, 6, '91.15', 'PRICE'),
(233, 'Client 233', 3241, 2625, '145.56', 76, 3, '92.66', 'PRICE'),
(234, 'Client 234', 3175, 2378, '127.62', 7, 1, '119.18', 'QUALITY'),
(235, 'Client 235', 2167, 1932, '23.88', 57, 13, '76.00', 'QUALITY'),
(236, 'Client 236', 2602, 591, '71.40', 84, 14, '59.98', 'BALANCED'),
(237, 'Client 237', 1808, 434, '55.98', 73, 19, '52.57', 'BALANCED'),
(238, 'Client 238', 653, 1799, '110.39', 94, 1, '138.76', 'QUALITY'),
(239, 'Client 239', 792, 639, '37.01', 85, 11, '89.13', 'PRICE'),
(240, 'Client 240', 2184, 330, '148.11', 69, 10, '22.07', 'PRICE'),
(241, 'Client 241', 569, 2580, '11.62', 33, 8, '95.30', 'BALANCED'),
(242, 'Client 242', 1689, 1558, '127.01', 33, 14, '82.42', 'PRICE'),
(243, 'Client 243', 1844, 2412, '97.97', 95, 3, '140.81', 'QUALITY'),
(244, 'Client 244', 449, 884, '23.75', 14, 3, '73.79', 'QUALITY'),
(245, 'Client 245', 2421, 1391, '66.72', 13, 13, '56.75', 'PRICE'),
(246, 'Client 246', 1479, 1305, '92.54', 3, 6, '67.11', 'PRICE'),
(247, 'Client 247', 1339, 1269, '38.00', 1, 6, '46.53', 'PRICE'),
(248, 'Client 248', 1625, 67, '80.04', 37, 4, '36.75', 'BALANCED'),
(249, 'Client 249', 2097, 2281, '63.77', 34, 14, '132.63', 'QUALITY'),
(250, 'Client 250', 395, 1007, '90.60', 2, 4, '57.78', 'BALANCED'),
(251, 'Client 251', 2685, 1529, '139.45', 63, 19, '38.39', 'BALANCED'),
(252, 'Client 252', 3434, 2881, '22.86', 54, 15, '149.01', 'QUALITY'),
(253, 'Client 253', 1210, 279, '126.56', 45, 10, '53.38', 'PRICE'),
(254, 'Client 254', 1167, 908, '20.51', 47, 4, '110.63', 'BALANCED'),
(255, 'Client 255', 228, 2376, '14.51', 50, 10, '89.41', 'PRICE'),
(256, 'Client 256', 1511, 2961, '39.57', 97, 17, '138.76', 'QUALITY'),
(257, 'Client 257', 1790, 430, '128.47', 27, 17, '112.46', 'QUALITY'),
(258, 'Client 258', 1395, 718, '45.91', 18, 3, '66.35', 'BALANCED'),
(259, 'Client 259', 157, 2157, '28.02', 68, 10, '36.08', 'PRICE'),
(260, 'Client 260', 2378, 1231, '107.80', 34, 9, '43.90', 'PRICE'),
(261, 'Client 261', 1659, 214, '32.86', 57, 0, '62.41', 'BALANCED'),
(262, 'Client 262', 3155, 1715, '19.47', 49, 19, '74.77', 'PRICE'),
(263, 'Client 263', 872, 925, '140.60', 80, 4, '71.83', 'PRICE'),
(264, 'Client 264', 2142, 2071, '51.89', 99, 10, '76.53', 'BALANCED'),
(265, 'Client 265', 611, 2356, '92.35', 17, 6, '144.21', 'QUALITY'),
(266, 'Client 266', 98, 813, '17.13', 3, 15, '36.91', 'PRICE'),
(267, 'Client 267', 878, 1089, '29.75', 27, 18, '45.81', 'PRICE'),
(268, 'Client 268', 1356, 1057, '14.37', 32, 12, '31.17', 'PRICE'),
(269, 'Client 269', 136, 1818, '139.35', 99, 0, '77.55', 'BALANCED'),
(270, 'Client 270', 1789, 148, '114.95', 77, 14, '86.64', 'PRICE'),
(271, 'Client 271', 2962, 409, '121.15', 76, 15, '144.34', 'QUALITY'),
(272, 'Client 272', 1114, 2784, '115.74', 99, 0, '67.50', 'PRICE'),
(273, 'Client 273', 371, 2022, '120.08', 77, 16, '83.55', 'PRICE'),
(274, 'Client 274', 2128, 2268, '62.71', 27, 17, '50.86', 'PRICE'),
(275, 'Client 275', 196, 2915, '64.34', 39, 0, '36.63', 'PRICE'),
(276, 'Client 276', 3083, 2754, '49.84', 42, 14, '68.42', 'BALANCED'),
(277, 'Client 277', 1783, 1154, '23.62', 50, 15, '60.26', 'PRICE'),
(278, 'Client 278', 1264, 1475, '39.25', 82, 13, '132.78', 'QUALITY'),
(279, 'Client 279', 3395, 1755, '22.17', 83, 18, '48.60', 'BALANCED'),
(280, 'Client 280', 1866, 944, '40.25', 58, 3, '44.21', 'BALANCED'),
(281, 'Client 281', 3257, 1180, '9.77', 72, 6, '135.27', 'QUALITY'),
(282, 'Client 282', 2112, 1551, '39.53', 51, 1, '24.49', 'PRICE'),
(283, 'Client 283', 2337, 820, '28.71', 89, 5, '82.01', 'BALANCED'),
(284, 'Client 284', 1165, 1498, '24.29', 44, 14, '114.98', 'BALANCED'),
(285, 'Client 285', 409, 977, '72.87', 87, 15, '77.02', 'QUALITY'),
(286, 'Client 286', 3232, 1774, '142.18', 92, 6, '43.41', 'PRICE'),
(287, 'Client 287', 1135, 2225, '29.32', 41, 11, '90.26', 'QUALITY'),
(288, 'Client 288', 3149, 1856, '6.77', 6, 2, '62.12', 'BALANCED'),
(289, 'Client 289', 2305, 1364, '142.53', 9, 17, '105.10', 'BALANCED'),
(290, 'Client 290', 2632, 2559, '55.88', 32, 17, '38.75', 'PRICE'),
(291, 'Client 291', 1903, 1433, '38.93', 36, 13, '30.76', 'PRICE'),
(292, 'Client 292', 1381, 956, '58.83', 62, 4, '57.71', 'PRICE'),
(293, 'Client 293', 1241, 99, '88.54', 37, 5, '76.76', 'BALANCED'),
(294, 'Client 294', 3383, 2739, '9.75', 79, 14, '90.87', 'BALANCED'),
(295, 'Client 295', 1530, 2411, '14.83', 45, 8, '45.13', 'BALANCED'),
(296, 'Client 296', 1988, 137, '108.79', 50, 16, '85.32', 'BALANCED'),
(297, 'Client 297', 3049, 1366, '126.53', 75, 10, '37.91', 'BALANCED'),
(298, 'Client 298', 3048, 2141, '129.19', 21, 15, '103.62', 'QUALITY'),
(299, 'Client 299', 2286, 2696, '105.86', 33, 6, '22.49', 'PRICE'),
(300, 'Client 300', 755, 2148, '30.77', 76, 5, '112.77', 'BALANCED');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `offer_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `segment` enum('PREPAID','POSTPAID','BUSINESS') NOT NULL,
  `monthly_price` decimal(10,2) NOT NULL,
  `quota_minutes` int(11) DEFAULT 0,
  `quota_sms` int(11) DEFAULT 0,
  `quota_data_gb` decimal(10,2) DEFAULT 0.00,
  `validity_days` int(11) DEFAULT 30,
  `fair_use_gb` decimal(10,2) DEFAULT 0.00,
  `over_minute_price` decimal(10,4) DEFAULT 0.1000,
  `over_sms_price` decimal(10,4) DEFAULT 0.0500,
  `over_data_price` decimal(10,4) DEFAULT 0.5000,
  `roaming_included_days` int(11) DEFAULT 0,
  `status` enum('PUBLISHED','DRAFT','RETIRED') DEFAULT 'PUBLISHED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`offer_id`, `name`, `segment`, `monthly_price`, `quota_minutes`, `quota_sms`, `quota_data_gb`, `validity_days`, `fair_use_gb`, `over_minute_price`, `over_sms_price`, `over_data_price`, `roaming_included_days`, `status`) VALUES
(1, 'Offer 1', 'POSTPAID', '37.56', 979, 1745, '58.82', 30, '58.82', '0.1468', '0.0633', '0.8075', 3, 'PUBLISHED'),
(2, 'Offer 2', 'POSTPAID', '34.83', 369, 528, '55.07', 30, '55.07', '0.1270', '0.0410', '0.3045', 13, 'PUBLISHED'),
(3, 'Offer 3', 'PREPAID', '21.55', 257, 1281, '15.40', 30, '15.40', '0.1462', '0.0725', '0.8005', 3, 'PUBLISHED'),
(4, 'Offer 4', 'POSTPAID', '21.75', 838, 1183, '57.81', 30, '57.81', '0.1168', '0.0777', '0.3932', 2, 'PUBLISHED'),
(5, 'Offer 5', 'POSTPAID', '27.58', 1033, 433, '43.30', 30, '43.30', '0.1071', '0.0406', '0.8494', 4, 'DRAFT'),
(6, 'Offer 6', 'PREPAID', '21.65', 220, 898, '8.36', 30, '8.36', '0.0575', '0.0578', '0.2258', 4, 'PUBLISHED'),
(7, 'Offer 7', 'PREPAID', '20.74', 635, 1346, '14.40', 30, '14.40', '0.0797', '0.0498', '0.2258', 1, 'PUBLISHED'),
(8, 'Offer 8', 'POSTPAID', '38.84', 1605, 1739, '63.55', 30, '63.55', '0.1025', '0.0488', '0.6033', 8, 'PUBLISHED'),
(9, 'Offer 9', 'PREPAID', '13.73', 787, 468, '8.76', 30, '8.76', '0.0504', '0.0141', '0.3532', 4, 'PUBLISHED'),
(10, 'Offer 10', 'POSTPAID', '42.28', 1736, 1109, '56.50', 30, '56.50', '0.0728', '0.0670', '0.2503', 11, 'PUBLISHED'),
(11, 'Offer 11', 'PREPAID', '19.45', 572, 950, '4.06', 30, '4.06', '0.0398', '0.0587', '0.5015', 4, 'PUBLISHED'),
(12, 'Offer 12', 'PREPAID', '17.61', 425, 1234, '2.67', 30, '2.67', '0.0353', '0.0773', '0.9177', 1, 'PUBLISHED'),
(13, 'Offer 13', 'PREPAID', '24.38', 247, 1568, '14.62', 30, '14.62', '0.0554', '0.0167', '0.9123', 3, 'PUBLISHED'),
(14, 'Offer 14', 'PREPAID', '11.12', 387, 1626, '4.36', 30, '4.36', '0.1314', '0.0631', '0.7475', 2, 'PUBLISHED'),
(15, 'Offer 15', 'POSTPAID', '43.36', 370, 1369, '15.91', 30, '15.91', '0.0254', '0.0446', '0.3969', 11, 'PUBLISHED'),
(16, 'Offer 16', 'PREPAID', '16.75', 361, 1597, '18.58', 30, '18.58', '0.0955', '0.0343', '0.6318', 0, 'PUBLISHED'),
(17, 'Offer 17', 'BUSINESS', '78.58', 2868, 4130, '62.41', 30, '62.41', '0.0838', '0.0756', '0.6146', 11, 'PUBLISHED'),
(18, 'Offer 18', 'PREPAID', '11.63', 414, 1112, '9.34', 30, '9.34', '0.0228', '0.0678', '0.9065', 2, 'PUBLISHED'),
(19, 'Offer 19', 'POSTPAID', '24.34', 1398, 1410, '29.69', 30, '29.69', '0.1145', '0.0638', '0.1970', 3, 'RETIRED'),
(20, 'Offer 20', 'PREPAID', '5.75', 544, 325, '8.05', 30, '8.05', '0.1279', '0.0666', '0.3854', 2, 'RETIRED'),
(21, 'Offer 21', 'PREPAID', '15.30', 729, 549, '18.78', 30, '18.78', '0.0258', '0.0405', '0.9931', 0, 'DRAFT'),
(22, 'Offer 22', 'POSTPAID', '55.63', 496, 602, '46.32', 30, '46.32', '0.0611', '0.0640', '0.6955', 13, 'PUBLISHED'),
(23, 'Offer 23', 'PREPAID', '19.94', 334, 561, '18.80', 30, '18.80', '0.0360', '0.0682', '0.2380', 4, 'PUBLISHED'),
(24, 'Offer 24', 'POSTPAID', '54.98', 633, 280, '31.72', 30, '31.72', '0.1211', '0.0780', '0.5507', 2, 'PUBLISHED'),
(25, 'Offer 25', 'PREPAID', '9.59', 259, 307, '13.88', 30, '13.88', '0.0858', '0.0586', '0.6230', 4, 'PUBLISHED'),
(26, 'Offer 26', 'POSTPAID', '48.62', 419, 351, '19.17', 30, '19.17', '0.0361', '0.0749', '0.4578', 11, 'PUBLISHED'),
(27, 'Offer 27', 'POSTPAID', '46.51', 764, 1920, '30.05', 30, '30.05', '0.0232', '0.0489', '0.6706', 14, 'PUBLISHED'),
(28, 'Offer 28', 'PREPAID', '13.38', 743, 62, '12.32', 30, '12.32', '0.1413', '0.0663', '0.5206', 4, 'DRAFT'),
(29, 'Offer 29', 'PREPAID', '7.18', 265, 1667, '16.14', 30, '16.14', '0.0890', '0.0524', '0.8810', 2, 'PUBLISHED'),
(30, 'Offer 30', 'PREPAID', '12.48', 224, 1856, '13.39', 30, '13.39', '0.1328', '0.0418', '0.3231', 2, 'PUBLISHED'),
(31, 'Offer 31', 'POSTPAID', '52.66', 1926, 389, '14.66', 30, '14.66', '0.0390', '0.0677', '0.3793', 7, 'PUBLISHED'),
(32, 'Offer 32', 'BUSINESS', '53.24', 3377, 1623, '73.04', 30, '73.04', '0.0350', '0.0115', '0.1499', 12, 'PUBLISHED'),
(33, 'Offer 33', 'PREPAID', '16.82', 436, 1377, '8.48', 30, '8.48', '0.0856', '0.0713', '0.8660', 4, 'PUBLISHED'),
(34, 'Offer 34', 'PREPAID', '9.73', 288, 494, '11.85', 30, '11.85', '0.0741', '0.0134', '0.4363', 1, 'PUBLISHED'),
(35, 'Offer 35', 'PREPAID', '21.67', 130, 151, '18.57', 30, '18.57', '0.1297', '0.0732', '0.9816', 3, 'DRAFT'),
(36, 'Offer 36', 'POSTPAID', '45.70', 378, 1309, '19.42', 30, '19.42', '0.0897', '0.0460', '0.8718', 11, 'PUBLISHED'),
(37, 'Offer 37', 'PREPAID', '17.79', 237, 569, '3.66', 30, '3.66', '0.0742', '0.0263', '0.4308', 2, 'PUBLISHED'),
(38, 'Offer 38', 'PREPAID', '12.59', 408, 406, '6.64', 30, '6.64', '0.1434', '0.0741', '0.5328', 3, 'PUBLISHED'),
(39, 'Offer 39', 'POSTPAID', '53.94', 1080, 1374, '66.31', 30, '66.31', '0.1023', '0.0302', '0.7614', 8, 'PUBLISHED'),
(40, 'Offer 40', 'POSTPAID', '54.43', 1158, 1854, '53.01', 30, '53.01', '0.0324', '0.0608', '0.1760', 1, 'RETIRED'),
(41, 'Offer 41', 'PREPAID', '24.18', 177, 1611, '12.28', 30, '12.28', '0.1234', '0.0762', '0.3280', 2, 'PUBLISHED'),
(42, 'Offer 42', 'PREPAID', '17.32', 636, 377, '11.73', 30, '11.73', '0.0944', '0.0426', '0.5704', 0, 'DRAFT'),
(43, 'Offer 43', 'POSTPAID', '39.69', 624, 1279, '75.19', 30, '75.19', '0.0352', '0.0161', '0.6921', 12, 'PUBLISHED'),
(44, 'Offer 44', 'POSTPAID', '46.85', 415, 1514, '72.89', 30, '72.89', '0.1191', '0.0289', '0.4278', 5, 'PUBLISHED'),
(45, 'Offer 45', 'PREPAID', '7.96', 114, 1875, '9.32', 30, '9.32', '0.1149', '0.0487', '0.9425', 3, 'DRAFT'),
(46, 'Offer 46', 'POSTPAID', '35.05', 889, 1373, '60.24', 30, '60.24', '0.1437', '0.0183', '0.8655', 14, 'PUBLISHED'),
(47, 'Offer 47', 'PREPAID', '16.77', 74, 1387, '1.23', 30, '1.23', '0.1273', '0.0307', '0.5127', 0, 'PUBLISHED'),
(48, 'Offer 48', 'PREPAID', '23.37', 390, 1489, '3.10', 30, '3.10', '0.1496', '0.0715', '0.3555', 3, 'DRAFT'),
(49, 'Offer 49', 'PREPAID', '24.98', 67, 1348, '13.35', 30, '13.35', '0.1366', '0.0120', '0.3167', 3, 'PUBLISHED'),
(50, 'Offer 50', 'POSTPAID', '27.93', 362, 226, '55.94', 30, '55.94', '0.0247', '0.0104', '0.1465', 13, 'PUBLISHED'),
(51, 'Offer 51', 'POSTPAID', '29.54', 718, 1728, '14.01', 30, '14.01', '0.1406', '0.0640', '0.7283', 10, 'DRAFT'),
(52, 'Offer 52', 'PREPAID', '9.04', 650, 271, '10.59', 30, '10.59', '0.1169', '0.0541', '0.8660', 0, 'PUBLISHED'),
(53, 'Offer 53', 'POSTPAID', '27.72', 228, 687, '59.69', 30, '59.69', '0.0995', '0.0138', '0.6547', 7, 'PUBLISHED'),
(54, 'Offer 54', 'BUSINESS', '96.77', 4920, 2646, '63.76', 30, '63.76', '0.0439', '0.0786', '0.5127', 9, 'DRAFT'),
(55, 'Offer 55', 'POSTPAID', '42.90', 1003, 461, '76.22', 30, '76.22', '0.0951', '0.0590', '0.6843', 8, 'RETIRED'),
(56, 'Offer 56', 'PREPAID', '15.17', 276, 1397, '10.01', 30, '10.01', '0.0355', '0.0194', '0.3503', 2, 'PUBLISHED'),
(57, 'Offer 57', 'PREPAID', '17.22', 350, 1287, '8.82', 30, '8.82', '0.0483', '0.0512', '0.3853', 0, 'PUBLISHED'),
(58, 'Offer 58', 'PREPAID', '14.48', 356, 338, '11.88', 30, '11.88', '0.0936', '0.0591', '0.6832', 1, 'PUBLISHED'),
(59, 'Offer 59', 'PREPAID', '20.75', 307, 1120, '9.20', 30, '9.20', '0.0669', '0.0459', '0.7630', 2, 'DRAFT'),
(60, 'Offer 60', 'BUSINESS', '80.29', 3504, 3933, '169.98', 30, '169.98', '0.0609', '0.0686', '0.5447', 18, 'PUBLISHED');

-- --------------------------------------------------------

--
-- Table structure for table `offer_options`
--

CREATE TABLE `offer_options` (
  `offer_id` int(11) NOT NULL,
  `option_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `offer_options`
--

INSERT INTO `offer_options` (`offer_id`, `option_id`) VALUES
(1, 39),
(2, 10),
(2, 22),
(2, 27),
(3, 28),
(3, 36),
(4, 10),
(4, 17),
(4, 39),
(5, 31),
(5, 35),
(6, 24),
(6, 28),
(7, 5),
(7, 11),
(8, 4),
(8, 8),
(8, 27),
(8, 33),
(9, 17),
(9, 22),
(9, 32),
(10, 17),
(10, 31),
(11, 5),
(12, 8),
(12, 35),
(12, 39),
(13, 3),
(13, 16),
(13, 20),
(14, 6),
(14, 14),
(15, 3),
(15, 4),
(16, 23),
(17, 13),
(18, 26),
(18, 38),
(19, 17),
(19, 18),
(20, 20),
(20, 22),
(20, 29),
(20, 36),
(21, 9),
(21, 14),
(21, 15),
(21, 22),
(22, 9),
(22, 29),
(22, 38),
(23, 1),
(23, 12),
(23, 35),
(24, 7),
(24, 40),
(25, 1),
(25, 3),
(25, 11),
(25, 23),
(26, 17),
(26, 20),
(26, 24),
(26, 34),
(27, 10),
(27, 27),
(27, 32),
(28, 7),
(28, 8),
(28, 18),
(28, 23),
(29, 13),
(29, 32),
(29, 38),
(30, 2),
(30, 6),
(31, 2),
(31, 4),
(31, 12),
(31, 28),
(32, 40),
(33, 11),
(33, 21),
(34, 2),
(34, 3),
(35, 26),
(36, 3),
(36, 31),
(37, 9),
(37, 18),
(37, 40),
(38, 9),
(38, 17),
(39, 12),
(40, 17),
(41, 1),
(41, 5),
(41, 7),
(41, 21),
(42, 16),
(42, 18),
(43, 11),
(43, 18),
(43, 21),
(43, 32),
(44, 37),
(45, 28),
(45, 34),
(46, 30),
(47, 10),
(47, 38),
(48, 20),
(49, 29),
(49, 34),
(50, 25),
(51, 13),
(52, 1),
(53, 1),
(53, 4),
(53, 8),
(53, 37),
(54, 29),
(55, 4),
(55, 10),
(55, 19),
(56, 20),
(56, 27),
(56, 34),
(57, 7),
(57, 18),
(57, 20),
(57, 24),
(58, 10),
(58, 11),
(58, 37),
(58, 39),
(59, 4),
(59, 35),
(59, 39),
(60, 6),
(60, 13),
(60, 22),
(60, 32);

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `option_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('DATA_ADDON','VOICE_ADDON','SMS_ADDON','ROAMING','LOYALTY') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `data_gb` decimal(10,2) DEFAULT 0.00,
  `minutes` int(11) DEFAULT 0,
  `sms` int(11) DEFAULT 0,
  `validity_days` int(11) DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`option_id`, `name`, `type`, `price`, `data_gb`, `minutes`, `sms`, `validity_days`) VALUES
(0, 'Option 1', 'DATA_ADDON', '12.96', '2.06', 0, 0, 7),
(1, 'Option 1', 'DATA_ADDON', '12.95', '2.06', 0, 0, 7),
(2, 'Option 2', 'DATA_ADDON', '4.25', '6.96', 0, 0, 7),
(3, 'Option 3', 'SMS_ADDON', '1.09', '0.00', 0, 767, 30),
(4, 'Option 4', 'ROAMING', '12.45', '1.19', 70, 132, 30),
(5, 'Option 5', 'VOICE_ADDON', '9.67', '0.00', 159, 0, 7),
(6, 'Option 6', 'SMS_ADDON', '2.87', '0.00', 0, 1494, 30),
(7, 'Option 7', 'SMS_ADDON', '3.33', '0.00', 0, 1093, 30),
(8, 'Option 8', 'DATA_ADDON', '4.72', '10.98', 0, 0, 15),
(9, 'Option 9', 'DATA_ADDON', '4.16', '16.89', 0, 0, 30),
(10, 'Option 10', 'VOICE_ADDON', '8.71', '0.00', 594, 0, 30),
(11, 'Option 11', 'DATA_ADDON', '7.83', '8.46', 0, 0, 30),
(12, 'Option 12', 'DATA_ADDON', '11.82', '9.24', 0, 0, 15),
(13, 'Option 13', 'DATA_ADDON', '4.35', '18.23', 0, 0, 15),
(14, 'Option 14', 'DATA_ADDON', '5.03', '6.55', 0, 0, 7),
(15, 'Option 15', 'VOICE_ADDON', '5.95', '0.00', 345, 0, 7),
(16, 'Option 16', 'DATA_ADDON', '12.97', '13.11', 0, 0, 7),
(17, 'Option 17', 'SMS_ADDON', '5.02', '0.00', 0, 1232, 30),
(18, 'Option 18', 'DATA_ADDON', '6.77', '11.25', 0, 0, 30),
(19, 'Option 19', 'ROAMING', '14.65', '3.96', 87, 147, 30),
(20, 'Option 20', 'VOICE_ADDON', '9.28', '0.00', 252, 0, 15),
(21, 'Option 21', 'ROAMING', '11.81', '2.74', 174, 120, 15),
(22, 'Option 22', 'VOICE_ADDON', '9.34', '0.00', 152, 0, 15),
(23, 'Option 23', 'DATA_ADDON', '6.41', '4.64', 0, 0, 15),
(24, 'Option 24', 'DATA_ADDON', '14.06', '9.52', 0, 0, 15),
(25, 'Option 25', 'VOICE_ADDON', '2.06', '0.00', 253, 0, 15),
(26, 'Option 26', 'SMS_ADDON', '4.80', '0.00', 0, 561, 30),
(27, 'Option 27', 'SMS_ADDON', '3.87', '0.00', 0, 1476, 30),
(28, 'Option 28', 'ROAMING', '19.41', '4.83', 159, 135, 30),
(29, 'Option 29', 'ROAMING', '7.28', '3.80', 167, 104, 15),
(30, 'Option 30', 'SMS_ADDON', '6.82', '0.00', 0, 919, 7),
(31, 'Option 31', 'DATA_ADDON', '11.54', '15.25', 0, 0, 30),
(32, 'Option 32', 'DATA_ADDON', '3.61', '1.78', 0, 0, 15),
(33, 'Option 33', 'VOICE_ADDON', '9.88', '0.00', 488, 0, 30),
(34, 'Option 34', 'LOYALTY', '-3.35', '0.00', 0, 0, 15),
(35, 'Option 35', 'SMS_ADDON', '1.51', '0.00', 0, 488, 15),
(36, 'Option 36', 'ROAMING', '23.49', '4.20', 70, 36, 7),
(37, 'Option 37', 'DATA_ADDON', '3.42', '13.83', 0, 0, 15),
(38, 'Option 38', 'SMS_ADDON', '5.64', '0.00', 0, 210, 30),
(39, 'Option 39', 'SMS_ADDON', '5.81', '0.00', 0, 696, 7),
(40, 'Option 40', 'DATA_ADDON', '10.08', '17.30', 0, 0, 15);

-- --------------------------------------------------------

--
-- Table structure for table `scenarios`
--

CREATE TABLE `scenarios` (
  `scenario_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `scenario_simulations`
--

CREATE TABLE `scenario_simulations` (
  `scenario_id` int(11) NOT NULL,
  `simulation_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `simulations`
--

CREATE TABLE `simulations` (
  `simulation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `profile_id` int(11) NOT NULL,
  `run_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'COMPLETED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `simulation_results`
--

CREATE TABLE `simulation_results` (
  `result_id` int(11) NOT NULL,
  `simulation_id` int(11) NOT NULL,
  `offer_id` int(11) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `overage_minutes_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `overage_sms_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `overage_data_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `roaming_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `satisfaction_score` int(11) NOT NULL DEFAULT 0,
  `rank_position` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','ANALYST') NOT NULL DEFAULT 'ANALYST',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@telecom.com', '$2b$10$8uyzdEC4L1YDvkBYCHNYrOYxAZUI8KeyXk6rx31FDZq3VEQkBkfE.', 'ADMIN', '2026-03-30 21:47:23', '2026-03-30 22:39:41'),
(2, 'analyst', 'analyst@telecom.com', '$2b$10$8uyzdEC4L1YDvkBYCHNYrOYxAZUI8KeyXk6rx31FDZq3VEQkBkfE.', 'ANALYST', '2026-03-30 21:54:48', '2026-03-30 22:39:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_log_user` (`user_id`);

--
-- Indexes for table `customer_profiles`
--
ALTER TABLE `customer_profiles`
  ADD PRIMARY KEY (`profile_id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`offer_id`);

--
-- Indexes for table `offer_options`
--
ALTER TABLE `offer_options`
  ADD PRIMARY KEY (`offer_id`,`option_id`),
  ADD KEY `fk_oo_option` (`option_id`);

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`option_id`);

--
-- Indexes for table `scenarios`
--
ALTER TABLE `scenarios`
  ADD PRIMARY KEY (`scenario_id`),
  ADD KEY `fk_scen_user` (`user_id`);

--
-- Indexes for table `scenario_simulations`
--
ALTER TABLE `scenario_simulations`
  ADD PRIMARY KEY (`scenario_id`,`simulation_id`),
  ADD KEY `fk_ss_simulation` (`simulation_id`);

--
-- Indexes for table `simulations`
--
ALTER TABLE `simulations`
  ADD PRIMARY KEY (`simulation_id`),
  ADD KEY `fk_sim_user` (`user_id`),
  ADD KEY `fk_sim_profile` (`profile_id`);

--
-- Indexes for table `simulation_results`
--
ALTER TABLE `simulation_results`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `fk_res_simulation` (`simulation_id`),
  ADD KEY `fk_res_offer` (`offer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scenarios`
--
ALTER TABLE `scenarios`
  MODIFY `scenario_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `simulations`
--
ALTER TABLE `simulations`
  MODIFY `simulation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `simulation_results`
--
ALTER TABLE `simulation_results`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `offer_options`
--
ALTER TABLE `offer_options`
  ADD CONSTRAINT `fk_oo_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`offer_id`),
  ADD CONSTRAINT `fk_oo_option` FOREIGN KEY (`option_id`) REFERENCES `options` (`option_id`);

--
-- Constraints for table `scenarios`
--
ALTER TABLE `scenarios`
  ADD CONSTRAINT `fk_scen_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `scenario_simulations`
--
ALTER TABLE `scenario_simulations`
  ADD CONSTRAINT `fk_ss_scenario` FOREIGN KEY (`scenario_id`) REFERENCES `scenarios` (`scenario_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ss_simulation` FOREIGN KEY (`simulation_id`) REFERENCES `simulations` (`simulation_id`) ON DELETE CASCADE;

--
-- Constraints for table `simulations`
--
ALTER TABLE `simulations`
  ADD CONSTRAINT `fk_sim_profile` FOREIGN KEY (`profile_id`) REFERENCES `customer_profiles` (`profile_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sim_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `simulation_results`
--
ALTER TABLE `simulation_results`
  ADD CONSTRAINT `fk_res_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`offer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_res_simulation` FOREIGN KEY (`simulation_id`) REFERENCES `simulations` (`simulation_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
