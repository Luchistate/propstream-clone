CREATE TABLE skip_trace_results (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id BIGINT REFERENCES owners(id) ON DELETE SET NULL,
  phone_numbers JSONB DEFAULT '[]',
  email_addresses JSONB DEFAULT '[]',
  provider VARCHAR(50),
  confidence_score NUMERIC(3,2),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skip_trace_property ON skip_trace_results(property_id);
