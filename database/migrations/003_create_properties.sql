CREATE TYPE property_type AS ENUM (
  'single_family', 'multi_family', 'condo', 'townhouse',
  'manufactured', 'land', 'commercial', 'apartment', 'other'
);

CREATE TYPE foreclosure_status AS ENUM (
  'none', 'pre_foreclosure', 'auction', 'bank_owned', 'reo'
);

CREATE TABLE properties (
  id BIGSERIAL PRIMARY KEY,
  attom_id VARCHAR(50) UNIQUE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  county VARCHAR(100),
  fips VARCHAR(10),
  apn VARCHAR(50),
  location geography(Point, 4326),
  lot_size_sqft INTEGER,
  building_sqft INTEGER,
  bedrooms SMALLINT,
  bathrooms NUMERIC(3,1),
  year_built SMALLINT,
  property_type property_type DEFAULT 'single_family',
  estimated_value INTEGER,
  assessed_value INTEGER,
  tax_amount NUMERIC(10,2),
  tax_year SMALLINT,
  owner_occupied BOOLEAN DEFAULT true,
  vacant BOOLEAN DEFAULT false,
  condition_score SMALLINT,
  last_sale_date DATE,
  last_sale_price INTEGER,
  equity_percent NUMERIC(5,2),
  mortgage_amount INTEGER,
  mortgage_date DATE,
  mortgage_rate NUMERIC(5,3),
  lender_name VARCHAR(255),
  foreclosure_status foreclosure_status DEFAULT 'none',
  years_owned NUMERIC(5,1),
  absentee_owner BOOLEAN DEFAULT false,
  corporate_owned BOOLEAN DEFAULT false,
  tax_delinquent BOOLEAN DEFAULT false,
  raw_attom_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_properties_zip ON properties(zip);
CREATE INDEX idx_properties_state_city ON properties(state, city);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_value ON properties(estimated_value);
CREATE INDEX idx_properties_foreclosure ON properties(foreclosure_status) WHERE foreclosure_status != 'none';
CREATE INDEX idx_properties_address ON properties USING gin(address_line1 gin_trgm_ops);

CREATE TABLE owners (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255),
  entity_name VARCHAR(255),
  entity_type VARCHAR(50) DEFAULT 'individual',
  mailing_address VARCHAR(255),
  mailing_city VARCHAR(100),
  mailing_state VARCHAR(2),
  mailing_zip VARCHAR(10),
  ownership_percent NUMERIC(5,2),
  vesting_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owners_property ON owners(property_id);
CREATE INDEX idx_owners_name ON owners USING gin(full_name gin_trgm_ops);
