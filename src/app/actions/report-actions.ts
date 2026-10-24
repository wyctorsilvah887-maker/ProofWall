'use server';

import { Resend } from 'resend';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, orderBy, limit } from 'firebase/firestore';

/**
 * @fileOverview Lógica para geração e envio de relatórios de performance via e-mail.
 */
export async function sendWeeklyPerformanceReport(userId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada.");
    return { success: false, error: "Serviço de e-mail indisponível no momento." };
  }

  const { firestore } = initializeFirebase();
  const resend = new Resend(apiKey);

  try {
    // 1. Buscar Dados do Usuário
    const userSnap = await getDoc(doc(firestore, 'users', userId));
    if (!userSnap.exists()) return { success: false, error: "Usuário não localizado." };
    const userData = userSnap.data();

    // 2. Definir Períodos (Semana Atual vs Anterior)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 3. Coletar Depoimentos da Semana Atual
    const testimonialsRef = collection(firestore, 'users', userId, 'testimonials');
    const qCurrent = query(
      testimonialsRef, 
      where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
    );
    const currentSnap = await getDocs(qCurrent);
    const currentCount = currentSnap.size;

    // 4. Coletar Depoimentos da Semana Anterior
    const qPrevious = query(
      testimonialsRef, 
      where('createdAt', '>=', Timestamp.fromDate(fourteenDaysAgo)),
      where('createdAt', '<', Timestamp.fromDate(sevenDaysAgo))
    );
    const previousSnap = await getDocs(qPrevious);
    const previousCount = previousSnap.size;

    // 5. Calcular Crescimento
    let growth = 0;
    if (previousCount > 0) {
      growth = Math.round(((currentCount - previousCount) / previousCount) * 100);
    } else if (currentCount > 0) {
      growth = 100; // Crescimento de zero para algo
    }

    // 6. Identificar o Melhor Depoimento (Destaque)
    const qTop = query(
      testimonialsRef, 
      where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)), 
      orderBy('rating', 'desc'), 
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const topSnap = await getDocs(qTop);
    const topT = !topSnap.empty ? topSnap.docs[0].data() : null;

    // 7. Enviar E-mail via Resend
    const { data, error } = await resend.emails.send({
      from: 'Proova Reports <proova@proova.wsstudioscompany.com.br>',
      to: [userData.email],
      subject: `📊 Relatório de Performance: ${userData.companyName}`,
      html: `
        <div style="font-family: sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #f97316; padding: 48px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">Proova Analytics</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 14px; font-weight: 600;">Sua Prova Social em Números</p>
          </div>
          
          <div style="padding: 40px 32px;">
            <p style="font-size: 18px; color: #111827; font-weight: 700; margin-bottom: 8px;">Olá, ${userData.name.split(' ')[0]}!</p>
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 32px;">Seus clientes continuam espalhando confiança. Veja como foi o desempenho da <strong>${userData.companyName}</strong> nos últimos 7 dias:</p>
            
            <div style="background-color: #f9fafb; border-radius: 20px; padding: 32px; text-align: center; border: 1px solid #f3f4f6; margin-bottom: 32px;">
              <p style="margin: 0; font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Novos Depoimentos</p>
              <p style="margin: 12px 0; font-size: 48px; font-weight: 900; color: #111827;">${currentCount}</p>
              <div style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 99px; background-color: ${growth >= 0 ? '#ecfdf5' : '#fef2f2'};">
                <span style="font-size: 13px; font-weight: 800; color: ${growth >= 0 ? '#059669' : '#dc2626'};">
                  ${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)}% em relação à semana passada
                </span>
              </div>
            </div>

            ${topT ? `
              <div style="border-left: 4px solid #f97316; padding: 24px; background-color: #fff7ed; border-radius: 0 16px 16px 0; margin-bottom: 32px;">
                <p style="margin: 0 0 12px 0; font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase;">🏆 Destaque da Semana</p>
                <p style="margin: 0; font-size: 15px; color: #431407; font-style: italic; line-height: 1.6;">"${topT.text}"</p>
                <p style="margin: 12px 0 0 0; font-size: 13px; font-weight: 700; color: #9a3412;">— ${topT.userName}</p>
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://proova.wsstudioscompany.com.br'}/dash" 
                 style="background-color: #111827; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                Acessar Meu Painel Completo
              </a>
            </div>
          </div>
          
          <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0; font-weight: 600;">© 2026 PROOVA TECHNOLOGY. RELATÓRIO DE INTELIGÊNCIA.</p>
          </div>
        </div>
      `,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    console.error("Falha ao gerar relatório:", err);
    return { success: false, error: "Erro interno ao processar relatório." };
  }
}
