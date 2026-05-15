-- Stage 7: Analytics functions

-- ─── Revenue chart (fills empty days with 0) ─────────────────────────────────

CREATE OR REPLACE FUNCTION get_revenue_chart(p_days int DEFAULT 30)
RETURNS TABLE(day date, revenue_cents bigint, order_count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH series AS (
    SELECT generate_series(
      (now() - ((p_days - 1) || ' days')::interval)::date,
      now()::date,
      '1 day'::interval
    )::date AS day
  )
  SELECT
    s.day,
    COALESCE(SUM(o.total), 0)::bigint        AS revenue_cents,
    COUNT(o.id)::bigint                        AS order_count
  FROM series s
  LEFT JOIN orders o
    ON o.created_at::date = s.day
   AND o.status NOT IN ('cancelled', 'refunded')
  GROUP BY s.day
  ORDER BY s.day;
$$;

-- ─── Top products by revenue ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_top_products(p_limit int DEFAULT 6)
RETURNS TABLE(product_name text, revenue_cents bigint, units_sold bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    oi.product_name,
    SUM(oi.unit_price * oi.quantity)::bigint AS revenue_cents,
    SUM(oi.quantity)::bigint                  AS units_sold
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status NOT IN ('cancelled', 'refunded')
  GROUP BY oi.product_name
  ORDER BY revenue_cents DESC
  LIMIT p_limit;
$$;

-- ─── Revenue by region ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_revenue_by_region(p_limit int DEFAULT 10)
RETURNS TABLE(region text, revenue_cents bigint, order_count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    COALESCE(shipping_address->>'region', 'Unknown') AS region,
    SUM(total)::bigint                                AS revenue_cents,
    COUNT(*)::bigint                                  AS order_count
  FROM orders
  WHERE status NOT IN ('cancelled', 'refunded')
  GROUP BY 1
  ORDER BY revenue_cents DESC
  LIMIT p_limit;
$$;

-- ─── Conversion summary (for analytics overview) ─────────────────────────────

CREATE OR REPLACE FUNCTION get_conversion_summary()
RETURNS TABLE(
  total_orders        bigint,
  total_revenue_cents bigint,
  avg_order_cents     bigint,
  orders_with_discount bigint,
  orders_with_affiliate bigint,
  discount_savings_cents bigint
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    COUNT(*)::bigint                                   AS total_orders,
    SUM(total)::bigint                                 AS total_revenue_cents,
    (SUM(total) / NULLIF(COUNT(*), 0))::bigint         AS avg_order_cents,
    COUNT(*) FILTER (WHERE discount_code IS NOT NULL)::bigint  AS orders_with_discount,
    COUNT(*) FILTER (WHERE affiliate_code IS NOT NULL)::bigint AS orders_with_affiliate,
    SUM(discount_amount_cents)::bigint                 AS discount_savings_cents
  FROM orders
  WHERE status NOT IN ('cancelled', 'refunded');
$$;
