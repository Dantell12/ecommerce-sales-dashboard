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
