'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CalendarDays, FileText, History, BarChart3, ClipboardList,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { href: '/agenda', label: 'Agenda Operacional', icon: CalendarDays },
  { href: '/contratos', label: 'Contratos', icon: BarChart3 },
  { href: '/analises', label: 'Análises', icon: ClipboardList },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/historico', label: 'Histórico', icon: History },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-white text-slate-700 transition-all duration-300 border-r border-slate-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-200 px-4 shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        {/* Leaf/Plant SVG icon */}
        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <rect width="32" height="32" rx="8" fill="#16a34a" />
            <path
              d="M16 26c0 0-8-5-8-13a8 8 0 0 1 16 0c0 8-8 13-8 13z"
              fill="white"
              fillOpacity="0.9"
            />
            <line x1="16" y1="26" x2="16" y2="14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 20 Q12 17 12 13" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M16 18 Q20 15 20 11" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 leading-none">Laferlins</p>
            <p className="text-xs text-slate-500 mt-0.5">Agenda TakeUp</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          const item = (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          }
          return item
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-200 py-3 px-2 space-y-0.5 shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4 shrink-0" />
            : <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Recolher</span>
              </>
          }
        </button>
      </div>
    </aside>
  )
}
