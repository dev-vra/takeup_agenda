-- ============================================================
-- LAFERLINS — AGENDA TAKEUP — Schema Supabase/PostgreSQL
-- ============================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'consultor', 'leitor');
CREATE TYPE analysis_status AS ENUM (
  'aguardando_hvi',
  'aguardando_aprovacao_hvi',
  'hvi_aprovado',
  'analise_interrompida',
  'takeup_agendado',
  'takeup_reagendado',
  'takeup_finalizado',
  'takeup_cancelado',
  'finalizada'
);
CREATE TYPE installment_status AS ENUM ('pendente', 'em_andamento', 'concluida', 'atrasada');
CREATE TYPE agenda_entry_type AS ENUM ('analise', 'takeup', 'entrega', 'outro');
CREATE TYPE agenda_entry_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE notification_type AS ENUM (
  'alerta_prazo', 'hvi_pendente', 'takeup_pendente', 'takeup_atrasado', 'parcela_vencendo', 'geral'
);
CREATE TYPE report_type AS ENUM (
  'contrato', 'analise', 'parcela', 'conjunto_analises', 'personalizado'
);
CREATE TYPE responsible_type AS ENUM ('hvi', 'takeup', 'geral');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL,
  role        user_role NOT NULL DEFAULT 'leitor',
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'leitor')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SELLERS (Produtores/Vendedores)
-- ============================================================
CREATE TABLE sellers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  document    text,
  city        text,
  state       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX sellers_name_idx ON sellers (lower(trim(name)));

-- ============================================================
-- BUYERS (Compradores)
-- ============================================================
CREATE TABLE buyers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  document    text,
  city        text,
  state       text,
  country     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX buyers_name_idx ON buyers (lower(trim(name)));

-- ============================================================
-- CONTRACTS
-- ============================================================
CREATE TABLE contracts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number   text NOT NULL UNIQUE,
  reference         text,
  seller_id         uuid NOT NULL REFERENCES sellers(id),
  buyer_id          uuid NOT NULL REFERENCES buyers(id),
  total_quantity    decimal(12,4) NOT NULL DEFAULT 0,
  origin            text,
  currency          text,
  indexation        text,
  price             decimal(12,6),
  price_unit        text,
  terms             text,
  quality_spec      text,
  contract_subtype  text,
  responsible       text,
  observation       text,
  total_takeup      decimal(12,4) DEFAULT 0,
  balance_pending   decimal(12,4) DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid REFERENCES profiles(id),
  search_vector     tsvector
);

-- Full-text search trigger for contracts
CREATE OR REPLACE FUNCTION contracts_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(NEW.contract_number, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.reference, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.origin, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.observation, '')), 'D');
  RETURN NEW;
END;
$$;

CREATE TRIGGER contracts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION contracts_search_vector_update();

CREATE INDEX contracts_search_idx ON contracts USING GIN (search_vector);

-- ============================================================
-- CONTRACT INSTALLMENTS (Parcelas)
-- ============================================================
CREATE TABLE contract_installments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id         uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  reference_month     date NOT NULL,
  scheduled_quantity  decimal(12,4) NOT NULL DEFAULT 0,
  delivered_quantity  decimal(12,4) NOT NULL DEFAULT 0,
  remaining_quantity  decimal(12,4) GENERATED ALWAYS AS (scheduled_quantity - delivered_quantity) STORED,
  due_date            date,
  status              installment_status NOT NULL DEFAULT 'pendente',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, reference_month)
);

CREATE INDEX installments_contract_idx ON contract_installments (contract_id);
CREATE INDEX installments_due_date_idx ON contract_installments (due_date);
CREATE INDEX installments_status_idx ON contract_installments (status);

-- ============================================================
-- CONTRACT TAKEUP MONTHLY (TakeUp realizado por mês)
-- ============================================================
CREATE TABLE contract_takeup_monthly (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id      uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  reference_month  date NOT NULL,
  takeup_quantity  decimal(12,4) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, reference_month)
);

-- ============================================================
-- ANALYSES
-- ============================================================
CREATE TABLE analyses (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id             uuid NOT NULL REFERENCES contracts(id),
  installment_id          uuid NOT NULL REFERENCES contract_installments(id),
  status                  analysis_status NOT NULL DEFAULT 'aguardando_hvi',
  -- HVI
  hvi_file_url            text,
  hvi_file_name           text,
  hvi_received_date       date,
  hvi_responsible         text,
  hvi_approved            boolean,
  hvi_approval_date       date,
  hvi_rejection_reason    text,
  hvi_observation         text,
  -- TakeUp
  takeup_scheduled_date   date,
  takeup_responsible      text,
  takeup_actual_date      date,
  takeup_file_url         text,
  takeup_file_name        text,
  takeup_cancel_reason    text,
  takeup_cancel_file_url  text,
  takeup_reschedule_count int NOT NULL DEFAULT 0,
  -- Finalização
  report_delivery_date    date,
  report_file_url         text,
  report_file_name        text,
  approved_tons           decimal(12,4),
  final_observation       text,
  -- Audit
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  created_by              uuid REFERENCES profiles(id),
  search_vector           tsvector
);

CREATE INDEX analyses_contract_idx ON analyses (contract_id);
CREATE INDEX analyses_installment_idx ON analyses (installment_id);
CREATE INDEX analyses_status_idx ON analyses (status);
CREATE INDEX analyses_hvi_date_idx ON analyses (hvi_received_date);
CREATE INDEX analyses_takeup_date_idx ON analyses (takeup_scheduled_date);
CREATE INDEX analyses_search_idx ON analyses USING GIN (search_vector);

-- Full-text trigger for analyses (joins contract/seller/buyer info at insert)
CREATE OR REPLACE FUNCTION analyses_search_vector_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(NEW.hvi_responsible, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.takeup_responsible, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.hvi_observation, '')), 'D') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.final_observation, '')), 'D');
  RETURN NEW;
END;
$$;

CREATE TRIGGER analyses_search_vector_trigger
  BEFORE INSERT OR UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION analyses_search_vector_update();

-- Abate de toneladas na parcela ao finalizar análise
CREATE OR REPLACE FUNCTION update_installment_on_analysis_complete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'finalizada' AND NEW.approved_tons IS NOT NULL AND
     (OLD.status IS DISTINCT FROM 'finalizada' OR OLD.approved_tons IS DISTINCT FROM NEW.approved_tons) THEN
    UPDATE contract_installments
    SET delivered_quantity = delivered_quantity + NEW.approved_tons,
        updated_at = now()
    WHERE id = NEW.installment_id;

    -- Atualiza total_takeup e balance_pending do contrato
    UPDATE contracts
    SET total_takeup = (
          SELECT COALESCE(SUM(approved_tons), 0) FROM analyses
          WHERE contract_id = NEW.contract_id AND status = 'finalizada'
        ),
        balance_pending = total_quantity - (
          SELECT COALESCE(SUM(approved_tons), 0) FROM analyses
          WHERE contract_id = NEW.contract_id AND status = 'finalizada'
        ),
        updated_at = now()
    WHERE id = NEW.contract_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER analyses_complete_trigger
  AFTER UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_installment_on_analysis_complete();

-- ============================================================
-- TAKEUP RESCHEDULES
-- ============================================================
CREATE TABLE takeup_reschedules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id    uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  previous_date  date NOT NULL,
  new_date       date NOT NULL,
  reason         text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid REFERENCES profiles(id)
);

-- ============================================================
-- ANALYSIS COMMENTS
-- ============================================================
CREATE TABLE analysis_comments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id      uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  content          text NOT NULL,
  attachment_url   text,
  attachment_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid REFERENCES profiles(id)
);

CREATE INDEX analysis_comments_analysis_idx ON analysis_comments (analysis_id);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text NOT NULL CHECK (entity_type IN ('analysis', 'contract', 'agenda')),
  entity_id    uuid NOT NULL,
  file_url     text NOT NULL,
  file_name    text NOT NULL,
  file_type    text,
  file_size    int,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES profiles(id)
);

CREATE INDEX documents_entity_idx ON documents (entity_type, entity_id);

-- ============================================================
-- AGENDA ENTRIES
-- ============================================================
CREATE TABLE agenda_entries (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  description           text,
  entry_type            agenda_entry_type NOT NULL DEFAULT 'outro',
  scheduled_date        date NOT NULL,
  scheduled_time        time,
  status                agenda_entry_status NOT NULL DEFAULT 'pendente',
  related_analysis_id   uuid REFERENCES analyses(id),
  related_contract_id   uuid REFERENCES contracts(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES profiles(id)
);

CREATE INDEX agenda_entries_date_idx ON agenda_entries (scheduled_date);
CREATE INDEX agenda_entries_status_idx ON agenda_entries (status);

-- ============================================================
-- AGENDA COMMENTS
-- ============================================================
CREATE TABLE agenda_comments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_entry_id   uuid NOT NULL REFERENCES agenda_entries(id) ON DELETE CASCADE,
  content           text NOT NULL,
  attachment_url    text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid REFERENCES profiles(id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  message               text NOT NULL,
  type                  notification_type NOT NULL DEFAULT 'geral',
  related_entity_type   text,
  related_entity_id     uuid,
  is_read               boolean NOT NULL DEFAULT false,
  email_sent            boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx ON notifications (user_id, is_read, created_at DESC);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   text NOT NULL,
  report_type             report_type NOT NULL,
  content                 text,
  file_url                text,
  related_contract_id     uuid REFERENCES contracts(id),
  related_analysis_ids    uuid[],
  related_installment_id  uuid REFERENCES contract_installments(id),
  user_prompt             text,
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  created_by              uuid REFERENCES profiles(id)
);

CREATE INDEX reports_contract_idx ON reports (related_contract_id);
CREATE INDEX reports_active_idx ON reports (is_active, created_at DESC);

-- ============================================================
-- KNOWN RESPONSIBLES (autocomplete dinâmico)
-- ============================================================
CREATE TABLE known_responsibles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        responsible_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, type)
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id),
  action       audit_action NOT NULL,
  entity_type  text NOT NULL,
  entity_id    uuid NOT NULL,
  old_values   jsonb,
  new_values   jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_entity_idx ON audit_log (entity_type, entity_id);
CREATE INDEX audit_log_user_idx ON audit_log (user_id, created_at DESC);

-- ============================================================
-- UPDATED_AT trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contract_installments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON analysis_comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agenda_entries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_takeup_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeup_reschedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_responsibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Profiles: todos lêem o próprio, admin lê todos
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR current_user_role() = 'admin'
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  id = auth.uid() OR current_user_role() = 'admin'
);

-- Sellers/Buyers: todos leem, consultor/admin escrevem
CREATE POLICY "sellers_select" ON sellers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sellers_insert" ON sellers FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "sellers_update" ON sellers FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "sellers_delete" ON sellers FOR DELETE USING (current_user_role() = 'admin');

CREATE POLICY "buyers_select" ON buyers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "buyers_insert" ON buyers FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "buyers_update" ON buyers FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "buyers_delete" ON buyers FOR DELETE USING (current_user_role() = 'admin');

-- Contracts: todos leem, consultor/admin escrevem, só admin deleta
CREATE POLICY "contracts_select" ON contracts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "contracts_insert" ON contracts FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "contracts_update" ON contracts FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "contracts_delete" ON contracts FOR DELETE USING (current_user_role() = 'admin');

-- Installments
CREATE POLICY "installments_select" ON contract_installments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "installments_insert" ON contract_installments FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "installments_update" ON contract_installments FOR UPDATE USING (current_user_role() IN ('admin','consultor'));

-- TakeUp Monthly
CREATE POLICY "takeup_monthly_select" ON contract_takeup_monthly FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "takeup_monthly_insert" ON contract_takeup_monthly FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "takeup_monthly_update" ON contract_takeup_monthly FOR UPDATE USING (current_user_role() IN ('admin','consultor'));

-- Analyses
CREATE POLICY "analyses_select" ON analyses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "analyses_insert" ON analyses FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "analyses_update" ON analyses FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "analyses_delete" ON analyses FOR DELETE USING (current_user_role() = 'admin');

-- Reschedules/Comments/Documents: todos leem, consultor/admin escrevem
CREATE POLICY "reschedules_select" ON takeup_reschedules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reschedules_insert" ON takeup_reschedules FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));

CREATE POLICY "comments_select" ON analysis_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "comments_insert" ON analysis_comments FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "comments_update" ON analysis_comments FOR UPDATE USING (created_by = auth.uid() OR current_user_role() = 'admin');
CREATE POLICY "comments_delete" ON analysis_comments FOR DELETE USING (created_by = auth.uid() OR current_user_role() = 'admin');

CREATE POLICY "documents_select" ON documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));

-- Agenda
CREATE POLICY "agenda_select" ON agenda_entries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "agenda_insert" ON agenda_entries FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "agenda_update" ON agenda_entries FOR UPDATE USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "agenda_delete" ON agenda_entries FOR DELETE USING (current_user_role() IN ('admin','consultor'));

CREATE POLICY "agenda_comments_select" ON agenda_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "agenda_comments_insert" ON agenda_comments FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));

-- Notifications: cada usuário vê apenas as suas
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Reports
CREATE POLICY "reports_select" ON reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));
CREATE POLICY "reports_update" ON reports FOR UPDATE USING (current_user_role() IN ('admin','consultor'));

-- Known Responsibles
CREATE POLICY "responsibles_select" ON known_responsibles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "responsibles_insert" ON known_responsibles FOR INSERT WITH CHECK (current_user_role() IN ('admin','consultor'));

-- Audit Log
CREATE POLICY "audit_select" ON audit_log FOR SELECT USING (current_user_role() IN ('admin','consultor'));
CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or API)
-- ============================================================
-- Bucket: hvi-files (private)
-- Bucket: takeup-files (private)
-- Bucket: report-files (private)
-- Bucket: comment-attachments (private)
-- Bucket: agenda-attachments (private)
