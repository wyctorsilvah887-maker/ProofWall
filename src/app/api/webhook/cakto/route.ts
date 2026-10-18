
import { NextResponse } from 'next/server';

/**
 * Endpoint de Webhook para Cakto.
 * Nota: Como este ambiente prioriza o Firebase no lado do cliente, este webhook 
 * serve como um log de eventos. Para atualizações de banco de dados seguras aqui, 
 * seria necessário o Firebase Admin SDK (firebase-admin).
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Log do evento para fins de debug no console do servidor
    console.log('--- CAKTO WEBHOOK EVENT ---');
    console.log('Status:', payload.status);
    console.log('Email Cliente:', payload.customer_email);
    console.log('ID Externo (UID):', payload.external_id);
    console.log('Produto:', payload.product_name);
    console.log('---------------------------');

    // Aqui você validaria o segredo do webhook da Cakto (se houver)
    // E usaria o Firebase Admin para atualizar o Firestore via Server-Side.
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Erro no processamento do Webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
