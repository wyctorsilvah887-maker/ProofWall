
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Endpoint de Webhook para Cakto (Versão Individual JSON).
 * Registra eventos de pagamento (cancelamentos, aprovações) no Firestore para auditoria admin.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { firestore } = initializeFirebase();

    // Extraindo dados conforme o modelo enviado pela Cakto (Individual)
    const eventType = payload.event || 'unknown_event';
    const data = payload.data || {};
    
    const customerEmail = data.customer?.email || 'unknown@email.com';
    const status = data.status || eventType; // Usa o status ou o próprio nome do evento
    const productName = data.product?.name || 'Plano Proova';
    const externalId = data.external_id || data.refId || 'unknown'; // UID que enviamos no ext_id

    // Log para depuração no console do servidor
    console.log('--- CAKTO WEBHOOK EVENT ---');
    console.log('Evento:', eventType);
    console.log('Status Real:', status);
    console.log('Email Cliente:', customerEmail);
    console.log('ID Externo (UID):', externalId);
    console.log('---------------------------');

    // Registra o evento no Firestore para o Painel Admin
    await addDoc(collection(firestore, 'payment_events'), {
      externalId: externalId,
      customerEmail: customerEmail,
      status: status,
      productName: productName,
      eventType: eventType,
      payload: payload, // Salva o JSON completo para auditoria profunda se necessário
      createdAt: serverTimestamp()
    });
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Erro no processamento do Webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
