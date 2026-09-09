CREATE SCHEMA IF NOT EXISTS foodme;

CREATE SEQUENCE foodme.chef_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.dish_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.dish_tag_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.chef_tag_order_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.address_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.order_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.order_dish_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE foodme.admin_id_seq START WITH 1 INCREMENT BY 1;
-- mints numbers FM-1000xx
CREATE SEQUENCE foodme.order_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE foodme.chef (
    id BIGINT NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(64),
    email VARCHAR(255),
    avatar_url VARCHAR(512),
    banner_url VARCHAR(512),
    status VARCHAR(32) NOT NULL,
    full_name_en VARCHAR(255),
    full_name_am VARCHAR(255),
    full_name_ru VARCHAR(255),
    description_en VARCHAR(2000),
    description_am VARCHAR(2000),
    description_ru VARCHAR(2000),
    kitchen_en VARCHAR(255),
    kitchen_am VARCHAR(255),
    kitchen_ru VARCHAR(255),
    rating DOUBLE PRECISION,
    platform_fee DOUBLE PRECISION,
    delivery_price DOUBLE PRECISION,
    free_delivery_from DOUBLE PRECISION,
    priority_index INTEGER
);

CREATE TABLE foodme.dish_tag (
    id BIGINT NOT NULL PRIMARY KEY,
    name_en VARCHAR(255),
    name_am VARCHAR(255),
    name_ru VARCHAR(255)
);

CREATE TABLE foodme.dish (
    id BIGINT NOT NULL PRIMARY KEY,
    name_en VARCHAR(255),
    name_am VARCHAR(255),
    name_ru VARCHAR(255),
    description_en VARCHAR(1000),
    price DOUBLE PRECISION NOT NULL,
    url VARCHAR(512),
    portion_en VARCHAR(255),
    portion_am VARCHAR(255),
    portion_ru VARCHAR(255),
    status VARCHAR(32) NOT NULL,
    minimum_order_count INTEGER NOT NULL DEFAULT 1,
    priority_index INTEGER,
    chef_id BIGINT NOT NULL REFERENCES foodme.chef(id),
    dish_tag_id BIGINT REFERENCES foodme.dish_tag(id)
);

CREATE TABLE foodme.chef_tag_order (
    id BIGINT NOT NULL PRIMARY KEY,
    chef_id BIGINT NOT NULL REFERENCES foodme.chef(id),
    dish_tag_id BIGINT NOT NULL REFERENCES foodme.dish_tag(id),
    priority_index INTEGER
);

CREATE TABLE foodme.address (
    id BIGINT NOT NULL PRIMARY KEY,
    city VARCHAR(255),
    street VARCHAR(255),
    building VARCHAR(64),
    apartment VARCHAR(64),
    note VARCHAR(512)
);

CREATE TABLE foodme."order" (
    id BIGINT NOT NULL PRIMARY KEY,
    number VARCHAR(32) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL,
    address_id BIGINT REFERENCES foodme.address(id),
    receiver_name VARCHAR(255),
    receiver_phone_number VARCHAR(64),
    receiver_email VARCHAR(255),
    total_price DOUBLE PRECISION,
    delivery_price DOUBLE PRECISION,
    note VARCHAR(2000),
    reject_reason VARCHAR(512),
    payment_type VARCHAR(32),
    delivery_method VARCHAR(32),
    created_at TIMESTAMP NOT NULL,
    chef_id BIGINT NOT NULL REFERENCES foodme.chef(id)
);

CREATE TABLE foodme.order_dish (
    id BIGINT NOT NULL PRIMARY KEY,
    name_en VARCHAR(255),
    name_am VARCHAR(255),
    name_ru VARCHAR(255),
    price DOUBLE PRECISION,
    url VARCHAR(512),
    quantity INTEGER NOT NULL,
    order_id BIGINT NOT NULL REFERENCES foodme."order"(id),
    dish_id BIGINT REFERENCES foodme.dish(id)
);

CREATE TABLE foodme.admin (
    id BIGINT NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL
);

CREATE INDEX idx_dish_chef_id ON foodme.dish(chef_id);
CREATE INDEX idx_dish_dish_tag_id ON foodme.dish(dish_tag_id);
CREATE INDEX idx_order_chef_id ON foodme."order"(chef_id);
CREATE INDEX idx_order_dish_order_id ON foodme.order_dish(order_id);
CREATE INDEX idx_chef_tag_order_chef_id ON foodme.chef_tag_order(chef_id);
