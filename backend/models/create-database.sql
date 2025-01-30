-- SQL Schema for EventHive Project

-- Table: Users

-- Table: Clients
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    age INT CHECK (age >= 0),
    role INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Events
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_description TEXT,
    event_date TIMESTAMP NOT NULL,
    venue VARCHAR(100) NOT NULL,
    salesperson_id INT REFERENCES clients(client_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Seat Categories
CREATE TABLE seat_categories (
    category_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    category_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_seats INT NOT NULL,
    -- available_seats INT NOT NULL
);
-- Table for indivual seat within the category 
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,        
    category_id INT REFERENCES seat_categories(category_id) ON DELETE CASCADE,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    is_booked BOOLEAN DEFAULT FALSE  
);

-- Table: Tickets
CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    user_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
    seat_category_id INT REFERENCES seat_categories(category_id) ON DELETE CASCADE,
    seat_id INT REFERENCES seats(seat_id) ON DELETE CASCADE,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    uploaded_photo_url TEXT NOT NULL,
    payment_intent_id TEXT NOT NULL,
    is_canceled BOOLEAN DEFAULT FALSE,

    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Memories
CREATE TABLE memories (
    memory_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    uploaded_media_url TEXT NOT NULL,
    media_type VARCHAR(10) CHECK (media_type IN ('photo', 'video')) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- promo codes
CREATE TABLE promo_codes (
    promo_code_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, 
    discount_value NUMERIC(10, 2) NOT NULL, 
    max_usage INT DEFAULT NULL,
    user_limit INT DEFAULT 1, 
    is_active BOOLEAN DEFAULT TRUE, 
    start_date TIMESTAMP DEFAULT NOW(), 
    end_date TIMESTAMP DEFAULT NULL 
);
-- track user using promo codes
CREATE TABLE user_promo_code_usage (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
    promo_code_id INT REFERENCES promo_codes(promo_code_id) ON DELETE CASCADE,
    times_used INT DEFAULT 0
);


--  qr code scanning
ALTER TABLE tickets ADD COLUMN scanned BOOLEAN DEFAULT FALSE;

-- Constraints and Additional Relationships
-- Ensure unique tickets per user for an event
ALTER TABLE tickets ADD CONSTRAINT unique_user_ticket UNIQUE (event_id, user_id);

ALTER TABLE seat_categories ADD CONSTRAINT available_seats_check CHECK (available_seats <= total_seats);
ALTER TABLE events
ADD COLUMN salesperson_id INT REFERENCES salesperson(salesperson_id) ON DELETE SET NULL;


