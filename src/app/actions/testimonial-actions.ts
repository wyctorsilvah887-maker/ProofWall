'use server';

import { headers } from 'next/headers';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';

/**
 * Verifica o limite de requisições no Firestore.
 */
async function checkRateLimit(actionName: string) {
  const { firestore } = initializeFirebase();
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || 'unknown';
  
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
 * Salva um depoimento com Rate Limit de 10 por minuto.
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

    await addDoc(feedbacksRef, testimonialData);
    
    // Incrementa o contador do usuário
    const userRef = doc(firestore, 'users', data.targetUserId);
    await updateDoc(userRef, {
      testimonialsCount: increment(1)
    });

    return { success: true };
  } catch (error: any) {
    console.error("Testimonial Submission Error:", error.message);
    return { success: false, error: error.message };
  }
}
