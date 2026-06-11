-- ============================================================
-- SETUP COMPLETO — Projeto Supabase "takeup" (org dev-vra)
-- Idempotente: pode rodar mais de uma vez sem quebrar.
-- Cole tudo no SQL Editor e clique em Run.
-- ============================================================

-- ─── 1) ENUMS ───────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'consultor', 'leitor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE analysis_status AS ENUM (
  'aguardando_hvi','aguardando_aprovacao_hvi','hvi_aprovado','analise_interrompida',
  'takeup_agendado','takeup_reagendado','takeup_finalizado','takeup_cancelado','finalizada'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE installment_status AS ENUM ('pendente', 'em_andamento', 'concluida', 'atrasada'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE agenda_entry_type AS ENUM ('analise', 'takeup', 'entrega', 'outro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE agenda_entry_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('alerta_prazo','hvi_pendente','takeup_pendente','takeup_atrasado','parcela_vencendo','geral'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_type AS ENUM ('contrato','analise','parcela','conjunto_analises','personalizado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE responsible_type AS ENUM ('hvi', 'takeup', 'geral'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2) FUNÇÕES utilitárias ─────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ─── 3) TABELAS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL, email text NOT NULL,
  role user_role NOT NULL DEFAULT 'leitor', avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, document text, city text, state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sellers_name_idx ON sellers (lower(trim(name)));

CREATE TABLE IF NOT EXISTS buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, document text, city text, state text, country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS buyers_name_idx ON buyers (lower(trim(name)));

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number text NOT NULL UNIQUE, reference text,
  seller_id uuid NOT NULL REFERENCES sellers(id),
  buyer_id uuid NOT NULL REFERENCES buyers(id),
  total_quantity decimal(12,4) NOT NULL DEFAULT 0,
  origin text, currency text, indexation text,
  price decimal(12,6), price_unit text, terms text,
  quality_spec text, contract_subtype text, responsible text, observation text,
  total_takeup decimal(12,4) DEFAULT 0, balance_pending decimal(12,4) DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  search_vector tsvector
);

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
DROP TRIGGER IF EXISTS contracts_search_vector_trigger ON contracts;
CREATE TRIGGER contracts_search_vector_trigger BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION contracts_search_vector_update();
CREATE INDEX IF NOT EXISTS contracts_search_idx ON contracts USING GIN (search_vector);

CREATE TABLE IF NOT EXISTS contract_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  scheduled_quantity decimal(12,4) NOT NULL DEFAULT 0,
  delivered_quantity decimal(12,4) NOT NULL DEFAULT 0,
  remaining_quantity decimal(12,4) GENERATED ALWAYS AS (scheduled_quantity - delivered_quantity) STORED,
  due_date date, status installment_status NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, reference_month)
);
CREATE INDEX IF NOT EXISTS installments_contract_idx ON contract_installments (contract_id);
CREATE INDEX IF NOT EXISTS installments_due_date_idx ON contract_installments (due_date);
CREATE INDEX IF NOT EXISTS installments_status_idx ON contract_installments (status);

CREATE TABLE IF NOT EXISTS contract_takeup_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  takeup_quantity decimal(12,4) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, reference_month)
);

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id),
  installment_id uuid NOT NULL REFERENCES contract_installments(id),
  status analysis_status NOT NULL DEFAULT 'aguardando_hvi',
  hvi_file_url text, hvi_file_name text, hvi_received_date date,
  hvi_responsible text, hvi_approved boolean, hvi_approval_date date,
  hvi_rejection_reason text, hvi_observation text,
  takeup_scheduled_date date, takeup_responsible text, takeup_actual_date date,
  takeup_file_url text, takeup_file_name text, takeup_cancel_reason text,
  takeup_cancel_file_url text, takeup_reschedule_count int NOT NULL DEFAULT 0,
  report_delivery_date date, report_file_url text, report_file_name text,
  approved_tons decimal(12,4), final_observation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  search_vector tsvector
);
CREATE INDEX IF NOT EXISTS analyses_contract_idx ON analyses (contract_id);
CREATE INDEX IF NOT EXISTS analyses_installment_idx ON analyses (installment_id);
CREATE INDEX IF NOT EXISTS analyses_status_idx ON analyses (status);
CREATE INDEX IF NOT EXISTS analyses_hvi_date_idx ON analyses (hvi_received_date);
CREATE INDEX IF NOT EXISTS analyses_takeup_date_idx ON analyses (takeup_scheduled_date);
CREATE INDEX IF NOT EXISTS analyses_search_idx ON analyses USING GIN (search_vector);

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
DROP TRIGGER IF EXISTS analyses_search_vector_trigger ON analyses;
CREATE TRIGGER analyses_search_vector_trigger BEFORE INSERT OR UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION analyses_search_vector_update();

CREATE OR REPLACE FUNCTION update_installment_on_analysis_complete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'finalizada' AND NEW.approved_tons IS NOT NULL AND
     (OLD.status IS DISTINCT FROM 'finalizada' OR OLD.approved_tons IS DISTINCT FROM NEW.approved_tons) THEN
    UPDATE contract_installments
    SET delivered_quantity = delivered_quantity + NEW.approved_tons, updated_at = now()
    WHERE id = NEW.installment_id;
    UPDATE contracts
    SET total_takeup = (SELECT COALESCE(SUM(approved_tons), 0) FROM analyses WHERE contract_id = NEW.contract_id AND status = 'finalizada'),
        balance_pending = total_quantity - (SELECT COALESCE(SUM(approved_tons), 0) FROM analyses WHERE contract_id = NEW.contract_id AND status = 'finalizada'),
        updated_at = now()
    WHERE id = NEW.contract_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS analyses_complete_trigger ON analyses;
CREATE TRIGGER analyses_complete_trigger AFTER UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_installment_on_analysis_complete();

CREATE TABLE IF NOT EXISTS takeup_reschedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  previous_date date NOT NULL, new_date date NOT NULL, reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS analysis_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  content text NOT NULL, attachment_url text, attachment_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS analysis_comments_analysis_idx ON analysis_comments (analysis_id);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('analysis', 'contract', 'agenda')),
  entity_id uuid NOT NULL, file_url text NOT NULL, file_name text NOT NULL,
  file_type text, file_size int,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS documents_entity_idx ON documents (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS agenda_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text,
  entry_type agenda_entry_type NOT NULL DEFAULT 'outro',
  scheduled_date date NOT NULL, scheduled_time time,
  status agenda_entry_status NOT NULL DEFAULT 'pendente',
  related_analysis_id uuid REFERENCES analyses(id),
  related_contract_id uuid REFERENCES contracts(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS agenda_entries_date_idx ON agenda_entries (scheduled_date);
CREATE INDEX IF NOT EXISTS agenda_entries_status_idx ON agenda_entries (status);

CREATE TABLE IF NOT EXISTS agenda_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_entry_id uuid NOT NULL REFERENCES agenda_entries(id) ON DELETE CASCADE,
  content text NOT NULL, attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL, message text NOT NULL,
  type notification_type NOT NULL DEFAULT 'geral',
  related_entity_type text, related_entity_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, report_type report_type NOT NULL,
  content text, file_url text,
  related_contract_id uuid REFERENCES contracts(id),
  related_analysis_ids uuid[],
  related_installment_id uuid REFERENCES contract_installments(id),
  user_prompt text, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS reports_contract_idx ON reports (related_contract_id);
CREATE INDEX IF NOT EXISTS reports_active_idx ON reports (is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS known_responsibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, type responsible_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, type)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action audit_action NOT NULL,
  entity_type text NOT NULL, entity_id uuid NOT NULL,
  old_values jsonb, new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_log_user_idx ON audit_log (user_id, created_at DESC);

-- Builder de Relatórios
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, description text,
  config jsonb NOT NULL DEFAULT '{}',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS report_templates_user_idx ON report_templates (created_by, created_at DESC);

-- ─── 4) TRIGGERS updated_at ─────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','sellers','buyers','contracts','contract_installments',
                               'analyses','analysis_comments','agenda_entries','reports','report_templates'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;

-- ─── 5) RLS ─────────────────────────────────────────────────
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
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Policies (recriadas de forma segura)
DO $$
DECLARE
  pol RECORD;
  defs text[][] := ARRAY[
    ARRAY['profiles_select','profiles','SELECT','USING (id = auth.uid() OR current_user_role() = ''admin'')'],
    ARRAY['profiles_update','profiles','UPDATE','USING (id = auth.uid() OR current_user_role() = ''admin'')'],
    ARRAY['sellers_select','sellers','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['sellers_insert','sellers','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['sellers_update','sellers','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['sellers_delete','sellers','DELETE','USING (current_user_role() = ''admin'')'],
    ARRAY['buyers_select','buyers','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['buyers_insert','buyers','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['buyers_update','buyers','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['buyers_delete','buyers','DELETE','USING (current_user_role() = ''admin'')'],
    ARRAY['contracts_select','contracts','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['contracts_insert','contracts','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['contracts_update','contracts','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['contracts_delete','contracts','DELETE','USING (current_user_role() = ''admin'')'],
    ARRAY['installments_select','contract_installments','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['installments_insert','contract_installments','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['installments_update','contract_installments','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['takeup_monthly_select','contract_takeup_monthly','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['takeup_monthly_insert','contract_takeup_monthly','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['takeup_monthly_update','contract_takeup_monthly','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['analyses_select','analyses','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['analyses_insert','analyses','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['analyses_update','analyses','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['analyses_delete','analyses','DELETE','USING (current_user_role() = ''admin'')'],
    ARRAY['reschedules_select','takeup_reschedules','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['reschedules_insert','takeup_reschedules','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['comments_select','analysis_comments','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['comments_insert','analysis_comments','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['comments_update','analysis_comments','UPDATE','USING (created_by = auth.uid() OR current_user_role() = ''admin'')'],
    ARRAY['comments_delete','analysis_comments','DELETE','USING (created_by = auth.uid() OR current_user_role() = ''admin'')'],
    ARRAY['documents_select','documents','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['documents_insert','documents','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['agenda_select','agenda_entries','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['agenda_insert','agenda_entries','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['agenda_update','agenda_entries','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['agenda_delete','agenda_entries','DELETE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['agenda_comments_select','agenda_comments','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['agenda_comments_insert','agenda_comments','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['notifications_select','notifications','SELECT','USING (user_id = auth.uid())'],
    ARRAY['notifications_update','notifications','UPDATE','USING (user_id = auth.uid())'],
    ARRAY['reports_select','reports','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['reports_insert','reports','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['reports_update','reports','UPDATE','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['responsibles_select','known_responsibles','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['responsibles_insert','known_responsibles','INSERT','WITH CHECK (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['audit_select','audit_log','SELECT','USING (current_user_role() IN (''admin'',''consultor''))'],
    ARRAY['audit_insert','audit_log','INSERT','WITH CHECK (auth.uid() IS NOT NULL)'],
    ARRAY['templates_select','report_templates','SELECT','USING (auth.uid() IS NOT NULL)'],
    ARRAY['templates_insert','report_templates','INSERT','WITH CHECK (auth.uid() IS NOT NULL)'],
    ARRAY['templates_update','report_templates','UPDATE','USING (created_by = auth.uid() OR current_user_role() = ''admin'')'],
    ARRAY['templates_delete','report_templates','DELETE','USING (created_by = auth.uid() OR current_user_role() = ''admin'')']
  ];
  d text[];
BEGIN
  FOREACH d SLICE 1 IN ARRAY defs LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', d[1], d[2]);
    EXECUTE format('CREATE POLICY %I ON %I FOR %s %s', d[1], d[2], d[3], d[4]);
  END LOOP;
END $$;

-- ─── 6) USUÁRIO ADMIN (admin@admin.com / aQ!@#456) ──────────
DO $$
DECLARE uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@admin.com';
  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid, 'authenticated', 'authenticated', 'admin@admin.com',
      crypt('aQ!@#456', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administrador","role":"admin"}',
      now(), now(), '', '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('aQ!@#456', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = uid;
  END IF;

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (uid, 'Administrador', 'admin@admin.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Administrador';
END $$;

-- ─── 7) VERIFICAÇÃO ─────────────────────────────────────────
SELECT p.email, p.role,
       (u.encrypted_password = crypt('aQ!@#456', u.encrypted_password)) AS senha_ok
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email = 'admin@admin.com';
