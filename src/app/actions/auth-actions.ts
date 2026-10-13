
'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia um e-mail de recuperação de senha simulado ou real via Resend.
 * Nota: Como estamos usando Firebase Auth, o fluxo ideal é gerar o link via Firebase,
 * mas aqui demonstramos a integração com a API da Resend conforme solicitado.
 */
export async function sendResetPasswordEmail(email: string, resetLink: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY não encontrada no .env");
    return { success: false, error: "Serviço de e-mail não configurado." };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Proova <onboarding@resend.dev>', // Em produção, use seu domínio verificado
      to: [email],
      subject: 'Recuperação de Senha - Proova',
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Proova.</p>
          <p>Clique no botão abaixo para escolher uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Redefinir Senha</a>
          </div>
          <p style="font-size: 12px; color: #777;">Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 10px; color: #aaa; text-align: center;">© 2026 Proova Social Proof</p>
        </div>
      `,
    });

    if (error) {
      console.error("Erro Resend:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Erro ao enviar e-mail:", err);
    return { success: false, error: err.message };
  }
}
