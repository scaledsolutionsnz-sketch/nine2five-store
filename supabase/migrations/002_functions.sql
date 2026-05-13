-- Decrement stock (called from webhook after successful payment)
create or replace function decrement_stock(p_variant_id uuid, p_quantity int)
returns void language plpgsql security definer as $$
begin
  update product_variants
  set stock_quantity = greatest(0, stock_quantity - p_quantity)
  where id = p_variant_id;
end;
$$;
