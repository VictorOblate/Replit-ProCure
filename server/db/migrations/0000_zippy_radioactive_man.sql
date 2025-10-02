CREATE TABLE `borrow_requests` (
	`id` varchar(36) NOT NULL,
	`requester_id` varchar(36) NOT NULL,
	`requester_department_id` varchar(36) NOT NULL,
	`item_id` varchar(36) NOT NULL,
	`owning_department_id` varchar(36) NOT NULL,
	`quantity_requested` int NOT NULL,
	`justification` text NOT NULL,
	`required_date` datetime NOT NULL,
	`status` enum('PENDING','APPROVED','REJECTED','COMPLETED') NOT NULL DEFAULT 'PENDING',
	`approved_by` varchar(36),
	`rejection_reason` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `borrow_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`hod_id` varchar(36),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` varchar(36) NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` varchar(36),
	`unit` text NOT NULL,
	`min_reorder_level` int NOT NULL DEFAULT 0,
	`unit_price` decimal(10,2),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `items_id` PRIMARY KEY(`id`),
	CONSTRAINT `items_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `stock` (
	`id` varchar(36) NOT NULL,
	`item_id` varchar(36) NOT NULL,
	`department_id` varchar(36) NOT NULL,
	`quantity_available` int NOT NULL DEFAULT 0,
	`quantity_reserved` int NOT NULL DEFAULT 0,
	`last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`role` enum('GENERAL_USER','HOD','PROCUREMENT_MANAGER','FINANCE_OFFICER') NOT NULL DEFAULT 'GENERAL_USER',
	`department_id` varchar(36),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
