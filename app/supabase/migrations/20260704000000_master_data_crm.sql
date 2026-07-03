-- ============================================================
-- MÓDULO 1 — CADASTROS MESTRES & CRM
-- Expande sellers/buyers e cria laboratories, warehouses,
-- carriers, producer_farms, partner_contacts, partner_interactions.
-- ============================================================

-- ===== ENUMS =====
CREATE TYPE person_type AS ENUM ('pf', 'pj');
CREATE TYPE partner_kind AS ENUM ('seller', 'buyer', 'laboratory', 'warehouse', 'carrier');
CREATE TYPE interaction_type AS ENUM ('ligacao', 'email', 'reuniao', 'visita', 'whatsapp', 'nota');

-- ===== EXPANDIR SELLERS (Produtores) =====
ALTER TABLE sellers
  ADD COLUMN person_type         person_type,
  ADD COLUMN state_registration  text,       -- Inscrição Estadual
  ADD COLUMN sai_producer_code   text,       -- código produtor no SAI/ABRAPA
  ADD COLUMN address             text,
  ADD COLUMN zip_code            text,
  ADD COLUMN email               text,
  ADD COLUMN phone               text,
  ADD COLUMN is_active           boolean NOT NULL DEFAULT true,
  ADD COLUMN notes               text;

-- ===== EXPANDIR BUYERS (Compradores/Tradings) =====
ALTER TABLE buyers
  ADD COLUMN person_type  person_type,
  ADD COLUMN trader_type  text,        -- 'trading' | 'industria' | 'exportadora'
  ADD COLUMN address      text,
  ADD COLUMN email        text,
  ADD COLUMN phone        text,
  ADD COLUMN is_active    boolean NOT NULL DEFAULT true,
  ADD COLUMN notes        text;

-- ===== LABORATÓRIOS HVI =====
CREATE TABLE laboratories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  sbrhvi_code   text,                       -- credenciamento SBRHVI/ABRAPA
  city          text,
  state         text,
  email         text,
  phone         text,
  is_active     boolean NOT NULL DEFAULT true,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES profiles(id)
);
CREATE UNIQUE INDEX laboratories_name_idx ON laboratories (lower(trim(name)));

-- ===== ARMAZÉNS / UBA =====
CREATE TABLE warehouses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  sai_code       text,                      -- código UBA no SAI
  operator       text,                      -- operador logístico
  city           text,
  state          text,
  capacity_tons  decimal(12,2),
  email          text,
  phone          text,
  is_active      boolean NOT NULL DEFAULT true,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid REFERENCES profiles(id)
);
CREATE UNIQUE INDEX warehouses_name_idx ON warehouses (lower(trim(name)));

-- ===== TRANSPORTADORAS =====
CREATE TABLE carriers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  document     text,                        -- CNPJ
  modal        text,                        -- 'rodoviario' | 'ferroviario' | 'multimodal'
  city         text,
  state        text,
  email        text,
  phone        text,
  is_active    boolean NOT NULL DEFAULT true,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES profiles(id)
);
CREATE UNIQUE INDEX carriers_name_idx ON carriers (lower(trim(name)));

-- ===== FAZENDAS DO PRODUTOR =====
CREATE TABLE producer_farms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name          text NOT NULL,
  sai_farm_code text,                       -- registro da fazenda no SAI
  city          text,
  state         text,
  hectares      decimal(12,2),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES profiles(id)
);
CREATE INDEX producer_farms_seller_idx ON producer_farms (seller_id);

-- ===== CONTATOS (polimórfico) =====
CREATE TABLE partner_contacts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_kind partner_kind NOT NULL,
  partner_id   uuid NOT NULL,               -- FK lógica (validada na app)
  name         text NOT NULL,
  role         text,                        -- cargo/função
  email        text,
  phone        text,
  whatsapp     text,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES profiles(id)
);
CREATE INDEX partner_contacts_partner_idx ON partner_contacts (partner_kind, partner_id);

-- ===== CRM: TIMELINE DE INTERAÇÕES =====
CREATE TABLE partner_interactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_kind partner_kind NOT NULL,
  partner_id   uuid NOT NULL,
  type         interaction_type NOT NULL DEFAULT 'nota',
  content      text NOT NULL,
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES profiles(id)
);
CREATE INDEX partner_interactions_partner_idx
  ON partner_interactions (partner_kind, partner_id, occurred_at DESC);

-- ============================================================
-- TRIGGERS set_updated_at
-- ============================================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON laboratories   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON warehouses     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON carriers       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON producer_farms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON partner_contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- DOCUMENTS: estender entity_type para os novos cadastros
-- ============================================================
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_entity_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_entity_type_check
  CHECK (entity_type IN ('analysis', 'contract', 'agenda',
                         'seller', 'buyer', 'laboratory', 'warehouse', 'carrier'));

-- O schema inicial só definia SELECT/INSERT em documents; sem política de
-- DELETE o RLS bloqueia a remoção (0 linhas). Habilita exclusão para escrita.
DROP POLICY IF EXISTS "documents_delete" ON documents;
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (current_user_role() IN ('admin','consultor'));

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE laboratories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE producer_farms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_interactions ENABLE ROW LEVEL SECURITY;

-- Laboratories
CREATE POLICY "laboratories_select" ON laboratories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "laboratories_insert" ON laboratories FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "laboratories_update" ON laboratories FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "laboratories_delete" ON laboratories FOR DELETE USING (current_user_role() = 'admin');

-- Warehouses
CREATE POLICY "warehouses_select" ON warehouses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "warehouses_insert" ON warehouses FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "warehouses_update" ON warehouses FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "warehouses_delete" ON warehouses FOR DELETE USING (current_user_role() = 'admin');

-- Carriers
CREATE POLICY "carriers_select" ON carriers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "carriers_insert" ON carriers FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "carriers_update" ON carriers FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "carriers_delete" ON carriers FOR DELETE USING (current_user_role() = 'admin');

-- Producer farms (sub-registro operacional do produtor)
CREATE POLICY "producer_farms_select" ON producer_farms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "producer_farms_insert" ON producer_farms FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "producer_farms_update" ON producer_farms FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "producer_farms_delete" ON producer_farms FOR DELETE USING (current_user_role() IN ('admin','consultor'));

-- Partner contacts (autoria: quem criou ou admin edita/apaga)
CREATE POLICY "partner_contacts_select" ON partner_contacts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "partner_contacts_insert" ON partner_contacts FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "partner_contacts_update" ON partner_contacts FOR UPDATE USING (created_by = auth.uid() OR current_user_role() = 'admin');
CREATE POLICY "partner_contacts_delete" ON partner_contacts FOR DELETE USING (created_by = auth.uid() OR current_user_role() = 'admin');

-- Partner interactions (timeline CRM: autoria ou admin)
CREATE POLICY "partner_interactions_select" ON partner_interactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "partner_interactions_insert" ON partner_interactions FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "partner_interactions_update" ON partner_interactions FOR UPDATE USING (created_by = auth.uid() OR current_user_role() = 'admin');
CREATE POLICY "partner_interactions_delete" ON partner_interactions FOR DELETE USING (created_by = auth.uid() OR current_user_role() = 'admin');

-- ============================================================
-- STORAGE: bucket privado partner-documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "partner_documents_select" ON storage.objects;
DROP POLICY IF EXISTS "partner_documents_insert" ON storage.objects;
DROP POLICY IF EXISTS "partner_documents_delete" ON storage.objects;

CREATE POLICY "partner_documents_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'partner-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "partner_documents_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'partner-documents' AND public.current_user_role() IN ('admin','consultor'));
CREATE POLICY "partner_documents_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'partner-documents' AND public.current_user_role() IN ('admin','consultor'));
