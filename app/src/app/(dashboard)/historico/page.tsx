import { redirect } from 'next/navigation'

export default function HistoricoPage() {
  redirect('/analises?view=history')
}
