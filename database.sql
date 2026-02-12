-- ---------------------------------------------------------
-- LuminaPOS - Modern Restaurant System Database
-- ---------------------------------------------------------

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS `sql_nara` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sql_nara`;

-- 2. Tabel Kategori
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Produk
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `costPrice` decimal(15,2) DEFAULT 0.00,
  `category` varchar(100) DEFAULT NULL,
  `image` longtext DEFAULT NULL,
  `description` text DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Meja
CREATE TABLE IF NOT EXISTS `tables` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('Available','Occupied') DEFAULT 'Available',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Pengguna
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Cashier','Waiter') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Pesanan (Dengan kolom customerName)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(50) NOT NULL,
  `customerName` varchar(255) DEFAULT 'Guest',
  `total` decimal(15,2) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `tableNumber` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'completed',
  `cashReceived` decimal(15,2) DEFAULT 0.00,
  `changeDue` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Item Pesanan
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) DEFAULT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Awal
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `role`) VALUES ('u1', 'admin', '123', 'Admin');
INSERT IGNORE INTO `categories` (`name`) VALUES ('Food'), ('Drink'), ('Snack'), ('Dessert');

COMMIT;