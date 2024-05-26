SHOW DATABASES;
CREATE DATABASE lakapsagap;
SHOW DATABASES;
USE lakapsagap;

CREATE TABLE registration (
    user_regis_id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    baranggay VARCHAR(50) NOT NULL,
    password VARCHAR(64) NOT NULL, -- Password (hashed)
    phone_number VARCHAR(15) UNIQUE,
    role_designation VARCHAR(50) NOT NULL,
    organization VARCHAR(50) NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
    registration_date DATETIME,
    id_image_path VARCHAR(255)
);

CREATE TABLE tickets (
    ticket_no INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE release_request (
    request_id INT NOT NULL AUTO_INCREMENT,
    type_of_release VARCHAR(50),
    reason_of_request VARCHAR(100),
    specific_reason VARCHAR(255),
    approved_by VARCHAR(100),
    no_of_recipient INT,
    will_receive_by VARCHAR(100),
    phone_no VARCHAR(20),
    recipient_organization_type VARCHAR(100),
    barangay VARCHAR(100),
    evacuation_post_address VARCHAR(255),
    expected_date_receive DATE,
    expected_time_receive TIME,
    reason TEXT,
    uploaded_document VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    PRIMARY KEY (request_id)
);

CREATE TABLE received_stock (
    item_code INT NOT NULL AUTO_INCREMENT,
    batch_number INT NOT NULL,
    item VARCHAR(100) NOT NULL,
    item_type VARCHAR(50),
    category VARCHAR(50),
    pieces INT,
    box INT,
    floor VARCHAR(10),
    rack VARCHAR(10),
    expiry_date DATE,
    receive_type VARCHAR(20),
    plate_number VARCHAR(20),
    driver_name VARCHAR(20),
    supplier VARCHAR(50),
    date_received DATE,
    PRIMARY KEY (item_code, batch_number)
);

CREATE TABLE released_stock (
    release_id INT NOT NULL AUTO_INCREMENT,
    item_code INT NOT NULL,
    batch_number INT NOT NULL,
    item VARCHAR(100) NOT NULL,
    item_type VARCHAR(50),
    category VARCHAR(50),
    pieces INT,
    box INT,
    floor VARCHAR(10),
    rack VARCHAR(10),
    expiry_date DATE,
    release_type VARCHAR(20),
    plate_number VARCHAR(20),
    driver_name VARCHAR(20),
    supplier VARCHAR(50),
    date_released DATE,
    PRIMARY KEY (release_id)
);

DELIMITER //

CREATE TRIGGER after_stock_released
AFTER DELETE ON received_stock
FOR EACH ROW
BEGIN
    INSERT INTO released_stock (
        item_code, batch_number, item, item_type, category, pieces, box, floor, rack, expiry_date, release_type, plate_number, driver_name, supplier, date_released
    ) VALUES (
        OLD.item_code, OLD.batch_number, OLD.item, OLD.item_type, OLD.category, OLD.pieces, OLD.box, OLD.floor, OLD.rack, OLD.expiry_date, OLD.receive_type, OLD.plate_number, OLD.driver_name, OLD.supplier, NOW()
    );
END;

//

DELIMITER ;

INSERT INTO registration (firstname, lastname, email, address, baranggay, password, phone_number, role_designation, organization, gender, registration_date, id_image_path) VALUES
('John', 'Doe', 'john@example.com', '123 Main St', 'Baranggay 1', 'hashed_password1', '1234567890', 'Admin', 'ABC Company', 'Male', '2024-05-12 09:00:00', '/path/to/image1.jpg'),
('Jane', 'Smith', 'jane@example.com', '456 Elm St', 'Baranggay 2', 'hashed_password2', '0987654321', 'User', 'XYZ Organization', 'Female', '2024-05-12 09:30:00', '/path/to/image2.jpg'),
('Michael', 'Johnson', 'michael@example.com', '789 Oak St', 'Baranggay 3', 'hashed_password3', '9876543210', 'Manager', '123 Corporation', 'Male', '2024-05-12 10:00:00', '/path/to/image3.jpg');

-- Insert sample values
INSERT INTO received_stock (batch_number, item, item_type, category, pieces, box, floor, rack, expiry_date, receive_type, plate_number, driver_name, supplier, date_received)
VALUES
    (1, '3n1 Coffee', 'Coffee', 'Beverages', 2000, 20, '1', 'Rack 1', '2024-12-31', 'Local Purchase', 'ABC123', 'John Doe', 'Uncle John Corporation', '2024-03-10'),
    (1, 'Bear Brand Tipid pack', 'Milk', 'Dairy', 1500, 15, '1', 'Rack 2', '2024-12-31', 'Local Purchase', 'ABC123', 'John Doe', 'Uncle John Corporation', '2024-03-10'),
    (1, 'Corned Beef', 'Canned Goods', 'Meat', 500, 5, '', 'Rack 2', '2024-12-31', 'Local Purchase', 'ABC123', 'John Doe', 'Uncle John Corporation', '2024-03-10'),
    (1, 'Meat Loaf', 'Canned Goods', 'Meat', 300, 3, '2', 'Rack 1', '2024-12-31', 'Local Purchase', 'ABC123', 'John Doe', 'Uncle John Corporation', '2024-03-10'),
    (1, 'San Marino', 'Canned Goods', 'Fish', 300, 3, '2', 'Rack 1', '2024-12-31', 'Local Purchase', 'ABC123', 'John Doe', 'Uncle John Corporation', '2024-03-10');

