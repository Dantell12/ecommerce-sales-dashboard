TRUNCATE clean.order_payments, clean.order_items, clean.orders, clean.customers, clean.products, clean.order_reviews, clean.sellers, clean.geolocation RESTART IDENTITY CASCADE;
TRUNCATE gold.fact_sales, gold.dim_order, gold.dim_product, gold.dim_customer, gold.dim_date RESTART IDENTITY CASCADE;

INSERT INTO clean.orders (
  order_id,
  customer_id,
  order_status,
  order_purchase_timestamp,
  order_approved_at,
  order_delivered_customer_date,
  order_estimated_delivery_date
)
SELECT DISTINCT
  order_id,
  customer_id,
  LOWER(TRIM(order_status)),
  order_purchase_timestamp,
  order_approved_at,
  order_delivered_customer_date,
  order_estimated_delivery_date
FROM raw.orders
WHERE order_id IS NOT NULL
  AND customer_id IS NOT NULL
  AND order_purchase_timestamp IS NOT NULL;

INSERT INTO clean.order_items (order_id, order_item_id, product_id, item_price, freight_value)
SELECT DISTINCT
  order_id,
  order_item_id,
  product_id,
  COALESCE(price, 0),
  COALESCE(freight_value, 0)
FROM raw.order_items
WHERE order_id IS NOT NULL
  AND order_item_id IS NOT NULL
  AND product_id IS NOT NULL;

INSERT INTO clean.order_payments (order_id, payment_sequential, payment_type, payment_value)
SELECT DISTINCT
  order_id,
  payment_sequential,
  LOWER(TRIM(payment_type)),
  COALESCE(payment_value, 0)
FROM raw.order_payments
WHERE order_id IS NOT NULL
  AND payment_sequential IS NOT NULL;

INSERT INTO clean.customers (customer_id, customer_unique_id, city, state)
SELECT DISTINCT
  customer_id,
  customer_unique_id,
  LOWER(TRIM(customer_city)),
  UPPER(TRIM(customer_state))
FROM raw.customers
WHERE customer_id IS NOT NULL;

INSERT INTO clean.products (product_id, category)
SELECT DISTINCT ON (p.product_id)
  p.product_id,
  COALESCE(t.product_category_name_english, p.product_category_name, 'unknown')
FROM raw.products p
LEFT JOIN raw.product_category_name_translation t
  ON t.product_category_name = p.product_category_name
WHERE p.product_id IS NOT NULL
ORDER BY p.product_id;

INSERT INTO clean.order_reviews (
  review_id,
  order_id,
  review_score,
  review_comment_title,
  review_comment_message,
  review_creation_date,
  review_answer_timestamp
)
SELECT DISTINCT
  review_id,
  order_id,
  review_score,
  review_comment_title,
  review_comment_message,
  review_creation_date,
  review_answer_timestamp
FROM raw.order_reviews
WHERE review_id IS NOT NULL
  AND order_id IS NOT NULL;

INSERT INTO clean.sellers (seller_id, seller_zip_code_prefix, seller_city, seller_state)
SELECT DISTINCT
  seller_id,
  seller_zip_code_prefix,
  seller_city,
  seller_state
FROM raw.sellers
WHERE seller_id IS NOT NULL;

INSERT INTO clean.geolocation (
  geolocation_zip_code_prefix,
  geolocation_lat,
  geolocation_lng,
  geolocation_city,
  geolocation_state
)
SELECT DISTINCT ON (geolocation_zip_code_prefix)
  geolocation_zip_code_prefix,
  geolocation_lat,
  geolocation_lng,
  geolocation_city,
  geolocation_state
FROM raw.geolocation
WHERE geolocation_zip_code_prefix IS NOT NULL
ORDER BY geolocation_zip_code_prefix;

WITH date_bounds AS (
  SELECT
    MIN(order_purchase_timestamp)::date AS min_date,
    MAX(COALESCE(order_estimated_delivery_date, order_purchase_timestamp))::date AS max_date
  FROM clean.orders
),
calendar AS (
  SELECT generate_series(min_date, max_date, INTERVAL '1 day')::date AS full_date
  FROM date_bounds
  WHERE min_date IS NOT NULL AND max_date IS NOT NULL
)
INSERT INTO gold.dim_date (date_key, full_date, year, quarter, month, week, day_of_week)
SELECT
  TO_CHAR(full_date, 'YYYYMMDD')::integer,
  full_date,
  EXTRACT(YEAR FROM full_date)::integer,
  EXTRACT(QUARTER FROM full_date)::integer,
  EXTRACT(MONTH FROM full_date)::integer,
  EXTRACT(WEEK FROM full_date)::integer,
  EXTRACT(ISODOW FROM full_date)::integer
FROM calendar;

INSERT INTO gold.dim_customer (customer_id, customer_unique_id, state, city)
SELECT customer_id, customer_unique_id, state, city
FROM clean.customers;

INSERT INTO gold.dim_product (product_id, category)
SELECT product_id, category
FROM clean.products;

INSERT INTO gold.dim_order (
  order_id,
  status,
  order_purchase_timestamp,
  order_approved_at,
  delivered_customer_date,
  estimated_delivery_date
)
SELECT
  order_id,
  order_status,
  order_purchase_timestamp,
  order_approved_at,
  order_delivered_customer_date,
  order_estimated_delivery_date
FROM clean.orders;

WITH payment_by_order AS (
  SELECT order_id, SUM(payment_value) AS total_payment
  FROM clean.order_payments
  GROUP BY order_id
),
items_ranked AS (
  SELECT
    oi.order_id,
    oi.order_item_id,
    oi.product_id,
    oi.item_price,
    oi.freight_value,
    ROW_NUMBER() OVER (PARTITION BY oi.order_id ORDER BY oi.order_item_id) AS rn,
    COUNT(*) OVER (PARTITION BY oi.order_id) AS item_count,
    COALESCE(pbo.total_payment, 0) AS total_payment
  FROM clean.order_items oi
  LEFT JOIN payment_by_order pbo ON pbo.order_id = oi.order_id
)
INSERT INTO gold.fact_sales (
  order_id,
  order_item_id,
  date_key,
  customer_key,
  product_key,
  order_key,
  item_price,
  freight_value,
  payment_value_allocated,
  is_delivered,
  is_canceled,
  is_on_time
)
SELECT
  oi.order_id,
  oi.order_item_id,
  TO_CHAR(o.order_purchase_timestamp::date, 'YYYYMMDD')::integer AS date_key,
  dc.customer_key,
  dp.product_key,
  dor.order_key,
  oi.item_price,
  oi.freight_value,
  CASE
    WHEN oi.rn < oi.item_count THEN ROUND(oi.total_payment / oi.item_count, 2)
    ELSE oi.total_payment - ROUND(oi.total_payment / oi.item_count, 2) * (oi.item_count - 1)
  END AS payment_value_allocated,
  o.order_status = 'delivered' AND o.order_delivered_customer_date IS NOT NULL AS is_delivered,
  o.order_status = 'canceled' AS is_canceled,
  o.order_status = 'delivered'
    AND o.order_delivered_customer_date IS NOT NULL
    AND o.order_estimated_delivery_date IS NOT NULL
    AND o.order_delivered_customer_date <= o.order_estimated_delivery_date AS is_on_time
FROM items_ranked oi
JOIN clean.orders o ON o.order_id = oi.order_id
JOIN gold.dim_customer dc ON dc.customer_id = o.customer_id
JOIN gold.dim_product dp ON dp.product_id = oi.product_id
JOIN gold.dim_order dor ON dor.order_id = o.order_id
