CREATE TABLE IF NOT EXISTS gold.dim_date (
  date_key integer PRIMARY KEY,
  full_date date NOT NULL UNIQUE,
  year integer NOT NULL,
  quarter integer NOT NULL,
  month integer NOT NULL,
  week integer NOT NULL,
  day_of_week integer NOT NULL
);

CREATE TABLE IF NOT EXISTS gold.dim_customer (
  customer_key integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id text NOT NULL UNIQUE,
  customer_unique_id text,
  state text,
  city text
);

CREATE TABLE IF NOT EXISTS gold.dim_product (
  product_key integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id text NOT NULL UNIQUE,
  category text
);

CREATE TABLE IF NOT EXISTS gold.dim_order (
  order_key integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id text NOT NULL UNIQUE,
  status text NOT NULL,
  order_purchase_timestamp timestamp NOT NULL,
  order_approved_at timestamp,
  delivered_customer_date timestamp,
  estimated_delivery_date timestamp
);

CREATE TABLE IF NOT EXISTS gold.fact_sales (
  order_id text NOT NULL,
  order_item_id integer NOT NULL,
  date_key integer NOT NULL REFERENCES gold.dim_date(date_key),
  customer_key integer NOT NULL REFERENCES gold.dim_customer(customer_key),
  product_key integer NOT NULL REFERENCES gold.dim_product(product_key),
  order_key integer NOT NULL REFERENCES gold.dim_order(order_key),
  item_price numeric(14, 2) NOT NULL,
  freight_value numeric(14, 2) NOT NULL,
  payment_value_allocated numeric(14, 2) NOT NULL,
  is_delivered boolean NOT NULL,
  is_canceled boolean NOT NULL,
  is_on_time boolean NOT NULL,
  PRIMARY KEY (order_id, order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_fact_sales_date_key ON gold.fact_sales(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_customer_key ON gold.fact_sales(customer_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_product_key ON gold.fact_sales(product_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_order_key ON gold.fact_sales(order_key);
