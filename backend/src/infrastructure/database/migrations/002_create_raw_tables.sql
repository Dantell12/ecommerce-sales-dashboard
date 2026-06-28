CREATE TABLE IF NOT EXISTS raw.orders (
  order_id text,
  customer_id text,
  order_status text,
  order_purchase_timestamp timestamp,
  order_approved_at timestamp,
  order_delivered_carrier_date timestamp,
  order_delivered_customer_date timestamp,
  order_estimated_delivery_date timestamp
);

CREATE TABLE IF NOT EXISTS raw.order_items (
  order_id text,
  order_item_id integer,
  product_id text,
  seller_id text,
  shipping_limit_date timestamp,
  price numeric(14, 2),
  freight_value numeric(14, 2)
);

CREATE TABLE IF NOT EXISTS raw.order_payments (
  order_id text,
  payment_sequential integer,
  payment_type text,
  payment_installments integer,
  payment_value numeric(14, 2)
);

CREATE TABLE IF NOT EXISTS raw.customers (
  customer_id text,
  customer_unique_id text,
  customer_zip_code_prefix text,
  customer_city text,
  customer_state text
);

CREATE TABLE IF NOT EXISTS raw.products (
  product_id text,
  product_category_name text,
  product_name_lenght integer,
  product_description_lenght integer,
  product_photos_qty integer,
  product_weight_g integer,
  product_length_cm integer,
  product_height_cm integer,
  product_width_cm integer
);

CREATE TABLE IF NOT EXISTS raw.product_category_name_translation (
  product_category_name text,
  product_category_name_english text
);
