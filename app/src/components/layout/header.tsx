'use client'

import { NotificationBell } from './notification-bell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Profile } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  consultor: 'Consultor',
  leitor: 'Leitura',
}

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      setProfile({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Gabriela Ferreira',
        email: 'gabriela@laferlins.com.br',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      })
      return
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => { if (data) setProfile(data as Profile) })
      }
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.name
    ? profile.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      {title && (
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      )}
      <div className="flex items-center gap-3 ml-auto">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-slate-50 px-2 py-1 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {profile && (
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-slate-800 leading-none">{profile.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{ROLE_LABEL[profile.role]}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
              {profile?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
