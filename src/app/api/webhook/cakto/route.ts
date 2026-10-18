
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Endpoint de Webhook para Cakto.
 * Registra eventos de pagamento (cancelamentos, aprovações) no Firestore para auditoria admin.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { firestore } = initializeFirebase();

    // Log para depuração no console
    console.log('--- CAKTO WEBHOOK EVENT ---');
    console.log('Status:', payload.status);
    console.log('Email Cliente:', payload.customer_email);
    console.log('ID Externo (UID):', payload.external_id);
    console.log('---------------------------');

    // Registra o evento no Firestore para o Painel Admin
    await addDoc(collection(firestore, 'payment_events'), {
      externalId: payload.external_id || 'unknown',
      customerEmail: payload.customer_email || 'unknown',
      status: payload.status || 'unknown',
      productName: payload.product_name || 'unknown',
      payload: payload,
      createdAt: serverTimestamp()
    });
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Erro no processamento do Webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
