'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import type { Analysis } from '@/types'

const TONS_DATA = [
  { mes: 'dez/25', tons: 1820 },
  { mes: 'jan/26', tons: 2240 },
  { mes: 'fev/26', tons: 1960 },
  { mes: 'mar/26', tons: 2700 },
  { mes: 'abr/26', tons: 3150 },
  { mes: 'mai/26', tons: 2890 },
]

const STATUS_COLORS: Record<string, string> = {
  aguardando_hvi: '#94a3b8',
  aguardando_aprovacao_hvi: '#3b82f6',
  hvi_aprovado: '#8b5cf6',
  takeup_agendado: '#f59e0b',
  takeup_reagendado: '#f97316',
}

const STATUS_LABELS: Record<string, string> = {
  aguardando_hvi: 'Ag. HVI',
  aguardando_aprovacao_hvi: 'HVI em Análise',
  hvi_aprovado: 'HVI Aprovado',
  takeup_agendado: 'TakeUp Ag.',
  takeup_reagendado: 'Reagendado',
}

interface DashboardChartsProps {
  openAnalyses: Analysis[]
}

export function DashboardCharts({ openAnalyses }: DashboardChartsProps) {
  const statusCounts = openAnalyses.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCounts)
    .filter(([key]) => key in STATUS_LABELS)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key] ?? key,
      value,
      color: STATUS_COLORS[key] ?? '#cbd5e1',
    }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bar chart: tons aprovadas */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Toneladas Aprovadas — Últimos 6 Meses</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={TONS_DATA} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
              formatter={(v) => [`${v}t`, 'Toneladas']}
            />
            <Bar dataKey="tons" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart: status das análises */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Análises em Aberto por Status</p>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
            Nenhuma análise em aberto
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
