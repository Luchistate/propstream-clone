CREATE TYPE lead_status AS ENUM (
  'new', 'contacted', 'callback', 'qualified', 'not_interested', 'closed', 'dead'
);

CREATE TABLE lists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  list_type VARCHAR(20) DEFAULT 'static',
  filter_criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON lists(user_id);

CREATE TABLE list_items (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  lead_status lead_status DEFAULT 'new',
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, property_id)
);

CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_list_items_status ON list_items(list_id, lead_status);
