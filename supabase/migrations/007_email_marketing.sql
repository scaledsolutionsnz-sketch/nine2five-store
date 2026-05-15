-- Stage 5: Email marketing — segments, open/click tracking, abandoned cart

-- ─── Extend email_campaigns ──────────────────────────────────────────────────

ALTER TABLE email_campaigns
  ADD COLUMN IF NOT EXISTS segment       text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS opens         int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks        int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_at  timestamptz;

-- ─── Email events ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email        text NOT NULL,
  event_type   text NOT NULL,          -- 'open' | 'click'
  url          text,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_events_campaign_idx ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS email_events_email_idx    ON email_events(email);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
-- Only service role can read/write events
CREATE POLICY "service_role_only" ON email_events USING (false);

-- ─── Record event + increment counter (deduped per campaign+email+type) ───────

CREATE OR REPLACE FUNCTION record_email_event(
  p_campaign_id  uuid,
  p_email        text,
  p_event_type   text,   -- 'open' | 'click'
  p_url          text DEFAULT NULL,
  p_ip           text DEFAULT NULL,
  p_ua           text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  already_counted boolean;
BEGIN
  -- Only count first occurrence per campaign+email+type to avoid repeat inflations
  SELECT EXISTS (
    SELECT 1 FROM email_events
    WHERE campaign_id = p_campaign_id AND email = p_email AND event_type = p_event_type
  ) INTO already_counted;

  INSERT INTO email_events(campaign_id, email, event_type, url, ip_address, user_agent)
  VALUES (p_campaign_id, p_email, p_event_type, p_url, p_ip, p_ua);

  IF NOT already_counted THEN
    IF p_event_type = 'open' THEN
      UPDATE email_campaigns SET opens = opens + 1 WHERE id = p_campaign_id;
    ELSIF p_event_type = 'click' THEN
      UPDATE email_campaigns SET clicks = clicks + 1 WHERE id = p_campaign_id;
    END IF;
  END IF;
END;
$$;

-- ─── Abandoned cart helper ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_abandoned_carts()
RETURNS TABLE(
  id           uuid,
  session_id   text,
  email        text,
  items        jsonb,
  created_at   timestamptz
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    cs.id,
    cs.session_id,
    cs.email,
    cs.items::jsonb,
    cs.created_at
  FROM cart_sessions cs
  WHERE cs.email IS NOT NULL
    AND cs.converted_at IS NULL
    AND cs.recovery_sent_at IS NULL
    AND cs.updated_at < now() - interval '1 hour'
    AND cs.expires_at > now()
  ORDER BY cs.updated_at DESC
  LIMIT 50;
$$;

-- Mark cart recovery as sent
CREATE OR REPLACE FUNCTION mark_cart_recovery_sent(p_session_id text)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE cart_sessions
  SET recovery_sent_at = now()
  WHERE session_id = p_session_id;
$$;
