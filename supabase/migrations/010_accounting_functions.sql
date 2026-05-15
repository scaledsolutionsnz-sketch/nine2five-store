-- Stage 8: Accounting functions

-- ─── Monthly revenue summary (last N months) ─────────────────────────────────

CREATE OR REPLACE FUNCTION get_monthly_revenue(p_months int DEFAULT 12)
RETURNS TABLE(
  month         date,
  revenue_cents bigint,
  order_count   bigint,
  refund_cents  bigint,
  discount_cents bigint
)
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH months AS (
    SELECT date_trunc('month', now() - (n || ' months')::interval)::date AS month
    FROM generate_series(0, p_months - 1) AS n
  )
  SELECT
    m.month,
    COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','refunded') THEN o.total     ELSE 0 END), 0)::bigint AS revenue_cents,
    COUNT(     CASE WHEN o.status NOT IN ('cancelled','refunded') THEN 1            END)::bigint             AS order_count,
    COALESCE(SUM(CASE WHEN o.status = 'refunded'                  THEN o.total     ELSE 0 END), 0)::bigint AS refund_cents,
    COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','refunded') THEN o.discount_amount_cents ELSE 0 END), 0)::bigint AS discount_cents
  FROM months m
  LEFT JOIN orders o ON date_trunc('month', o.created_at)::date = m.month
  GROUP BY m.month
  ORDER BY m.month DESC;
$$;

-- ─── GST report for a date range ─────────────────────────────────────────────
-- NZ GST is 15% (tax-inclusive). GST portion = total × 3/23

CREATE OR REPLACE FUNCTION get_gst_report(p_from date, p_to date)
RETURNS TABLE(
  total_sales_cents     bigint,
  gst_collected_cents   bigint,
  ex_gst_sales_cents    bigint,
  refund_total_cents    bigint,
  gst_on_refunds_cents  bigint,
  net_gst_payable_cents bigint,
  order_count           bigint
)
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH period AS (
    SELECT
      COALESCE(SUM(CASE WHEN status NOT IN ('cancelled','refunded') THEN total ELSE 0 END), 0) AS sales,
      COALESCE(SUM(CASE WHEN status = 'refunded'                   THEN total ELSE 0 END), 0) AS refunds,
      COUNT(   CASE WHEN status NOT IN ('cancelled','refunded')     THEN 1    END)             AS orders
    FROM orders
    WHERE created_at::date BETWEEN p_from AND p_to
  )
  SELECT
    sales::bigint,
    (sales * 3 / 23)::bigint,
    (sales * 20 / 23)::bigint,
    refunds::bigint,
    (refunds * 3 / 23)::bigint,
    ((sales - refunds) * 3 / 23)::bigint,
    orders::bigint
  FROM period;
$$;
