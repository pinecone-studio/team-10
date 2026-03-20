CREATE TABLE `asset_assignment_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`employee_scanned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_by_user_id` integer,
	`reviewed_at` text,
	`review_note` text,
	`status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`employee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_asset_assignment_requests_asset_id` ON `asset_assignment_requests` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_assignment_requests_employee_id` ON `asset_assignment_requests` (`employee_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_assignment_requests_status` ON `asset_assignment_requests` (`status`);--> statement-breakpoint
CREATE TABLE `asset_attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_id` integer NOT NULL,
	`attribute_name` text NOT NULL,
	`attribute_value` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_attributes_asset_id_attribute_name_unique` ON `asset_attributes` (`asset_id`,`attribute_name`);--> statement-breakpoint
CREATE INDEX `idx_asset_attributes_asset_id` ON `asset_attributes` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_attributes_name_value` ON `asset_attributes` (`attribute_name`,`attribute_value`);--> statement-breakpoint
CREATE TABLE `asset_disposals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_id` integer NOT NULL,
	`requested_by_user_id` integer NOT NULL,
	`approved_by_user_id` integer,
	`disposed_by_user_id` integer,
	`status` text NOT NULL,
	`disposal_reason` text NOT NULL,
	`disposal_method` text,
	`disposed_at` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requested_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`disposed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_asset_disposals_asset_id` ON `asset_disposals` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_disposals_status` ON `asset_disposals` (`status`);--> statement-breakpoint
CREATE TABLE `asset_distributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assignment_request_id` integer,
	`asset_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`distributed_by_user_id` integer NOT NULL,
	`distributed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`status` text NOT NULL,
	`returned_at` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`assignment_request_id`) REFERENCES `asset_assignment_requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`employee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`distributed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_distributions_assignment_request_id_unique` ON `asset_distributions` (`assignment_request_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_distributions_asset_id` ON `asset_distributions` (`asset_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_distributions_employee_id` ON `asset_distributions` (`employee_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_distributions_status` ON `asset_distributions` (`status`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`receive_item_id` integer NOT NULL,
	`asset_code` text NOT NULL,
	`qr_code` text NOT NULL,
	`asset_name` text NOT NULL,
	`category` text NOT NULL,
	`serial_number` text,
	`condition_status` text NOT NULL,
	`asset_status` text NOT NULL,
	`current_storage_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`receive_item_id`) REFERENCES `receive_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`current_storage_id`) REFERENCES `storage`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_asset_code_unique` ON `assets` (`asset_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `assets_qr_code_unique` ON `assets` (`qr_code`);--> statement-breakpoint
CREATE INDEX `idx_assets_receive_item_id` ON `assets` (`receive_item_id`);--> statement-breakpoint
CREATE INDEX `idx_assets_current_storage_id` ON `assets` (`current_storage_id`);--> statement-breakpoint
CREATE INDEX `idx_assets_asset_status` ON `assets` (`asset_status`);--> statement-breakpoint
CREATE INDEX `idx_assets_category` ON `assets` (`category`);--> statement-breakpoint
CREATE INDEX `idx_assets_serial_number` ON `assets` (`serial_number`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_user_id` integer,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`payload_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_actor_user_id` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_entity` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`read_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_id` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_notifications_is_read` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE TABLE `offices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`office_name` text NOT NULL,
	`location` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `offices_office_name_unique` ON `offices` (`office_name`);--> statement-breakpoint
CREATE TABLE `order_item_attributes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_item_id` integer NOT NULL,
	`attribute_name` text NOT NULL,
	`attribute_value` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_item_attributes_order_item_id_attribute_name_unique` ON `order_item_attributes` (`order_item_id`,`attribute_name`);--> statement-breakpoint
CREATE INDEX `idx_order_item_attributes_order_item_id` ON `order_item_attributes` (`order_item_id`);--> statement-breakpoint
CREATE INDEX `idx_order_item_attributes_name_value` ON `order_item_attributes` (`attribute_name`,`attribute_value`);--> statement-breakpoint
CREATE TABLE `order_item_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_item_id` integer NOT NULL,
	`image_url` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_item_images_order_item_id_image_url_unique` ON `order_item_images` (`order_item_id`,`image_url`);--> statement-breakpoint
CREATE INDEX `idx_order_item_images_order_item_id` ON `order_item_images` (`order_item_id`);--> statement-breakpoint
CREATE INDEX `idx_order_item_images_sort_order` ON `order_item_images` (`sort_order`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`item_name` text NOT NULL,
	`category` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_cost` real NOT NULL,
	`from_where` text NOT NULL,
	`additional_notes` text,
	`eta` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_category` ON `order_items` (`category`);--> statement-breakpoint
CREATE TABLE `order_processes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`process_name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_processes_process_name_unique` ON `order_processes` (`process_name`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user` integer NOT NULL,
	`office_id` integer NOT NULL,
	`order_process_id` integer NOT NULL,
	`why_ordered` text NOT NULL,
	`status` text NOT NULL,
	`expected_arrival_at` text,
	`total_cost` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_process_id`) REFERENCES `order_processes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_orders_user` ON `orders` (`user`);--> statement-breakpoint
CREATE INDEX `idx_orders_office_id` ON `orders` (`office_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_order_process_id` ON `orders` (`order_process_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_orders_expected_arrival_at` ON `orders` (`expected_arrival_at`);--> statement-breakpoint
CREATE TABLE `receive_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`receive_id` integer NOT NULL,
	`order_item_id` integer NOT NULL,
	`quantity_received` integer NOT NULL,
	`condition_status` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`receive_id`) REFERENCES `receives`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_receive_items_receive_id` ON `receive_items` (`receive_id`);--> statement-breakpoint
CREATE INDEX `idx_receive_items_order_item_id` ON `receive_items` (`order_item_id`);--> statement-breakpoint
CREATE INDEX `idx_receive_items_condition_status` ON `receive_items` (`condition_status`);--> statement-breakpoint
CREATE TABLE `receives` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`received_by_user_id` integer NOT NULL,
	`office_id` integer NOT NULL,
	`status` text NOT NULL,
	`received_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`received_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_receives_order_id` ON `receives` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_receives_received_by_user_id` ON `receives` (`received_by_user_id`);--> statement-breakpoint
CREATE INDEX `idx_receives_office_id` ON `receives` (`office_id`);--> statement-breakpoint
CREATE INDEX `idx_receives_status` ON `receives` (`status`);--> statement-breakpoint
CREATE TABLE `storage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`storage_name` text NOT NULL,
	`storage_type` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storage_storage_name_unique` ON `storage` (`storage_name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);
