import pw from '/opt/node22/lib/node_modules/playwright/index.js'
const { chromium } = pw
import fs from 'node:fs'

const BASE = process.env.BASE || 'https://takeup-agenda.vercel.app'
const EMAIL = process.env.EMAIL || 'admin@admin.com'
const PASS = process.env.PASS || 'aQ!@#456'
const OUT = new URL('./shots/', import.meta.url).pathname

const log = (...a) => console.log('[cap]', ...a)
const shots = []

async function snap(page, name, label) {
  const file = `${OUT}${name}.png`
  await page.waitForTimeout(1200)
  await page.screenshot({ path: file, fullPage: true })
  shots.push({ name, label, file: `shots/${name}.png` })
  log('shot', name)
}

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR', ignoreHTTPSErrors: true })
const page = await ctx.newPage()
page.setDefaultTimeout(25000)

try {
  // 1. Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await snap(page, '01-login', 'Tela de Login')

  // fill + submit
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASS)
  await snap(page, '02-login-filled', 'Login preenchido')
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click('button[type="submit"]'),
  ]).catch(() => {})
  await page.waitForTimeout(2500)
  log('after login url:', page.url())
  await snap(page, '03-dashboard', 'Dashboard / Página inicial')

  const routes = [
    ['agenda', '04-agenda', 'Agenda — listagem'],
    ['agenda/nova', '05-agenda-nova', 'Agenda — novo evento'],
    ['contratos', '06-contratos', 'Contratos — listagem'],
    ['contratos/importar', '07-contratos-importar', 'Contratos — importação'],
    ['analises', '08-analises', 'Análises — listagem'],
    ['analises/nova', '09-analises-nova', 'Análises — nova análise'],
    ['relatorios', '10-relatorios', 'Relatórios — listagem'],
    ['relatorios/gerar', '11-relatorios-gerar', 'Relatórios — gerar'],
    ['relatorios/builder', '12-relatorios-builder', 'Relatórios — construtor'],
    ['historico', '13-historico', 'Histórico'],
    ['admin/usuarios', '14-usuarios', 'Gestão de Usuários'],
  ]

  for (const [path, name, label] of routes) {
    try {
      await page.goto(`${BASE}/${path}`, { waitUntil: 'networkidle' })
      await snap(page, name, label)
    } catch (e) {
      log('FAIL', path, e.message)
    }
  }

  // Open "Novo Usuário" dialog
  try {
    await page.goto(`${BASE}/admin/usuarios`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.click('button:has-text("Novo Usuário")')
    await page.waitForTimeout(800)
    await snap(page, '15-usuario-novo-dialog', 'Gestão de Usuários — formulário Novo Usuário')
  } catch (e) { log('dialog fail', e.message) }

} catch (e) {
  log('FATAL', e.message)
} finally {
  fs.writeFileSync(`${OUT}index.json`, JSON.stringify(shots, null, 2))
  log('total shots:', shots.length)
  await browser.close()
}
