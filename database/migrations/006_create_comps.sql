CREATE TABLE comps (
  id BIGSERIAL PRIMARY KEY,
  subject_property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  comp_property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  distance_meters NUMERIC(10,2),
  similarity_score NUMERIC(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_property_id, comp_property_id)
);

CREATE INDEX idx_comps_subject ON comps(subject_property_id);
