-- Add missing tables
CREATE TABLE IF NOT EXISTS `purchase_requisitions` (
  `id` varchar(36) NOT NULL,
  `requester_id` varchar(36) NOT NULL,
  `department_id` varchar(36) NOT NULL,
  `item_name` text NOT NULL,
  `description` text NOT NULL,
  `quantity` int NOT NULL,
  `estimated_cost` decimal(10,2) NOT NULL,
  `justification` text NOT NULL,
  `required_date` datetime NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  `hod_approval` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
  `procurement_approval` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
  `finance_approval` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
  `approved_by` varchar(36),
  `rejection_reason` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` varchar(36) NOT NULL,
  `requisition_id` varchar(36) NOT NULL,
  `vendor_id` varchar(36) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  `expected_delivery` datetime,
  `actual_delivery` datetime,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `quotations` (
  `id` varchar(36) NOT NULL,
  `requisition_id` varchar(36) NOT NULL,
  `vendor_id` varchar(36) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `delivery_timeline` text,
  `valid_until` datetime,
  `is_selected` boolean DEFAULT false,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36),
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` varchar(36),
  `old_values` text,
  `new_values` text,
  `ip_address` text,
  `user_agent` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` varchar(36) NOT NULL,
  `stock_id` varchar(36) NOT NULL,
  `movement_type` text NOT NULL,
  `quantity` int NOT NULL,
  `reason` text NOT NULL,
  `reference_id` varchar(36),
  `performed_by` varchar(36),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Add foreign key constraints
ALTER TABLE `purchase_requisitions` ADD FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`);
ALTER TABLE `purchase_requisitions` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);
ALTER TABLE `purchase_orders` ADD FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisitions` (`id`);
ALTER TABLE `purchase_orders` ADD FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);
ALTER TABLE `quotations` ADD FOREIGN KEY (`requisition_id`) REFERENCES `purchase_requisitions` (`id`);
ALTER TABLE `quotations` ADD FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);
ALTER TABLE `stock_movements` ADD FOREIGN KEY (`stock_id`) REFERENCES `stock` (`id`);
ALTER TABLE `stock_movements` ADD FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`);