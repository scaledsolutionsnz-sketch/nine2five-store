-- Stage 6: Advanced inventory — stock movements, adjustments, PO receiving

-- ─── Atomic stock adjustment + movement log ───────────────────────────────────

CREATE OR REPLACE FUNCTION adjust_stock(
  p_variant_id  uuid,
  p_delta       int,      -- positive = add, negative = remove
  p_type        text,     -- restock | damaged | returned | adjustment
  p_note        text    DEFAULT NULL,
  p_created_by  text    DEFAULT NULL
) RETURNS int             -- returns new stock_quantity
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_qty int;
BEGIN
  UPDATE product_variants
  SET stock_quantity = GREATEST(0, stock_quantity + p_delta)
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO new_qty;

  INSERT INTO stock_movements(variant_id, type, quantity, note, created_by)
  VALUES (p_variant_id, p_type, p_delta, p_note, p_created_by);

  RETURN new_qty;
END;
$$;

-- ─── Receive a purchase order (bulk restock) ──────────────────────────────────

CREATE OR REPLACE FUNCTION receive_purchase_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT variant_id, quantity_ordered AS qty
    FROM purchase_order_items
    WHERE purchase_order_id = p_order_id
  LOOP
    UPDATE product_variants
    SET stock_quantity = stock_quantity + item.qty
    WHERE id = item.variant_id;

    INSERT INTO stock_movements(variant_id, type, quantity, reference_id, note)
    VALUES (item.variant_id, 'restock', item.qty, p_order_id::text, 'Purchase order received');

    UPDATE purchase_order_items
    SET quantity_received = quantity_ordered
    WHERE purchase_order_id = p_order_id AND variant_id = item.variant_id;
  END LOOP;

  UPDATE purchase_orders
  SET status = 'received', received_at = now()
  WHERE id = p_order_id;
END;
$$;

-- ─── Low stock view ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW low_stock_view AS
SELECT
  pv.id         AS variant_id,
  pv.size,
  pv.stock_quantity,
  p.id          AS product_id,
  p.name        AS product_name,
  p.slug        AS product_slug
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity < 10
  AND p.active = true
ORDER BY pv.stock_quantity ASC, p.name;
