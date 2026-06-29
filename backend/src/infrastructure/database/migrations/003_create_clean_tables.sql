CREATE TABLE IF NOT EXISTS clean.orders (
  order_id text PRIMARY KEY,
  customer_id text NOT NULL,
  order_status text NOT NULL,
  order_purchase_timestamp timestamp NOT NULL,
  order_approved_at timestamp,
  order_delivered_customer_date timestamp,
  order_estimated_delivery_date timestamp
);

CREATE TABLE IF NOT EXISTS clean.order_items (
  order_id text NOT NULL,
  order_item_id integer NOT NULL,
  product_id text NOT NULL,
  item_price numeric(14, 2) NOT NULL,
  freight_value numeric(14, 2) NOT NULL,
  PRIMARY KEY (order_id, order_item_id)
);

CREATE TABLE IF NOT EXISTS clean.order_payments (
  order_id text NOT NULL,
  payment_sequential integer NOT NULL,
  payment_type text NOT NULL,
  payment_value numeric(14, 2) NOT NULL,
  PRIMARY KEY (order_id, payment_sequential)
);

CREATE TABLE IF NOT EXISTS clean.customers (
  customer_id text PRIMARY KEY,
  customer_unique_id text,
  city text,
  state text
);

CREATE TABLE IF NOT EXISTS clean.products (
  product_id text PRIMARY KEY,
  category text
);

CREATE TABLE IF NOT EXISTS clean.order_reviews (
  review_id text PRIMARY KEY,
  order_id text NOT NULL,
  review_score integer,
  review_comment_title text,
  review_comment_message text,
  review_creation_date timestamp,
  review_answer_timestamp timestamp
);

CREATE TABLE IF NOT EXISTS clean.sellers (
  seller_id text PRIMARY KEY,
  seller_zip_code_prefix text,
  seller_city text,
  seller_state text
);

CREATE TABLE IF NOT EXISTS clean.geolocation (
  geolocation_zip_code_prefix text PRIMARY KEY,
  geolocation_lat numeric(10, 6),
  geolocation_lng numeric(10, 6),
  geolocation_city text,
  geolocation_state text
);
