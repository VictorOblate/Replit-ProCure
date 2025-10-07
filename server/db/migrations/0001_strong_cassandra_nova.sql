CREATE TABLE `vendors` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`registration_number` text,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`contact_person` text,
	`vendor_status` enum('ACTIVE','INACTIVE','PENDING') NOT NULL DEFAULT 'PENDING',
	`categories` text,
	`rating` decimal(3,2) DEFAULT '0',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
