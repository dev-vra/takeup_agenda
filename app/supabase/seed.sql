-- ================================================================
-- SEED - Agenda TakeUp - Ambiente Local
-- Gerado com dados reais da planilha Laferlins
-- Data referencia: 2026-05-22 | Login: gabriela@laferlins.com.br / senha123
-- ================================================================

-- AUTH USER: Gabriela
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES (
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'gabriela@laferlins.com.br',
  crypt('senha123', gen_salt('bf')),
  now(), now(), now(),
  '{"name": "Gabriela Laferlins", "role": "admin"}'::jsonb,
  false, '', '', '', ''
);
UPDATE profiles SET name = 'Gabriela Laferlins', role = 'admin' WHERE id = '00000000-0000-0000-0000-000000000001';

-- SELLERS
INSERT INTO sellers (id, name, city, state) VALUES
  ('10000000-0000-0000-0000-000000000001', 'BOM FUTURO AGRICOLA LTDA', 'Sorriso', 'MT'),
  ('10000000-0000-0000-0000-000000000002', 'AGROPECUARIA CAVALCA MT LTDA', 'Sorriso', 'MT'),
  ('10000000-0000-0000-0000-000000000003', 'DANIELLE TIRONI ROMAGNOLI E OUTRO', 'Sorriso', 'MT'),
  ('10000000-0000-0000-0000-000000000004', 'WILSON ROMAGNOLI E OUTRO', 'Sorriso', 'MT');

-- BUYERS
INSERT INTO buyers (id, name, country) VALUES
  ('20000000-0000-0000-0000-000000000001', 'OLAM GLOBAL AGRI PTE LTD', 'Singapura'),
  ('20000000-0000-0000-0000-000000000002', 'ADM INTERNATIONAL SARL', 'Suica'),
  ('20000000-0000-0000-0000-000000000003', 'ADM DO BRASIL LTDA (SP)', 'Brasil'),
  ('20000000-0000-0000-0000-000000000004', 'PAUL REINHART AG.', 'Suica'),
  ('20000000-0000-0000-0000-000000000005', 'VITERRA AGRICULTURE BRASIL S.A.', 'Brasil'),
  ('20000000-0000-0000-0000-000000000006', 'VITERRA BRASIL S.A.', 'Brasil'),
  ('20000000-0000-0000-0000-000000000007', 'ADM DO BRASIL LTDA', 'Brasil');

-- CONTRACTS (22 contratos reais)
INSERT INTO contracts (id, contract_number, reference, seller_id, buyer_id, total_quantity, origin, currency, indexation, price, price_unit, terms, quality_spec, contract_subtype, responsible, created_by) VALUES
  ('30000000-0000-0000-0001-000000000000', 'AG-26367/10', '23P07345', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2000.0, 'MT-BRASIL', 'US$', 'FIXO', 0.84, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Diogo', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0002-000000000000', 'AG-26368/10', '23P07346', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 3000.0, 'MT-BRASIL', 'US$', 'FIXADO', 0.7446, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Diogo', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0003-000000000000', 'AG-26424/10', '210/10320440', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 2000.0, 'MT-BRASIL', 'US$', 'FIXO', 0.815, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0004-000000000000', 'AG-26426/10', '1223P50004C', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 1000.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (150 ON)', 0.725, 'Libra', 'CIP', '2.5/40.0/28.0/34.0/81.0', 'Exportacao Indireta', 'Raiane', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0005-000000000000', 'AG-26657/10', '23/P/09172', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 5000.0, 'MT-BRASIL', 'US$', 'FIXO', 0.835, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Diogo', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0006-000000000000', 'AG-26769/10', '210/10323050', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 3000.0, 'MT-BRASIL', 'US$', 'FIXO', 0.82, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0007-000000000000', 'AG-26821/10', '210/10324851', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 300.0, 'MT-BRASIL', 'US$', 'FIXO', 0.7365, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0008-000000000000', 'AG-26822/10', '210/10324850', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 300.0, 'MT-BRASIL', 'US$', 'FIXO', 0.7365, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0009-000000000000', 'AG-27148/10', 'P017.417', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 5000.0, 'MT-BRASIL', 'US$', 'FIXADO', 0.7482, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Alice e Amanda', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0010-000000000000', 'AG-27154/10', '23/P/11164', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 3000.0, 'MT-BRASIL', 'US$', 'FIXADO', 0.7329, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Diogo', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0011-000000000000', 'AG-27519/10', '210/10339100', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 5000.0, 'MT-BRASIL', 'US$', 'FIXO', 0.745, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0012-000000000000', 'AG-27573/10', '210/10341600', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 1500.0, 'MT-BRASIL', 'US$', 'FIXO', 0.81, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0013-000000000000', 'AG-27624/10', 'P017.521', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 5000.0, 'MT-BRASIL', 'US$', 'FIXADO', 0.7375, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Alice e Amanda', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0014-000000000000', 'AG-27629/10', '210/10343140', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 5000.0, 'MT-BRASIL', 'US$', 'FIXO', 0.8025, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0015-000000000000', 'AG-27631/10', '210/10343150', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 5000.0, 'MT-BRASIL', 'US$', 'NYF DEC/2025 (150 ON)', NULL, 'Libra', 'FOB', '2.5/40.0/28.0/34.0/81.0', 'Exportacao', 'Drielle', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0016-000000000000', 'AG-27661/10', 'VTSA01312/25', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (50 OFF) FIXADO', 0.618, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raphaela', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0017-000000000000', 'AG-27662/10', 'VTSA01313/25', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (50 OFF) FIXADO', 0.6514, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raphaela', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0018-000000000000', 'AG-27664/10', 'VTSA01314/25', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (50 OFF) FIXADO', 0.6514, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raphaela', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0019-000000000000', 'AG-27665/10', 'VTSA01315/25', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (50 OFF) FIXADO', 0.618, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raphaela', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0020-000000000000', 'AG-27666/10', '1331P50044C', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (250 OFF)', NULL, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raiane', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0021-000000000000', 'AG-27667/10', '1331P50045C', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (250 OFF)', NULL, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raiane', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0022-000000000000', 'AG-27668/10', '1331P50046C', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 500.0, 'MT-BRASIL', 'R$', 'NYF DEC/2025 (250 OFF)', NULL, 'Libra', 'FCA', '2.5/40.0/28.0/34.0/81.0', 'Domestico', 'Raiane', '00000000-0000-0000-0000-000000000001');

-- INSTALLMENTS
INSERT INTO contract_installments (id, contract_id, reference_month, scheduled_quantity, due_date, status) VALUES
  ('40000000-0000-0000-0001-000000000000', '30000000-0000-0000-0001-000000000000', '2025-09-01', 500, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0002-000000000000', '30000000-0000-0000-0001-000000000000', '2025-10-01', 500, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0003-000000000000', '30000000-0000-0000-0001-000000000000', '2025-11-01', 500, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0004-000000000000', '30000000-0000-0000-0001-000000000000', '2025-12-01', 500, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0005-000000000000', '30000000-0000-0000-0002-000000000000', '2025-09-01', 750, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0006-000000000000', '30000000-0000-0000-0002-000000000000', '2025-10-01', 750, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0007-000000000000', '30000000-0000-0000-0002-000000000000', '2025-11-01', 750, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0008-000000000000', '30000000-0000-0000-0002-000000000000', '2025-12-01', 750, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0009-000000000000', '30000000-0000-0000-0003-000000000000', '2025-08-01', 400, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0010-000000000000', '30000000-0000-0000-0003-000000000000', '2025-09-01', 400, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0011-000000000000', '30000000-0000-0000-0003-000000000000', '2025-10-01', 400, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0012-000000000000', '30000000-0000-0000-0003-000000000000', '2025-11-01', 400, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0013-000000000000', '30000000-0000-0000-0003-000000000000', '2025-12-01', 400, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0014-000000000000', '30000000-0000-0000-0004-000000000000', '2025-08-01', 200, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0015-000000000000', '30000000-0000-0000-0004-000000000000', '2025-09-01', 200, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0016-000000000000', '30000000-0000-0000-0004-000000000000', '2025-10-01', 200, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0017-000000000000', '30000000-0000-0000-0004-000000000000', '2025-11-01', 200, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0018-000000000000', '30000000-0000-0000-0004-000000000000', '2025-12-01', 200, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0019-000000000000', '30000000-0000-0000-0005-000000000000', '2025-09-01', 1250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0020-000000000000', '30000000-0000-0000-0005-000000000000', '2025-10-01', 1250, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0021-000000000000', '30000000-0000-0000-0005-000000000000', '2025-11-01', 1250, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0022-000000000000', '30000000-0000-0000-0005-000000000000', '2025-12-01', 1250, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0023-000000000000', '30000000-0000-0000-0006-000000000000', '2025-08-01', 600, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0024-000000000000', '30000000-0000-0000-0006-000000000000', '2025-09-01', 600, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0025-000000000000', '30000000-0000-0000-0006-000000000000', '2025-10-01', 600, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0026-000000000000', '30000000-0000-0000-0006-000000000000', '2025-11-01', 600, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0027-000000000000', '30000000-0000-0000-0006-000000000000', '2025-12-01', 600, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0028-000000000000', '30000000-0000-0000-0007-000000000000', '2025-11-01', 150, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0029-000000000000', '30000000-0000-0000-0007-000000000000', '2025-12-01', 150, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0030-000000000000', '30000000-0000-0000-0008-000000000000', '2025-11-01', 150, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0031-000000000000', '30000000-0000-0000-0008-000000000000', '2025-12-01', 150, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0032-000000000000', '30000000-0000-0000-0009-000000000000', '2025-08-01', 1000, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0033-000000000000', '30000000-0000-0000-0009-000000000000', '2025-09-01', 1000, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0034-000000000000', '30000000-0000-0000-0009-000000000000', '2025-10-01', 1000, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0035-000000000000', '30000000-0000-0000-0009-000000000000', '2025-11-01', 1000, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0036-000000000000', '30000000-0000-0000-0009-000000000000', '2025-12-01', 1000, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0037-000000000000', '30000000-0000-0000-0010-000000000000', '2025-08-01', 600, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0038-000000000000', '30000000-0000-0000-0010-000000000000', '2025-09-01', 600, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0039-000000000000', '30000000-0000-0000-0010-000000000000', '2025-10-01', 600, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0040-000000000000', '30000000-0000-0000-0010-000000000000', '2025-11-01', 600, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0041-000000000000', '30000000-0000-0000-0010-000000000000', '2025-12-01', 600, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0042-000000000000', '30000000-0000-0000-0011-000000000000', '2025-08-01', 1666, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0043-000000000000', '30000000-0000-0000-0011-000000000000', '2025-09-01', 1667, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0044-000000000000', '30000000-0000-0000-0011-000000000000', '2025-10-01', 1667, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0045-000000000000', '30000000-0000-0000-0012-000000000000', '2025-08-01', 500, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0046-000000000000', '30000000-0000-0000-0012-000000000000', '2025-09-01', 500, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0047-000000000000', '30000000-0000-0000-0012-000000000000', '2025-10-01', 500, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0048-000000000000', '30000000-0000-0000-0013-000000000000', '2025-08-01', 1000, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0049-000000000000', '30000000-0000-0000-0013-000000000000', '2025-09-01', 1000, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0050-000000000000', '30000000-0000-0000-0013-000000000000', '2025-10-01', 1000, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0051-000000000000', '30000000-0000-0000-0013-000000000000', '2025-11-01', 1000, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0052-000000000000', '30000000-0000-0000-0013-000000000000', '2025-12-01', 1000, '2026-01-15', 'em_andamento'),
  ('40000000-0000-0000-0053-000000000000', '30000000-0000-0000-0014-000000000000', '2025-08-01', 1250, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0054-000000000000', '30000000-0000-0000-0014-000000000000', '2025-09-01', 1250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0055-000000000000', '30000000-0000-0000-0014-000000000000', '2025-10-01', 1250, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0056-000000000000', '30000000-0000-0000-0014-000000000000', '2025-11-01', 1250, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0057-000000000000', '30000000-0000-0000-0015-000000000000', '2025-08-01', 1250, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0058-000000000000', '30000000-0000-0000-0015-000000000000', '2025-09-01', 1250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0059-000000000000', '30000000-0000-0000-0015-000000000000', '2025-10-01', 1250, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0060-000000000000', '30000000-0000-0000-0015-000000000000', '2025-11-01', 1250, '2025-12-15', 'em_andamento'),
  ('40000000-0000-0000-0061-000000000000', '30000000-0000-0000-0016-000000000000', '2025-08-01', 250, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0062-000000000000', '30000000-0000-0000-0016-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0063-000000000000', '30000000-0000-0000-0017-000000000000', '2025-08-01', 250, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0064-000000000000', '30000000-0000-0000-0017-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0065-000000000000', '30000000-0000-0000-0018-000000000000', '2025-08-01', 250, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0066-000000000000', '30000000-0000-0000-0018-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0067-000000000000', '30000000-0000-0000-0019-000000000000', '2025-08-01', 250, '2025-09-15', 'em_andamento'),
  ('40000000-0000-0000-0068-000000000000', '30000000-0000-0000-0019-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0069-000000000000', '30000000-0000-0000-0020-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0070-000000000000', '30000000-0000-0000-0020-000000000000', '2025-10-01', 250, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0071-000000000000', '30000000-0000-0000-0021-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0072-000000000000', '30000000-0000-0000-0021-000000000000', '2025-10-01', 250, '2025-11-15', 'em_andamento'),
  ('40000000-0000-0000-0073-000000000000', '30000000-0000-0000-0022-000000000000', '2025-09-01', 250, '2025-10-15', 'em_andamento'),
  ('40000000-0000-0000-0074-000000000000', '30000000-0000-0000-0022-000000000000', '2025-10-01', 250, '2025-11-15', 'em_andamento');

-- Atualiza installments com analises finalizadas
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 498.5 WHERE id = '40000000-0000-0000-0001-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 489.2 WHERE id = '40000000-0000-0000-0002-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 1245.0 WHERE id = '40000000-0000-0000-0019-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 992.0 WHERE id = '40000000-0000-0000-0032-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 1660.0 WHERE id = '40000000-0000-0000-0042-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 1247.0 WHERE id = '40000000-0000-0000-0053-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 397.0 WHERE id = '40000000-0000-0000-0009-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 298.0 WHERE id = '40000000-0000-0000-0029-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 985.0 WHERE id = '40000000-0000-0000-0050-000000000000';
UPDATE contract_installments SET status = 'concluida', delivered_quantity = 198.0 WHERE id = '40000000-0000-0000-0016-000000000000';

-- TAKEUP MONTHLY
INSERT INTO contract_takeup_monthly (contract_id, reference_month, takeup_quantity) VALUES
  ('30000000-0000-0000-0001-000000000000', '2025-09-01', 1136.88),
  ('30000000-0000-0000-0001-000000000000', '2025-10-01', 677.43),
  ('30000000-0000-0000-0001-000000000000', '2025-11-01', 195.43),
  ('30000000-0000-0000-0002-000000000000', '2025-11-01', 3002.2),
  ('30000000-0000-0000-0003-000000000000', '2025-09-01', 1183.89),
  ('30000000-0000-0000-0003-000000000000', '2025-10-01', 713.8),
  ('30000000-0000-0000-0003-000000000000', '2025-11-01', 96.92),
  ('30000000-0000-0000-0004-000000000000', '2025-08-01', 581.19),
  ('30000000-0000-0000-0004-000000000000', '2025-10-01', 410.63),
  ('30000000-0000-0000-0005-000000000000', '2025-08-01', 3920.0),
  ('30000000-0000-0000-0005-000000000000', '2025-09-01', 1087.36),
  ('30000000-0000-0000-0006-000000000000', '2025-08-01', 532.01),
  ('30000000-0000-0000-0006-000000000000', '2025-10-01', 2394.54),
  ('30000000-0000-0000-0006-000000000000', '2025-11-01', 121.64),
  ('30000000-0000-0000-0007-000000000000', '2026-01-01', 298.36),
  ('30000000-0000-0000-0008-000000000000', '2026-01-01', 129.65),
  ('30000000-0000-0000-0008-000000000000', '2026-02-01', 167.7),
  ('30000000-0000-0000-0009-000000000000', '2025-08-01', 1930.98),
  ('30000000-0000-0000-0009-000000000000', '2025-09-01', 2878.42),
  ('30000000-0000-0000-0009-000000000000', '2025-11-01', 169.8),
  ('30000000-0000-0000-0010-000000000000', '2025-11-01', 3046.62),
  ('30000000-0000-0000-0011-000000000000', '2025-08-01', 5010.7),
  ('30000000-0000-0000-0012-000000000000', '2025-08-01', 1328.78),
  ('30000000-0000-0000-0012-000000000000', '2025-09-01', 193.84),
  ('30000000-0000-0000-0013-000000000000', '2025-10-01', 4361.81),
  ('30000000-0000-0000-0013-000000000000', '2025-11-01', 604.77),
  ('30000000-0000-0000-0014-000000000000', '2025-07-01', 917.34),
  ('30000000-0000-0000-0014-000000000000', '2025-08-01', 4061.2),
  ('30000000-0000-0000-0014-000000000000', '2025-09-01', 120.95),
  ('30000000-0000-0000-0015-000000000000', '2025-10-01', 702.46),
  ('30000000-0000-0000-0015-000000000000', '2025-11-01', 4112.4),
  ('30000000-0000-0000-0015-000000000000', '2025-12-01', 193.9),
  ('30000000-0000-0000-0016-000000000000', '2025-09-01', 242.53),
  ('30000000-0000-0000-0016-000000000000', '2025-11-01', 227.82),
  ('30000000-0000-0000-0016-000000000000', '2025-12-01', 28.81),
  ('30000000-0000-0000-0017-000000000000', '2025-09-01', 246.88),
  ('30000000-0000-0000-0017-000000000000', '2026-01-01', 231.93),
  ('30000000-0000-0000-0018-000000000000', '2025-09-01', 245.18),
  ('30000000-0000-0000-0018-000000000000', '2026-01-01', 266.88),
  ('30000000-0000-0000-0019-000000000000', '2025-09-01', 85.82),
  ('30000000-0000-0000-0019-000000000000', '2025-10-01', 171.34),
  ('30000000-0000-0000-0019-000000000000', '2025-12-01', 291.31),
  ('30000000-0000-0000-0020-000000000000', '2025-10-01', 108.25),
  ('30000000-0000-0000-0020-000000000000', '2025-11-01', 259.34),
  ('30000000-0000-0000-0020-000000000000', '2025-12-01', 171.17),
  ('30000000-0000-0000-0021-000000000000', '2025-12-01', 487.12),
  ('30000000-0000-0000-0022-000000000000', '2025-08-01', 501.68);

-- KNOWN RESPONSIBLES
INSERT INTO known_responsibles (name, type) VALUES
  ('Drielle', 'hvi'),
  ('Drielle', 'takeup'),
  ('Diogo', 'hvi'),
  ('Diogo', 'takeup'),
  ('Alice e Amanda', 'hvi'),
  ('Alice e Amanda', 'takeup'),
  ('Raphaela', 'hvi'),
  ('Raphaela', 'takeup'),
  ('Raiane', 'hvi'),
  ('Raiane', 'takeup'),
  ('Gabriela', 'geral') ON CONFLICT (name, type) DO NOTHING;

-- ANALYSES
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0001-000000000000', '30000000-0000-0000-0001-000000000000', '40000000-0000-0000-0001-000000000000', 'finalizada',
   '2025-09-02', 'Drielle', true, '2025-09-04', NULL, NULL,
   '2025-09-18', 'Diogo', '2025-09-18',
   '2025-09-20', 498.5, 'TakeUp realizado sem intercorrencias. Qualidade dentro dos parametros.',
   0, '00000000-0000-0000-0000-000000000001', '2025-09-02 08:30:00', '2025-09-20 16:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0002-000000000000', '30000000-0000-0000-0001-000000000000', '40000000-0000-0000-0002-000000000000', 'finalizada',
   '2025-10-03', 'Drielle', true, '2025-10-06', NULL, NULL,
   '2025-10-21', 'Diogo', '2025-10-21',
   '2025-10-23', 489.2, 'Resultado aprovado. Pequena variacao de peso dentro da tolerancia.',
   0, '00000000-0000-0000-0000-000000000001', '2025-10-03 09:00:00', '2025-10-23 17:30:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0003-000000000000', '30000000-0000-0000-0005-000000000000', '40000000-0000-0000-0019-000000000000', 'finalizada',
   '2025-09-08', 'Diogo', true, '2025-09-10', NULL, NULL,
   '2025-09-25', 'Alice e Amanda', '2025-09-25',
   '2025-09-27', 1245.0, 'Lote aprovado integralmente. Excelente qualidade.',
   0, '00000000-0000-0000-0000-000000000001', '2025-09-08 10:00:00', '2025-09-27 15:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0004-000000000000', '30000000-0000-0000-0009-000000000000', '40000000-0000-0000-0032-000000000000', 'finalizada',
   '2025-08-05', 'Alice e Amanda', true, '2025-08-07', NULL, NULL,
   '2025-08-22', 'Raphaela', '2025-08-22',
   '2025-08-24', 992.0, 'Aprovado. Fibra dentro dos padroes do contrato.',
   0, '00000000-0000-0000-0000-000000000001', '2025-08-05 08:00:00', '2025-08-24 16:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0005-000000000000', '30000000-0000-0000-0011-000000000000', '40000000-0000-0000-0042-000000000000', 'finalizada',
   '2025-08-10', 'Drielle', true, '2025-08-12', NULL, NULL,
   '2025-08-28', 'Drielle', '2025-08-28',
   '2025-08-30', 1660.0, 'TakeUp do lote Ago/25. Volume total aprovado.',
   0, '00000000-0000-0000-0000-000000000001', '2025-08-10 11:00:00', '2025-08-30 14:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0006-000000000000', '30000000-0000-0000-0014-000000000000', '40000000-0000-0000-0053-000000000000', 'finalizada',
   '2025-08-15', 'Drielle', true, '2025-08-18', NULL, NULL,
   '2025-09-03', 'Alice e Amanda', '2025-09-03',
   '2025-09-05', 1247.0, 'Aprovado. Carga liberada para embarque.',
   0, '00000000-0000-0000-0000-000000000001', '2025-08-15 09:00:00', '2025-09-05 17:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0007-000000000000', '30000000-0000-0000-0003-000000000000', '40000000-0000-0000-0009-000000000000', 'finalizada',
   '2025-08-20', 'Drielle', true, '2025-08-22', NULL, NULL,
   '2025-09-10', 'Raphaela', '2025-09-10',
   '2025-09-12', 397.0, 'Aprovado. Lote Ago/25.',
   0, '00000000-0000-0000-0000-000000000001', '2025-08-20 10:00:00', '2025-09-12 16:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0008-000000000000', '30000000-0000-0000-0007-000000000000', '40000000-0000-0000-0029-000000000000', 'finalizada',
   '2026-04-28', 'Drielle', true, '2026-04-30', NULL, NULL,
   '2026-05-08', 'Alice e Amanda', '2026-05-08',
   '2026-05-10', 298.0, 'Cavalca - lote Dez/25. TakeUp finalizado.',
   0, '00000000-0000-0000-0000-000000000001', '2026-04-28 09:00:00', '2026-05-10 15:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0009-000000000000', '30000000-0000-0000-0013-000000000000', '40000000-0000-0000-0050-000000000000', 'finalizada',
   '2026-04-20', 'Alice e Amanda', true, '2026-04-23', NULL, NULL,
   '2026-05-05', 'Raphaela', '2026-05-05',
   '2026-05-07', 985.0, 'Aprovado. Out/25.',
   0, '00000000-0000-0000-0000-000000000001', '2026-04-20 08:00:00', '2026-05-07 17:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0010-000000000000', '30000000-0000-0000-0004-000000000000', '40000000-0000-0000-0016-000000000000', 'finalizada',
   '2026-04-25', 'Raiane', true, '2026-04-28', NULL, NULL,
   '2026-05-12', 'Raiane', '2026-05-12',
   '2026-05-14', 198.0, 'Exportacao indireta. Lote Out/25 aprovado.',
   0, '00000000-0000-0000-0000-000000000001', '2026-04-25 10:00:00', '2026-05-14 16:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0011-000000000000', '30000000-0000-0000-0005-000000000000', '40000000-0000-0000-0022-000000000000', 'takeup_agendado',
   '2026-05-05', 'Diogo', true, '2026-05-07', NULL, NULL,
   '2026-05-28', 'Alice e Amanda', NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-05 08:00:00', '2026-05-07 16:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0012-000000000000', '30000000-0000-0000-0013-000000000000', '40000000-0000-0000-0051-000000000000', 'takeup_agendado',
   '2026-05-08', 'Alice e Amanda', true, '2026-05-10', NULL, NULL,
   '2026-05-29', 'Raphaela', NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-08 09:00:00', '2026-05-10 15:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0013-000000000000', '30000000-0000-0000-0009-000000000000', '40000000-0000-0000-0035-000000000000', 'hvi_aprovado',
   '2026-05-10', 'Alice e Amanda', true, '2026-05-13', NULL, NULL,
   NULL, NULL, NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-10 10:00:00', '2026-05-13 14:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0014-000000000000', '30000000-0000-0000-0014-000000000000', '40000000-0000-0000-0056-000000000000', 'aguardando_aprovacao_hvi',
   '2026-05-19', 'Drielle', NULL, NULL, NULL, NULL,
   NULL, NULL, NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-19 08:30:00', '2026-05-19 08:30:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0015-000000000000', '30000000-0000-0000-0015-000000000000', '40000000-0000-0000-0059-000000000000', 'aguardando_aprovacao_hvi',
   '2026-05-15', 'Drielle', NULL, NULL, NULL, NULL,
   NULL, NULL, NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-15 09:00:00', '2026-05-15 09:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0016-000000000000', '30000000-0000-0000-0012-000000000000', '40000000-0000-0000-0046-000000000000', 'aguardando_aprovacao_hvi',
   '2026-05-21', 'Drielle', NULL, NULL, NULL, 'Amostra recebida. Aguardando laudo final do laboratorio.',
   NULL, NULL, NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-21 14:00:00', '2026-05-21 14:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0017-000000000000', '30000000-0000-0000-0006-000000000000', '40000000-0000-0000-0025-000000000000', 'takeup_reagendado',
   '2026-05-02', 'Drielle', true, '2026-05-05', NULL, NULL,
   '2026-05-27', 'Diogo', NULL,
   NULL, NULL, NULL,
   1, '00000000-0000-0000-0000-000000000001', '2026-05-02 09:00:00', '2026-05-15 16:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0018-000000000000', '30000000-0000-0000-0008-000000000000', '40000000-0000-0000-0031-000000000000', 'analise_interrompida',
   '2026-03-10', 'Drielle', false, NULL, 'HVI reprovado - micronaire fora do padrao contratual (acima de 4.9). Lote devolvido ao produtor.', NULL,
   NULL, NULL, NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-03-10 10:00:00', '2026-03-15 11:00:00');
INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES
  ('50000000-0000-0000-0019-000000000000', '30000000-0000-0000-0016-000000000000', '40000000-0000-0000-0062-000000000000', 'aguardando_hvi',
   NULL, NULL, NULL, NULL, NULL, NULL,
   NULL, NULL, NULL,
   NULL, NULL, NULL,
   0, '00000000-0000-0000-0000-000000000001', '2026-05-22 08:00:00', '2026-05-22 08:00:00');

-- Atualiza totais dos contratos
UPDATE contracts SET total_takeup = (SELECT COALESCE(SUM(approved_tons),0) FROM analyses WHERE contract_id = contracts.id AND status = 'finalizada'), balance_pending = total_quantity - (SELECT COALESCE(SUM(approved_tons),0) FROM analyses WHERE contract_id = contracts.id AND status = 'finalizada') WHERE id IN (SELECT DISTINCT contract_id FROM analyses WHERE status = 'finalizada');

-- ANALYSIS COMMENTS
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0001-000000000000', 'HVI recebido do laboratorio. Tudo dentro do esperado para esta parcela.', '00000000-0000-0000-0000-000000000001', '2025-09-02 10:00:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0001-000000000000', 'TakeUp realizado com sucesso. Laudo enviado ao comprador.', '00000000-0000-0000-0000-000000000001', '2025-09-20 16:30:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0003-000000000000', 'Lote grande, mas qualidade excelente. OLAM ja confirmou aceite.', '00000000-0000-0000-0000-000000000001', '2025-09-27 15:30:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0011-000000000000', 'TakeUp agendado para 28/05. Equipe da Alice confirmou disponibilidade.', '00000000-0000-0000-0000-000000000001', '2026-05-07 17:00:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0011-000000000000', 'Lembrete: TakeUp em 6 dias. Conferir disponibilidade do lote no armazem.', '00000000-0000-0000-0000-000000000001', '2026-05-22 08:15:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0014-000000000000', 'HVI recebido em 19/05. Aguardando revisao tecnica.', '00000000-0000-0000-0000-000000000001', '2026-05-20 09:00:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0016-000000000000', 'Amostra entregue pelo produtor. Resultado esperado em 2 dias uteis.', '00000000-0000-0000-0000-000000000001', '2026-05-21 14:30:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0017-000000000000', 'Reagendado de 15/05 para 27/05 a pedido do comprador ADM. Novo protocolo registrado.', '00000000-0000-0000-0000-000000000001', '2026-05-15 16:00:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0018-000000000000', 'HVI reprovado. Micronaire 5.2, acima do limite de 4.9. Notificado produtor.', '00000000-0000-0000-0000-000000000001', '2026-03-15 11:00:00');
INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('50000000-0000-0000-0019-000000000000', 'Nova analise criada. Aguardando envio do HVI pela VITERRA.', '00000000-0000-0000-0000-000000000001', '2026-05-22 08:05:00');

-- TAKEUP RESCHEDULE
INSERT INTO takeup_reschedules (analysis_id, previous_date, new_date, reason, created_by, created_at)
VALUES ('50000000-0000-0000-0017-000000000000', '2026-05-15', '2026-05-27',
  'Solicitacao do comprador ADM International. Logistica do armazem ocupada na semana de 15/05.', '00000000-0000-0000-0000-000000000001', '2026-05-15 16:00:00');

-- AGENDA ENTRIES
INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)
VALUES ('A0000000-0000-0000-0001-000000000000', 'TakeUp AG-26657/10 - OLAM Dez/25', 'TakeUp de 1.250t. Responsavel Alice e Amanda. Armazem BOM FUTURO Sorriso-MT.', 'takeup', '2026-05-28', '09:00', 'pendente', '50000000-0000-0000-0011-000000000000', '30000000-0000-0000-0005-000000000000', '00000000-0000-0000-0000-000000000001');
INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)
VALUES ('A0000000-0000-0000-0002-000000000000', 'TakeUp AG-27624/10 - Paul Reinhart Nov/25', 'TakeUp de 1.000t. Responsavel Raphaela.', 'takeup', '2026-05-29', '10:00', 'pendente', '50000000-0000-0000-0012-000000000000', '30000000-0000-0000-0013-000000000000', '00000000-0000-0000-0000-000000000001');
INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)
VALUES ('A0000000-0000-0000-0003-000000000000', 'TakeUp AG-26769/10 - ADM Out/25 (reagendado)', 'Reagendado de 15/05 para 27/05 a pedido da ADM. Confirmar com Diogo.', 'takeup', '2026-05-27', '14:00', 'pendente', '50000000-0000-0000-0017-000000000000', '30000000-0000-0000-0006-000000000000', '00000000-0000-0000-0000-000000000001');
INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)
VALUES ('A0000000-0000-0000-0004-000000000000', 'Aprovacao HVI pendente - 3 analises', 'AG-27629, AG-27631 e AG-27573 aguardam aprovacao HVI urgente.', 'analise', '2026-05-23', NULL, 'pendente', NULL, NULL, '00000000-0000-0000-0000-000000000001');
INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)
VALUES ('A0000000-0000-0000-0005-000000000000', 'Reuniao Laferlins - Revisao contratos Mai/26', 'Revisao mensal de contratos ativos com equipe.', 'outro', '2026-05-30', '08:00', 'pendente', NULL, NULL, '00000000-0000-0000-0000-000000000001');
INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)
VALUES ('A0000000-0000-0000-0006-000000000000', 'Entrega docs embarque AG-27519/10', 'BL e documentos de exportacao para ADM International.', 'entrega', '2026-05-23', '15:00', 'pendente', NULL, '30000000-0000-0000-0011-000000000000', '00000000-0000-0000-0000-000000000001');

-- NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'HVI pendente: AG-27629/10 Nov/25', 'HVI recebido em 19/05 aguarda aprovacao. Parcela Nov/25 (1.250t).', 'hvi_pendente', false);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'HVI pendente: AG-27631/10 Out/25', 'HVI recebido em 15/05 aguarda aprovacao. Parcela Out/25 (1.250t).', 'hvi_pendente', false);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'HVI pendente: AG-27573/10 Set/25', 'HVI recebido em 21/05. Laudo do laboratorio em analise.', 'hvi_pendente', false);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'TakeUp amanha: AG-26657/10 Dez/25', 'TakeUp de 1.250t com OLAM em 28/05. Equipe: Alice e Amanda.', 'takeup_pendente', false);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'TakeUp em 2 dias: AG-27624/10 Nov/25', 'TakeUp de 1.000t com Paul Reinhart em 29/05. Resp.: Raphaela.', 'takeup_pendente', false);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'TakeUp reagendado amanha: AG-26769/10', 'TakeUp reagendado para 27/05. Confirmar disponibilidade com Diogo.', 'takeup_pendente', true);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'Parcela vencendo: AG-27148/10 Nov/25', 'Parcela de 1.000t vence em 15/12. HVI aprovado, TakeUp nao agendado.', 'parcela_vencendo', false);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'Analise interrompida: AG-26822/10', 'HVI reprovado em mar/26. Micronaire fora do padrao. Lote devolvido.', 'geral', true);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', 'Nova analise criada: AG-27661/10 Set/25', 'Analise Ago/25 aguardando HVI da VITERRA.', 'geral', true);
INSERT INTO notifications (user_id, title, message, type, is_read)
VALUES ('00000000-0000-0000-0000-000000000001', '3 HVIs aguardam aprovacao', 'AG-27629, AG-27631 e AG-27573 com HVI pendente a mais de 2 dias uteis.', 'alerta_prazo', false);

-- ================================================================
-- Seed completo!
-- Login: gabriela@laferlins.com.br / senha123
-- 22 contratos, 74 parcelas, 19 analises
-- ================================================================