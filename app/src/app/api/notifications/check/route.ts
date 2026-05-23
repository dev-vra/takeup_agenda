import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail, buildNotificationEmail } from '@/lib/email/resend'

// Called by Vercel Cron: every morning at 8am BRT
export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const notifications: {
    user_id: string
    title: string
    message: string
    type: string
    related_entity_type: string
    related_entity_id: string
    email_sent?: boolean
  }[] = []

  // Get all consultores/admins to notify
  const { data: users } = await supabase
    .from('profiles')
    .select('id,email,name')
    .in('role', ['admin', 'consultor'])

  if (!users?.length) return NextResponse.json({ notified: 0 })

  // 1. Installments vencendo em 7 dias
  const { data: vencendo } = await supabase
    .from('contract_installments')
    .select('id,contract:contract_id(contract_number,seller:seller_id(name))')
    .lte('due_date', in7Days)
    .gte('due_date', today)
    .gt('remaining_quantity', 0)

  for (const inst of (vencendo || [])) {
    for (const user of users) {
      notifications.push({
        user_id: user.id,
        title: 'Parcela Vencendo',
        message: `A parcela do contrato ${(inst as any).contract?.contract_number} vence em até 7 dias. Verifique o saldo pendente.`,
        type: 'parcela_vencendo',
        related_entity_type: 'installment',
        related_entity_id: inst.id,
      })
    }
  }

  // 2. TakeUps com data prevista hoje
  const { data: takeupHoje } = await supabase
    .from('analyses')
    .select('id,contract:contract_id(contract_number),takeup_responsible')
    .eq('takeup_scheduled_date', today)
    .in('status', ['takeup_agendado', 'takeup_reagendado'])

  for (const a of (takeupHoje || [])) {
    for (const user of users) {
      notifications.push({
        user_id: user.id,
        title: 'TakeUp Hoje',
        message: `TakeUp previsto para hoje no contrato ${(a as any).contract?.contract_number}. Resp: ${a.takeup_responsible || '—'}`,
        type: 'takeup_pendente',
        related_entity_type: 'analysis',
        related_entity_id: a.id,
      })
    }
  }

  // 3. TakeUps com data prevista amanhã (aviso antecipado)
  const { data: takeupAmanha } = await supabase
    .from('analyses')
    .select('id,contract:contract_id(contract_number),takeup_responsible')
    .eq('takeup_scheduled_date', tomorrow)
    .in('status', ['takeup_agendado', 'takeup_reagendado'])

  for (const a of (takeupAmanha || [])) {
    for (const user of users) {
      notifications.push({
        user_id: user.id,
        title: 'TakeUp Amanhã',
        message: `TakeUp previsto para amanhã no contrato ${(a as any).contract?.contract_number}. Resp: ${a.takeup_responsible || '—'}`,
        type: 'takeup_pendente',
        related_entity_type: 'analysis',
        related_entity_id: a.id,
      })
    }
  }

  // 4. TakeUps em atraso (data passou e status não mudou)
  const { data: takeupAtrasado } = await supabase
    .from('analyses')
    .select('id,contract:contract_id(contract_number),takeup_scheduled_date,takeup_responsible')
    .lt('takeup_scheduled_date', today)
    .in('status', ['takeup_agendado', 'takeup_reagendado'])

  for (const a of (takeupAtrasado || [])) {
    for (const user of users) {
      notifications.push({
        user_id: user.id,
        title: 'TakeUp em Atraso',
        message: `TakeUp do contrato ${(a as any).contract?.contract_number} estava previsto para ${(a as any).takeup_scheduled_date} e ainda não foi atualizado.`,
        type: 'takeup_atrasado',
        related_entity_type: 'analysis',
        related_entity_id: a.id,
      })
    }
  }

  // 5. HVI aguardando aprovação
  const { data: hviPendente } = await supabase
    .from('analyses')
    .select('id,contract:contract_id(contract_number),hvi_received_date,hvi_responsible')
    .eq('status', 'aguardando_aprovacao_hvi')
    .lte('hvi_received_date', yesterday)

  for (const a of (hviPendente || [])) {
    for (const user of users) {
      notifications.push({
        user_id: user.id,
        title: 'HVI Aguardando Aprovação',
        message: `HVI do contrato ${(a as any).contract?.contract_number} recebido em ${(a as any).hvi_received_date} ainda aguarda aprovação.`,
        type: 'hvi_pendente',
        related_entity_type: 'analysis',
        related_entity_id: a.id,
      })
    }
  }

  // Insert all notifications
  if (notifications.length > 0) {
    await supabase.from('notifications').insert(
      notifications.map(n => ({ ...n, email_sent: false }))
    )
  }

  // Send emails (one per user, grouped)
  for (const user of users) {
    const userNotifs = notifications.filter(n => n.user_id === user.id)
    if (!userNotifs.length) continue

    try {
      const html = buildNotificationEmail(
        `${userNotifs.length} notificação(ões) — Laferlins Agenda TakeUp`,
        userNotifs.map(n => `<strong>${n.title}</strong>: ${n.message}`).join('<br><br>'),
        `${process.env.NEXT_PUBLIC_APP_URL}/agenda`
      )
      await sendEmail({ to: user.email, subject: `[Laferlins] ${userNotifs.length} alerta(s) operacional(is)`, html })
    } catch (e) {
      console.error(`Email error for ${user.email}:`, e)
    }
  }

  return NextResponse.json({ notified: notifications.length })
}
