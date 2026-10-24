
'use server';

import { headers } from 'next/headers';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment, getDoc, arrayUnion } from 'firebase/firestore';
import { Resend } from 'resend';

/**
 * Verifica o limite de requisições no Firestore.
 */
async function checkRateLimit(actionName: string) {
  const { firestore } = initializeFirebase();
  const headerList = await headers();
  const ip = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
  
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const rateLimitRef = collection(firestore, 'rate_limits');
  
  const q = query(
    rateLimitRef,
    where('ip', '==', ip),
    where('action', '==', actionName),
    where('createdAt', '>', Timestamp.fromDate(oneMinuteAgo))
  );
  
  const snap = await getDocs(q);
  
  if (snap.size >= 10) {
    throw new Error('Limite de envios excedido. Tente novamente em instantes.');
  }

  await addDoc(rateLimitRef, {
    ip,
    action: actionName,
    createdAt: serverTimestamp()
  });
}

/**
 * Envia um alerta de feedback crítico para o dono do negócio.
 */
async function sendCriticalFeedbackAlert(ownerEmail: string, feedbackData: any, companyName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !ownerEmail) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Proova Alerts <proova@proova.wsstudioscompany.com.br>',
      to: [ownerEmail],
      subject: `⚠️ Feedback Crítico Recebido - ${companyName}`,
      html: `
        <div style="font-family: sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Alerta de Reputação</h1>
          </div>
          <div style="padding: 30px;">
            <p>Olá,</p>
            <p>Você recebeu um novo feedback de <strong>${feedbackData.rating} estrelas</strong> no seu Inbox Privado.</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <p style="margin: 0; font-style: italic;">"${feedbackData.text}"</p>
              <p style="margin-top: 15px; font-size: 13px; color: #6b7280;">— ${feedbackData.userName} (${feedbackData.userEmail || 'E-mail não informado'})</p>
            </div>
            <p>Recomendamos entrar em contato com o cliente para resolver a situation antes que ela se torne uma reclamação pública.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://proova.wsstudioscompany.com.br'}/private" style="background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver no Painel Proova</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Erro ao enviar e-mail de alerta:", err);
  }
}

/**
 * Salva um depoimento com Rate Limit de 10 por minuto e executa Sincronização Automática em Widgets.
 */
export async function submitTestimonialAction(data: {
  targetUserId: string;
  destination: 'public' | 'private';
  userName: string;
  userEmail: string;
  rating: number;
  text: string;
}) {
  try {
    await checkRateLimit('submit_testimonial');
    
    const { firestore } = initializeFirebase();
    
    const testimonialData = {
      userName: data.userName.trim(),
      userEmail: data.userEmail.trim().toLowerCase(),
      rating: data.rating,
      text: data.text.trim(),
      status: 'approved',
      createdAt: serverTimestamp(),
    };

    const collectionName = data.destination === 'public' ? 'testimonials' : 'private_feedbacks';
    const feedbacksRef = collection(firestore, 'users', data.targetUserId, collectionName);

    const docRef = await addDoc(feedbacksRef, testimonialData);
    const testimonialId = docRef.id;
    
    // Incrementa o contador do usuário
    const userRef = doc(firestore, 'users', data.targetUserId);
    await updateDoc(userRef, {
      testimonialsCount: increment(1)
    });

    // Se for um feedback privado (crítico), envia alerta por e-mail para o dono
    if (data.destination === 'private' || data.rating <= 3) {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await sendCriticalFeedbackAlert(userData.email, testimonialData, userData.companyName);
      }
    }

    // --- LÓGICA DE SINCRONIZAÇÃO AUTOMÁTICA (AUTO-PUBLISH) ---
    if (data.destination === 'public') {
      const widgetsRef = collection(firestore, 'users', data.targetUserId, 'widgets');
      const q = query(widgetsRef, where('autoPublishEnabled', '==', true));
      const widgetsSnap = await getDocs(q);

      const updatePromises = widgetsSnap.docs.map(async (wDoc) => {
        const widget = wDoc.data();
        const minRating = widget.autoPublishMinRating || 5;
        const minChars = widget.autoPublishMinChars || 0;

        if (testimonialData.rating >= minRating && testimonialData.text.length >= minChars) {
          await updateDoc(wDoc.ref, {
            selectedTestimonialIds: arrayUnion(testimonialId)
          });
        }
      });

      await Promise.all(updatePromises);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Testimonial Submission Error:", error.message);
    return { success: false, error: error.message };
  }
}
