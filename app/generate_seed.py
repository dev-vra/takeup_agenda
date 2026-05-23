#!/usr/bin/env python3
"""Generate seed.sql for Agenda TakeUp local development"""

lines = []
def e(s=''): lines.append(s)
def q(s):
    if s is None: return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

contracts = [
  {"contract_number":"AG-26367/10","reference":"23P07345","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"OLAM GLOBAL AGRI PTE LTD","total_quantity":2000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.84,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":0,"m3":500,"m4":500,"m5":500,"m6":500,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":1136.88,"m4":677.43,"m5":195.43,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Diogo"},
  {"contract_number":"AG-26368/10","reference":"23P07346","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"OLAM GLOBAL AGRI PTE LTD","total_quantity":3000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXADO","price":0.7446,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":0,"m3":750,"m4":750,"m5":750,"m6":750,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":3002.20,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Diogo"},
  {"contract_number":"AG-26424/10","reference":"210/10320440","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":2000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.815,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":400,"m3":400,"m4":400,"m5":400,"m6":400,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":1183.89,"m4":713.8,"m5":96.92,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-26426/10","reference":"1223P50004C","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM DO BRASIL LTDA (SP)","total_quantity":1000.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (150 ON)","price":0.725,"price_unit":"Libra","terms":"CIP","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao Indireta","delivery":{"m0":0,"m1":0,"m2":200,"m3":200,"m4":200,"m5":200,"m6":200,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":581.19,"m3":0,"m4":410.63,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raiane"},
  {"contract_number":"AG-26657/10","reference":"23/P/09172","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"OLAM GLOBAL AGRI PTE LTD","total_quantity":5000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.835,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":0,"m3":1250,"m4":1250,"m5":1250,"m6":1250,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":3920.00,"m3":1087.36,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Diogo"},
  {"contract_number":"AG-26769/10","reference":"210/10323050","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":3000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.82,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":600,"m3":600,"m4":600,"m5":600,"m6":600,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":532.01,"m3":0,"m4":2394.54,"m5":121.64,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-26821/10","reference":"210/10324851","seller":"AGROPECUARIA CAVALCA MT LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":300.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.7365,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":150,"m6":150,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":0,"m6":0,"m7":298.36,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-26822/10","reference":"210/10324850","seller":"AGROPECUARIA CAVALCA MT LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":300.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.7365,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":150,"m6":150,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":0,"m6":0,"m7":129.65,"m8":167.70,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-27148/10","reference":"P017.417","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"PAUL REINHART AG.","total_quantity":5000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXADO","price":0.7482,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":1000,"m3":1000,"m4":1000,"m5":1000,"m6":1000,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":1930.98,"m3":2878.42,"m4":0,"m5":169.8,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Alice e Amanda"},
  {"contract_number":"AG-27154/10","reference":"23/P/11164","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"OLAM GLOBAL AGRI PTE LTD","total_quantity":3000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXADO","price":0.7329,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":600,"m3":600,"m4":600,"m5":600,"m6":600,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":3046.62,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Diogo"},
  {"contract_number":"AG-27519/10","reference":"210/10339100","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":5000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.745,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":1666,"m3":1667,"m4":1667,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":5010.70,"m3":0,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-27573/10","reference":"210/10341600","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":1500.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.81,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":500,"m3":500,"m4":500,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":1328.78,"m3":193.84,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-27624/10","reference":"P017.521","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"PAUL REINHART AG.","total_quantity":5000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXADO","price":0.7375,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":1000,"m3":1000,"m4":1000,"m5":1000,"m6":1000,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":4361.81,"m5":604.77,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Alice e Amanda"},
  {"contract_number":"AG-27629/10","reference":"210/10343140","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":5000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"FIXO","price":0.8025,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":1250,"m3":1250,"m4":1250,"m5":1250,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":917.34,"m2":4061.2,"m3":120.95,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-27631/10","reference":"210/10343150","seller":"BOM FUTURO AGRICOLA LTDA","buyer":"ADM INTERNATIONAL SARL","total_quantity":5000.0,"origin":"MT-BRASIL","currency":"US$","indexation":"NYF DEC/2025 (150 ON)","price":None,"price_unit":"Libra","terms":"FOB","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Exportacao","delivery":{"m0":0,"m1":0,"m2":1250,"m3":1250,"m4":1250,"m5":1250,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":702.46,"m5":4112.4,"m6":193.9,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Drielle"},
  {"contract_number":"AG-27661/10","reference":"VTSA01312/25","seller":"DANIELLE TIRONI ROMAGNOLI E OUTRO","buyer":"VITERRA AGRICULTURE BRASIL S.A.","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (50 OFF) FIXADO","price":0.618,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":250,"m3":250,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":242.53,"m4":0,"m5":227.82,"m6":28.81,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raphaela"},
  {"contract_number":"AG-27662/10","reference":"VTSA01313/25","seller":"DANIELLE TIRONI ROMAGNOLI E OUTRO","buyer":"VITERRA AGRICULTURE BRASIL S.A.","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (50 OFF) FIXADO","price":0.6514,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":250,"m3":250,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":246.88,"m4":0,"m5":0,"m6":0,"m7":231.93,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raphaela"},
  {"contract_number":"AG-27664/10","reference":"VTSA01314/25","seller":"DANIELLE TIRONI ROMAGNOLI E OUTRO","buyer":"VITERRA AGRICULTURE BRASIL S.A.","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (50 OFF) FIXADO","price":0.6514,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":250,"m3":250,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":245.18,"m4":0,"m5":0,"m6":0,"m7":266.88,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raphaela"},
  {"contract_number":"AG-27665/10","reference":"VTSA01315/25","seller":"DANIELLE TIRONI ROMAGNOLI E OUTRO","buyer":"VITERRA BRASIL S.A.","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (50 OFF) FIXADO","price":0.618,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":250,"m3":250,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":85.82,"m4":171.34,"m5":0,"m6":291.31,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raphaela"},
  {"contract_number":"AG-27666/10","reference":"1331P50044C","seller":"WILSON ROMAGNOLI E OUTRO","buyer":"ADM DO BRASIL LTDA","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (250 OFF)","price":None,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":0,"m3":250,"m4":250,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":108.25,"m5":259.34,"m6":171.17,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raiane"},
  {"contract_number":"AG-27667/10","reference":"1331P50045C","seller":"WILSON ROMAGNOLI E OUTRO","buyer":"ADM DO BRASIL LTDA","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (250 OFF)","price":None,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":0,"m3":250,"m4":250,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":0,"m3":0,"m4":0,"m5":0,"m6":487.12,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raiane"},
  {"contract_number":"AG-27668/10","reference":"1331P50046C","seller":"WILSON ROMAGNOLI E OUTRO","buyer":"ADM DO BRASIL LTDA","total_quantity":500.0,"origin":"MT-BRASIL","currency":"R$","indexation":"NYF DEC/2025 (250 OFF)","price":None,"price_unit":"Libra","terms":"FCA","quality_spec":"2.5/40.0/28.0/34.0/81.0","subtype":"Domestico","delivery":{"m0":0,"m1":0,"m2":0,"m3":250,"m4":250,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"takeup":{"m0":0,"m1":0,"m2":501.68,"m3":0,"m4":0,"m5":0,"m6":0,"m7":0,"m8":0,"m9":0,"m10":0,"m11":0,"m12":0},"responsible":"Raiane"},
]

month_dates = ['2025-06-01','2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01','2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01']
due_dates   = ['2025-07-15','2025-08-15','2025-09-15','2025-10-15','2025-11-15','2025-12-15','2026-01-15','2026-02-15','2026-03-15','2026-04-15','2026-05-15','2026-06-15','2026-07-15']

GABRIELA = '00000000-0000-0000-0000-000000000001'
INSTANCE  = '00000000-0000-0000-0000-000000000000'

sellers_ids = {
  'BOM FUTURO AGRICOLA LTDA':          '10000000-0000-0000-0000-000000000001',
  'AGROPECUARIA CAVALCA MT LTDA':      '10000000-0000-0000-0000-000000000002',
  'DANIELLE TIRONI ROMAGNOLI E OUTRO': '10000000-0000-0000-0000-000000000003',
  'WILSON ROMAGNOLI E OUTRO':          '10000000-0000-0000-0000-000000000004',
}
buyers_ids = {
  'OLAM GLOBAL AGRI PTE LTD':          '20000000-0000-0000-0000-000000000001',
  'ADM INTERNATIONAL SARL':            '20000000-0000-0000-0000-000000000002',
  'ADM DO BRASIL LTDA (SP)':           '20000000-0000-0000-0000-000000000003',
  'PAUL REINHART AG.':                 '20000000-0000-0000-0000-000000000004',
  'VITERRA AGRICULTURE BRASIL S.A.':   '20000000-0000-0000-0000-000000000005',
  'VITERRA BRASIL S.A.':               '20000000-0000-0000-0000-000000000006',
  'ADM DO BRASIL LTDA':                '20000000-0000-0000-0000-000000000007',
}

contract_ids = {}
for i, c in enumerate(contracts, 1):
    contract_ids[c['contract_number']] = f'30000000-0000-0000-{i:04d}-000000000000'

installment_ids = {}
inst_seq = 1
for c in contracts:
    for mi in range(13):
        qty = c['delivery'].get(f'm{mi}', 0)
        if qty > 0:
            installment_ids[(c['contract_number'], mi)] = f'40000000-0000-0000-{inst_seq:04d}-000000000000'
            inst_seq += 1

analysis_data = []
an_seq = 1
def add_analysis(cnum, mi, status, **kw):
    global an_seq
    aid = f'50000000-0000-0000-{an_seq:04d}-000000000000'
    an_seq += 1
    analysis_data.append({'id': aid, 'contract_num': cnum, 'month_idx': mi, 'status': status, **kw})

# Finalizadas passado
add_analysis('AG-26367/10', 3, 'finalizada', hvi_received_date='2025-09-02', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2025-09-04', takeup_scheduled_date='2025-09-18', takeup_responsible='Diogo', takeup_actual_date='2025-09-18', report_delivery_date='2025-09-20', approved_tons=498.5, final_observation='TakeUp realizado sem intercorrencias. Qualidade dentro dos parametros.', created_at="'2025-09-02 08:30:00'", updated_at="'2025-09-20 16:00:00'")
add_analysis('AG-26367/10', 4, 'finalizada', hvi_received_date='2025-10-03', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2025-10-06', takeup_scheduled_date='2025-10-21', takeup_responsible='Diogo', takeup_actual_date='2025-10-21', report_delivery_date='2025-10-23', approved_tons=489.2, final_observation='Resultado aprovado. Pequena variacao de peso dentro da tolerancia.', created_at="'2025-10-03 09:00:00'", updated_at="'2025-10-23 17:30:00'")
add_analysis('AG-26657/10', 3, 'finalizada', hvi_received_date='2025-09-08', hvi_responsible='Diogo', hvi_approved=True, hvi_approval_date='2025-09-10', takeup_scheduled_date='2025-09-25', takeup_responsible='Alice e Amanda', takeup_actual_date='2025-09-25', report_delivery_date='2025-09-27', approved_tons=1245.0, final_observation='Lote aprovado integralmente. Excelente qualidade.', created_at="'2025-09-08 10:00:00'", updated_at="'2025-09-27 15:00:00'")
add_analysis('AG-27148/10', 2, 'finalizada', hvi_received_date='2025-08-05', hvi_responsible='Alice e Amanda', hvi_approved=True, hvi_approval_date='2025-08-07', takeup_scheduled_date='2025-08-22', takeup_responsible='Raphaela', takeup_actual_date='2025-08-22', report_delivery_date='2025-08-24', approved_tons=992.0, final_observation='Aprovado. Fibra dentro dos padroes do contrato.', created_at="'2025-08-05 08:00:00'", updated_at="'2025-08-24 16:00:00'")
add_analysis('AG-27519/10', 2, 'finalizada', hvi_received_date='2025-08-10', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2025-08-12', takeup_scheduled_date='2025-08-28', takeup_responsible='Drielle', takeup_actual_date='2025-08-28', report_delivery_date='2025-08-30', approved_tons=1660.0, final_observation='TakeUp do lote Ago/25. Volume total aprovado.', created_at="'2025-08-10 11:00:00'", updated_at="'2025-08-30 14:00:00'")
add_analysis('AG-27629/10', 2, 'finalizada', hvi_received_date='2025-08-15', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2025-08-18', takeup_scheduled_date='2025-09-03', takeup_responsible='Alice e Amanda', takeup_actual_date='2025-09-03', report_delivery_date='2025-09-05', approved_tons=1247.0, final_observation='Aprovado. Carga liberada para embarque.', created_at="'2025-08-15 09:00:00'", updated_at="'2025-09-05 17:00:00'")
add_analysis('AG-26424/10', 2, 'finalizada', hvi_received_date='2025-08-20', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2025-08-22', takeup_scheduled_date='2025-09-10', takeup_responsible='Raphaela', takeup_actual_date='2025-09-10', report_delivery_date='2025-09-12', approved_tons=397.0, final_observation='Aprovado. Lote Ago/25.', created_at="'2025-08-20 10:00:00'", updated_at="'2025-09-12 16:00:00'")
# Finalizadas este mes (maio/26) - para KPI
add_analysis('AG-26821/10', 6, 'finalizada', hvi_received_date='2026-04-28', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2026-04-30', takeup_scheduled_date='2026-05-08', takeup_responsible='Alice e Amanda', takeup_actual_date='2026-05-08', report_delivery_date='2026-05-10', approved_tons=298.0, final_observation='Cavalca - lote Dez/25. TakeUp finalizado.', created_at="'2026-04-28 09:00:00'", updated_at="'2026-05-10 15:00:00'")
add_analysis('AG-27624/10', 4, 'finalizada', hvi_received_date='2026-04-20', hvi_responsible='Alice e Amanda', hvi_approved=True, hvi_approval_date='2026-04-23', takeup_scheduled_date='2026-05-05', takeup_responsible='Raphaela', takeup_actual_date='2026-05-05', report_delivery_date='2026-05-07', approved_tons=985.0, final_observation='Aprovado. Out/25.', created_at="'2026-04-20 08:00:00'", updated_at="'2026-05-07 17:00:00'")
add_analysis('AG-26426/10', 4, 'finalizada', hvi_received_date='2026-04-25', hvi_responsible='Raiane', hvi_approved=True, hvi_approval_date='2026-04-28', takeup_scheduled_date='2026-05-12', takeup_responsible='Raiane', takeup_actual_date='2026-05-12', report_delivery_date='2026-05-14', approved_tons=198.0, final_observation='Exportacao indireta. Lote Out/25 aprovado.', created_at="'2026-04-25 10:00:00'", updated_at="'2026-05-14 16:00:00'")
# TakeUp agendado para esta semana
IDX_AGENDADO1 = len(analysis_data)
add_analysis('AG-26657/10', 6, 'takeup_agendado', hvi_received_date='2026-05-05', hvi_responsible='Diogo', hvi_approved=True, hvi_approval_date='2026-05-07', takeup_scheduled_date='2026-05-28', takeup_responsible='Alice e Amanda', created_at="'2026-05-05 08:00:00'", updated_at="'2026-05-07 16:00:00'")
IDX_AGENDADO2 = len(analysis_data)
add_analysis('AG-27624/10', 5, 'takeup_agendado', hvi_received_date='2026-05-08', hvi_responsible='Alice e Amanda', hvi_approved=True, hvi_approval_date='2026-05-10', takeup_scheduled_date='2026-05-29', takeup_responsible='Raphaela', created_at="'2026-05-08 09:00:00'", updated_at="'2026-05-10 15:00:00'")
# HVI aprovado
IDX_HVI_APROV = len(analysis_data)
add_analysis('AG-27148/10', 5, 'hvi_aprovado', hvi_received_date='2026-05-10', hvi_responsible='Alice e Amanda', hvi_approved=True, hvi_approval_date='2026-05-13', created_at="'2026-05-10 10:00:00'", updated_at="'2026-05-13 14:00:00'")
# Aguardando aprovacao HVI
IDX_AGUA1 = len(analysis_data)
add_analysis('AG-27629/10', 5, 'aguardando_aprovacao_hvi', hvi_received_date='2026-05-19', hvi_responsible='Drielle', created_at="'2026-05-19 08:30:00'", updated_at="'2026-05-19 08:30:00'")
IDX_AGUA2 = len(analysis_data)
add_analysis('AG-27631/10', 4, 'aguardando_aprovacao_hvi', hvi_received_date='2026-05-15', hvi_responsible='Drielle', created_at="'2026-05-15 09:00:00'", updated_at="'2026-05-15 09:00:00'")
IDX_AGUA3 = len(analysis_data)
add_analysis('AG-27573/10', 3, 'aguardando_aprovacao_hvi', hvi_received_date='2026-05-21', hvi_responsible='Drielle', hvi_observation='Amostra recebida. Aguardando laudo final do laboratorio.', created_at="'2026-05-21 14:00:00'", updated_at="'2026-05-21 14:00:00'")
# Reagendado
IDX_REAGEND = len(analysis_data)
add_analysis('AG-26769/10', 4, 'takeup_reagendado', hvi_received_date='2026-05-02', hvi_responsible='Drielle', hvi_approved=True, hvi_approval_date='2026-05-05', takeup_scheduled_date='2026-05-27', takeup_responsible='Diogo', takeup_reschedule_count=1, created_at="'2026-05-02 09:00:00'", updated_at="'2026-05-15 16:00:00'")
# Interrompida
IDX_INTERR = len(analysis_data)
add_analysis('AG-26822/10', 6, 'analise_interrompida', hvi_received_date='2026-03-10', hvi_responsible='Drielle', hvi_approved=False, hvi_rejection_reason='HVI reprovado - micronaire fora do padrao contratual (acima de 4.9). Lote devolvido ao produtor.', created_at="'2026-03-10 10:00:00'", updated_at="'2026-03-15 11:00:00'")
# Aguardando HVI
IDX_AGUA_HVI = len(analysis_data)
add_analysis('AG-27661/10', 3, 'aguardando_hvi', created_at="'2026-05-22 08:00:00'", updated_at="'2026-05-22 08:00:00'")

# ======================== BUILD SQL ========================

e("-- ================================================================")
e("-- SEED - Agenda TakeUp - Ambiente Local")
e("-- Gerado com dados reais da planilha Laferlins")
e("-- Data referencia: 2026-05-22 | Login: gabriela@laferlins.com.br / senha123")
e("-- ================================================================")
e()

e("-- AUTH USER: Gabriela")
e("INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,")
e("  email_confirmed_at, created_at, updated_at, raw_user_meta_data,")
e("  is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)")
e("VALUES (")
e(f"  '{GABRIELA}', '{INSTANCE}', 'authenticated', 'authenticated',")
e("  'gabriela@laferlins.com.br',")
e("  crypt('senha123', gen_salt('bf')),")
e("  now(), now(), now(),")
e('  \'{"name": "Gabriela Laferlins", "role": "admin"}\'::jsonb,')
e("  false, '', '', '', ''")
e(");")
e("UPDATE profiles SET name = 'Gabriela Laferlins', role = 'admin' WHERE id = '" + GABRIELA + "';")
e()

e("-- SELLERS")
e("INSERT INTO sellers (id, name, city, state) VALUES")
rows = [f"  ('{sid}', {q(name)}, 'Sorriso', 'MT')" for name, sid in sellers_ids.items()]
e(",\n".join(rows) + ";")
e()

e("-- BUYERS")
e("INSERT INTO buyers (id, name, country) VALUES")
buyer_countries = {'OLAM GLOBAL AGRI PTE LTD':'Singapura','ADM INTERNATIONAL SARL':'Suica','ADM DO BRASIL LTDA (SP)':'Brasil','PAUL REINHART AG.':'Suica','VITERRA AGRICULTURE BRASIL S.A.':'Brasil','VITERRA BRASIL S.A.':'Brasil','ADM DO BRASIL LTDA':'Brasil'}
rows = [f"  ('{bid}', {q(name)}, {q(buyer_countries.get(name,'Brasil'))})" for name, bid in buyers_ids.items()]
e(",\n".join(rows) + ";")
e()

e("-- CONTRACTS (22 contratos reais)")
e("INSERT INTO contracts (id, contract_number, reference, seller_id, buyer_id, total_quantity, origin, currency, indexation, price, price_unit, terms, quality_spec, contract_subtype, responsible, created_by) VALUES")
rows = []
for c in contracts:
    cid = contract_ids[c['contract_number']]
    sid = sellers_ids[c['seller']]
    bid = buyers_ids[c['buyer']]
    price = str(c['price']) if c['price'] is not None else 'NULL'
    rows.append(f"  ('{cid}', {q(c['contract_number'])}, {q(c['reference'])}, '{sid}', '{bid}', {c['total_quantity']}, {q(c['origin'])}, {q(c['currency'])}, {q(c['indexation'])}, {price}, {q(c['price_unit'])}, {q(c['terms'])}, {q(c['quality_spec'])}, {q(c['subtype'])}, {q(c['responsible'])}, '{GABRIELA}')")
e(",\n".join(rows) + ";")
e()

e("-- INSTALLMENTS")
e("INSERT INTO contract_installments (id, contract_id, reference_month, scheduled_quantity, due_date, status) VALUES")
rows = []
for c in contracts:
    cid = contract_ids[c['contract_number']]
    for mi in range(13):
        qty = c['delivery'].get(f'm{mi}', 0)
        if qty > 0:
            iid = installment_ids[(c['contract_number'], mi)]
            mdate = month_dates[mi]
            ddate = due_dates[mi]
            status = 'pendente' if mdate >= '2026-05-01' else 'em_andamento'
            rows.append(f"  ('{iid}', '{cid}', '{mdate}', {qty}, '{ddate}', '{status}')")
e(",\n".join(rows) + ";")
e()

e("-- Atualiza installments com analises finalizadas")
for a in analysis_data:
    if a['status'] == 'finalizada':
        key = (a['contract_num'], a['month_idx'])
        if key in installment_ids:
            iid = installment_ids[key]
            tons = a.get('approved_tons', 0) or 0
            sched = contracts[next(i for i,c in enumerate(contracts) if c['contract_number']==a['contract_num'])]['delivery'][f"m{a['month_idx']}"]
            new_status = 'concluida' if tons >= sched * 0.9 else 'em_andamento'
            e(f"UPDATE contract_installments SET status = '{new_status}', delivered_quantity = {tons} WHERE id = '{iid}';")
e()

e("-- TAKEUP MONTHLY")
rows = []
for c in contracts:
    cid = contract_ids[c['contract_number']]
    for mi in range(13):
        qty = c['takeup'].get(f'm{mi}', 0)
        if qty > 0:
            rows.append(f"  ('{cid}', '{month_dates[mi]}', {qty})")
if rows:
    e("INSERT INTO contract_takeup_monthly (contract_id, reference_month, takeup_quantity) VALUES")
    e(",\n".join(rows) + ";")
e()

e("-- KNOWN RESPONSIBLES")
resp_list = [('Drielle','hvi'),('Drielle','takeup'),('Diogo','hvi'),('Diogo','takeup'),('Alice e Amanda','hvi'),('Alice e Amanda','takeup'),('Raphaela','hvi'),('Raphaela','takeup'),('Raiane','hvi'),('Raiane','takeup'),('Gabriela','geral')]
rows = [f"  ({q(n)}, '{t}')" for n,t in resp_list]
e("INSERT INTO known_responsibles (name, type) VALUES")
e(",\n".join(rows) + " ON CONFLICT (name, type) DO NOTHING;")
e()

e("-- ANALYSES")
for a in analysis_data:
    key = (a['contract_num'], a['month_idx'])
    if key not in installment_ids:
        continue
    cid = contract_ids[a['contract_num']]
    iid = installment_ids[key]
    aid = a['id']
    hvi_approved = 'true' if a.get('hvi_approved') is True else ('false' if a.get('hvi_approved') is False else 'NULL')
    tons = str(a['approved_tons']) if a.get('approved_tons') is not None else 'NULL'
    reschedule = a.get('takeup_reschedule_count', 0)
    created_at = a.get('created_at', 'now()')
    updated_at = a.get('updated_at', 'now()')
    e(f"INSERT INTO analyses (id, contract_id, installment_id, status, hvi_received_date, hvi_responsible, hvi_approved, hvi_approval_date, hvi_rejection_reason, hvi_observation, takeup_scheduled_date, takeup_responsible, takeup_actual_date, report_delivery_date, approved_tons, final_observation, takeup_reschedule_count, created_by, created_at, updated_at) VALUES")
    e(f"  ('{aid}', '{cid}', '{iid}', '{a['status']}',")
    e(f"   {q(a.get('hvi_received_date'))}, {q(a.get('hvi_responsible'))}, {hvi_approved}, {q(a.get('hvi_approval_date'))}, {q(a.get('hvi_rejection_reason'))}, {q(a.get('hvi_observation'))},")
    e(f"   {q(a.get('takeup_scheduled_date'))}, {q(a.get('takeup_responsible'))}, {q(a.get('takeup_actual_date'))},")
    e(f"   {q(a.get('report_delivery_date'))}, {tons}, {q(a.get('final_observation'))},")
    e(f"   {reschedule}, '{GABRIELA}', {created_at}, {updated_at});")
e()

e("-- Atualiza totais dos contratos")
e("UPDATE contracts SET total_takeup = (SELECT COALESCE(SUM(approved_tons),0) FROM analyses WHERE contract_id = contracts.id AND status = 'finalizada'), balance_pending = total_quantity - (SELECT COALESCE(SUM(approved_tons),0) FROM analyses WHERE contract_id = contracts.id AND status = 'finalizada') WHERE id IN (SELECT DISTINCT contract_id FROM analyses WHERE status = 'finalizada');")
e()

e("-- ANALYSIS COMMENTS")
comment_pairs = [
    (analysis_data[0]['id'],  "HVI recebido do laboratorio. Tudo dentro do esperado para esta parcela.", '2025-09-02 10:00:00'),
    (analysis_data[0]['id'],  "TakeUp realizado com sucesso. Laudo enviado ao comprador.", '2025-09-20 16:30:00'),
    (analysis_data[2]['id'],  "Lote grande, mas qualidade excelente. OLAM ja confirmou aceite.", '2025-09-27 15:30:00'),
    (analysis_data[IDX_AGENDADO1]['id'], "TakeUp agendado para 28/05. Equipe da Alice confirmou disponibilidade.", '2026-05-07 17:00:00'),
    (analysis_data[IDX_AGENDADO1]['id'], "Lembrete: TakeUp em 6 dias. Conferir disponibilidade do lote no armazem.", '2026-05-22 08:15:00'),
    (analysis_data[IDX_AGUA1]['id'],  "HVI recebido em 19/05. Aguardando revisao tecnica.", '2026-05-20 09:00:00'),
    (analysis_data[IDX_AGUA3]['id'],  "Amostra entregue pelo produtor. Resultado esperado em 2 dias uteis.", '2026-05-21 14:30:00'),
    (analysis_data[IDX_REAGEND]['id'], "Reagendado de 15/05 para 27/05 a pedido do comprador ADM. Novo protocolo registrado.", '2026-05-15 16:00:00'),
    (analysis_data[IDX_INTERR]['id'],  "HVI reprovado. Micronaire 5.2, acima do limite de 4.9. Notificado produtor.", '2026-03-15 11:00:00'),
    (analysis_data[IDX_AGUA_HVI]['id'], "Nova analise criada. Aguardando envio do HVI pela VITERRA.", '2026-05-22 08:05:00'),
]
for aid, content, ts in comment_pairs:
    e(f"INSERT INTO analysis_comments (analysis_id, content, created_by, created_at) VALUES ('{aid}', {q(content)}, '{GABRIELA}', '{ts}');")
e()

e("-- TAKEUP RESCHEDULE")
e(f"INSERT INTO takeup_reschedules (analysis_id, previous_date, new_date, reason, created_by, created_at)")
e(f"VALUES ('{analysis_data[IDX_REAGEND]['id']}', '2026-05-15', '2026-05-27',")
e(f"  'Solicitacao do comprador ADM International. Logistica do armazem ocupada na semana de 15/05.', '{GABRIELA}', '2026-05-15 16:00:00');")
e()

e("-- AGENDA ENTRIES")
agendas = [
  ('TakeUp AG-26657/10 - OLAM Dez/25', 'TakeUp de 1.250t. Responsavel Alice e Amanda. Armazem BOM FUTURO Sorriso-MT.', 'takeup', '2026-05-28', '09:00', analysis_data[IDX_AGENDADO1]['id'], contract_ids['AG-26657/10']),
  ('TakeUp AG-27624/10 - Paul Reinhart Nov/25', 'TakeUp de 1.000t. Responsavel Raphaela.', 'takeup', '2026-05-29', '10:00', analysis_data[IDX_AGENDADO2]['id'], contract_ids['AG-27624/10']),
  ('TakeUp AG-26769/10 - ADM Out/25 (reagendado)', 'Reagendado de 15/05 para 27/05 a pedido da ADM. Confirmar com Diogo.', 'takeup', '2026-05-27', '14:00', analysis_data[IDX_REAGEND]['id'], contract_ids['AG-26769/10']),
  ('Aprovacao HVI pendente - 3 analises', 'AG-27629, AG-27631 e AG-27573 aguardam aprovacao HVI urgente.', 'analise', '2026-05-23', None, None, None),
  ('Reuniao Laferlins - Revisao contratos Mai/26', 'Revisao mensal de contratos ativos com equipe.', 'outro', '2026-05-30', '08:00', None, None),
  ('Entrega docs embarque AG-27519/10', 'BL e documentos de exportacao para ADM International.', 'entrega', '2026-05-23', '15:00', None, contract_ids['AG-27519/10']),
]
for i, (title, desc, etype, sdate, stime, rel_an, rel_ct) in enumerate(agendas, 1):
    eid = f'A0000000-0000-0000-{i:04d}-000000000000'
    time_v = f"'{stime}'" if stime else 'NULL'
    an_v = f"'{rel_an}'" if rel_an else 'NULL'
    ct_v = f"'{rel_ct}'" if rel_ct else 'NULL'
    e(f"INSERT INTO agenda_entries (id, title, description, entry_type, scheduled_date, scheduled_time, status, related_analysis_id, related_contract_id, created_by)")
    e(f"VALUES ('{eid}', {q(title)}, {q(desc)}, '{etype}', '{sdate}', {time_v}, 'pendente', {an_v}, {ct_v}, '{GABRIELA}');")
e()

e("-- NOTIFICATIONS")
notifs = [
    ('hvi_pendente', 'HVI pendente: AG-27629/10 Nov/25', 'HVI recebido em 19/05 aguarda aprovacao. Parcela Nov/25 (1.250t).', False),
    ('hvi_pendente', 'HVI pendente: AG-27631/10 Out/25', 'HVI recebido em 15/05 aguarda aprovacao. Parcela Out/25 (1.250t).', False),
    ('hvi_pendente', 'HVI pendente: AG-27573/10 Set/25', 'HVI recebido em 21/05. Laudo do laboratorio em analise.', False),
    ('takeup_pendente', 'TakeUp amanha: AG-26657/10 Dez/25', 'TakeUp de 1.250t com OLAM em 28/05. Equipe: Alice e Amanda.', False),
    ('takeup_pendente', 'TakeUp em 2 dias: AG-27624/10 Nov/25', 'TakeUp de 1.000t com Paul Reinhart em 29/05. Resp.: Raphaela.', False),
    ('takeup_pendente', 'TakeUp reagendado amanha: AG-26769/10', 'TakeUp reagendado para 27/05. Confirmar disponibilidade com Diogo.', True),
    ('parcela_vencendo', 'Parcela vencendo: AG-27148/10 Nov/25', 'Parcela de 1.000t vence em 15/12. HVI aprovado, TakeUp nao agendado.', False),
    ('geral', 'Analise interrompida: AG-26822/10', 'HVI reprovado em mar/26. Micronaire fora do padrao. Lote devolvido.', True),
    ('geral', 'Nova analise criada: AG-27661/10 Set/25', 'Analise Ago/25 aguardando HVI da VITERRA.', True),
    ('alerta_prazo', '3 HVIs aguardam aprovacao', 'AG-27629, AG-27631 e AG-27573 com HVI pendente a mais de 2 dias uteis.', False),
]
for ntype, title, msg, is_read in notifs:
    e(f"INSERT INTO notifications (user_id, title, message, type, is_read)")
    e(f"VALUES ('{GABRIELA}', {q(title)}, {q(msg)}, '{ntype}', {str(is_read).lower()});")
e()

e("-- ================================================================")
e("-- Seed completo!")
e("-- Login: gabriela@laferlins.com.br / senha123")
e("-- 22 contratos, " + str(inst_seq-1) + " parcelas, " + str(len(analysis_data)) + " analises")
e("-- ================================================================")

output = "\n".join(lines)
with open(r'supabase\seed.sql', 'w', encoding='utf-8') as f:
    f.write(output)
print(f"OK: {len(lines)} linhas, {len(output)} chars")
