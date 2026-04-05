CREATE TYPE call_outcome AS ENUM (
  'no_answer', 'voicemail', 'callback', 'not_interested',
  'wrong_number', 'qualified', 'do_not_call'
);

CREATE TABLE call_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  list_id BIGINT REFERENCES lists(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  direction VARCHAR(10) DEFAULT 'outbound',
  duration_seconds INTEGER,
  outcome call_outcome,
  notes TEXT,
  twilio_call_sid VARCHAR(50),
  recording_url TEXT,
  called_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_call_logs_user ON call_logs(user_id);
CREATE INDEX idx_call_logs_property ON call_logs(property_id);

CREATE TABLE sms_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  body TEXT NOT NULL,
  twilio_message_sid VARCHAR(50),
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sms_user ON sms_messages(user_id);
CREATE INDEX idx_sms_property ON sms_messages(property_id);
CREATE INDEX idx_sms_phone ON sms_messages(phone_number);
