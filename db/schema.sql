-- Run this once in your Neon (or Supabase) SQL editor.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  region VARCHAR(100),
  role VARCHAR(10) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','staff')),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  reset_token_hash CHAR(64),
  reset_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fund_sources (
  id SERIAL PRIMARY KEY,
  fund_year SMALLINT NOT NULL UNIQUE,
  fund_source VARCHAR(150) NOT NULL DEFAULT 'RCEF',
  amount NUMERIC(16,2),
  notes TEXT,
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fund_sources(fund_year)
SELECT y FROM generate_series(2019, 2031) AS y
ON CONFLICT (fund_year) DO NOTHING;

CREATE TABLE IF NOT EXISTS machinery (
  id SERIAL PRIMARY KEY,
  fca VARCHAR(180),
  machinery_type VARCHAR(100) NOT NULL DEFAULT 'Other',
  fund_year SMALLINT REFERENCES fund_sources(fund_year) ON DELETE SET NULL ON UPDATE CASCADE,
  region VARCHAR(100) NOT NULL,
  province VARCHAR(100),
  municipality VARCHAR(100),
  date_provided DATE,
  quantity INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'Functional'
    CHECK (status IN ('Functional','Operational','Non-Operational')),
  last_update DATE NOT NULL,
  remarks TEXT,
  created_by INT NOT NULL REFERENCES users(id),
  updated_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_machinery_region ON machinery(region);
CREATE INDEX IF NOT EXISTS idx_machinery_status ON machinery(status);
CREATE INDEX IF NOT EXISTS idx_machinery_year ON machinery(fund_year);

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  machinery_id INT REFERENCES machinery(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fca_documents (
  id SERIAL PRIMARY KEY,
  fca_name VARCHAR(180) NOT NULL,
  region VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  fund_source VARCHAR(50),
  eval SMALLINT NOT NULL DEFAULT 0,
  val SMALLINT NOT NULL DEFAULT 0,
  letter SMALLINT NOT NULL DEFAULT 0,
  board SMALLINT NOT NULL DEFAULT 0,
  certacc SMALLINT NOT NULL DEFAULT 0,
  members SMALLINT NOT NULL DEFAULT 0,
  mach SMALLINT NOT NULL DEFAULT 0,
  certreg SMALLINT NOT NULL DEFAULT 0,
  remarks TEXT,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fca_name, province)
);
CREATE INDEX IF NOT EXISTS idx_fca_region ON fca_documents(region);
CREATE INDEX IF NOT EXISTS idx_fca_province ON fca_documents(province);

CREATE TABLE IF NOT EXISTS fca_checklists (
  fca_id INT PRIMARY KEY REFERENCES fca_documents(id) ON DELETE CASCADE,
  moa_target SMALLINT NOT NULL DEFAULT 0,
  moa_signed SMALLINT NOT NULL DEFAULT 0,
  moa_transmitted SMALLINT NOT NULL DEFAULT 0,
  moa_received SMALLINT NOT NULL DEFAULT 0,
  moa_distributed SMALLINT NOT NULL DEFAULT 0,
  cod_target SMALLINT NOT NULL DEFAULT 0,
  cod_signed SMALLINT NOT NULL DEFAULT 0,
  cod_transmitted SMALLINT NOT NULL DEFAULT 0,
  cod_received SMALLINT NOT NULL DEFAULT 0,
  cod_distributed SMALLINT NOT NULL DEFAULT 0,
  dod_target SMALLINT NOT NULL DEFAULT 0,
  dod_signed SMALLINT NOT NULL DEFAULT 0,
  dod_transmitted SMALLINT NOT NULL DEFAULT 0,
  dod_received SMALLINT NOT NULL DEFAULT 0,
  dod_distributed SMALLINT NOT NULL DEFAULT 0,
  mem_target SMALLINT NOT NULL DEFAULT 0,
  mem_uploaded SMALLINT NOT NULL DEFAULT 0,
  updated_by INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
