'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'
import { formatDate } from '@/lib/utils/date-format'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  alerta_prazo: 'Prazo',
  hvi_pendente: 'HVI Pendente',
  takeup_pendente: 'TakeUp Pendente',
  takeup_atrasado: 'TakeUp Atrasado',
  parcela_vencendo: 'Parcela',
  geral: 'Geral',
}

const TYPE_COLORS: Record<string, string> = {
  alerta_prazo: 'bg-orange-100 text-orange-700',
  hvi_pendente: 'bg-blue-100 text-blue-700',
  takeup_pendente: 'bg-purple-100 text-purple-700',
  takeup_atrasado: 'bg-red-100 text-red-700',
  parcela_vencendo: 'bg-yellow-100 text-yellow-700',
  geral: 'bg-slate-100 text-slate-700',
}

export function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      const { MOCK_NOTIFICATIONS } = await import('@/lib/mock-data')
      setNotifications(MOCK_NOTIFICATIONS as Notification[])
      return
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data as Notification[])
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return
    const unread = notifications.filter(n => !n.is_read).map(n => n.id)
    if (!unread.length) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unread)
  }

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  return (
    <Popover open={open} onOpenChange={o => { setOpen(o); if (o) fetchNotifications() }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-slate-500">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors',
                    !n.is_read && 'bg-blue-50/50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    )}
                    <div className={cn('flex-1', n.is_read && 'pl-3.5')}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          TYPE_COLORS[n.type] || TYPE_COLORS.geral
                        )}>
                          {TYPE_LABELS[n.type] || 'Geral'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
