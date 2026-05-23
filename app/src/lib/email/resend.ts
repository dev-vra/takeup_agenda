import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  return resend.emails.send({
    from: 'Laferlins <notificacoes@laferlins.com.br>',
    to,
    subject,
    html,
  })
}

export function buildNotificationEmail(title: string, message: string, actionUrl?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #1e3a5f; padding: 24px; text-align: center; }
    .header img { height: 48px; }
    .header h1 { color: #fff; font-size: 18px; margin: 8px 0 0; }
    .body { padding: 32px; }
    .body h2 { color: #1e3a5f; margin-top: 0; }
    .body p { color: #444; line-height: 1.6; }
    .btn { display: inline-block; background: #1e3a5f; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
    .footer { background: #f9f9f9; padding: 16px 32px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Laferlins — Agenda TakeUp</h1>
    </div>
    <div class="body">
      <h2>${title}</h2>
      <p>${message}</p>
      ${actionUrl ? `<a href="${actionUrl}" class="btn">Ver no sistema</a>` : ''}
    </div>
    <div class="footer">
      Você está recebendo este e-mail porque tem uma conta na plataforma Laferlins Agenda TakeUp.<br>
      Acesse o sistema para gerenciar suas notificações.
    </div>
  </div>
</body>
</html>`
}
