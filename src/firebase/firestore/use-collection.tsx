'use client';

import { useEffect, useState } from 'react';
import { 
  onSnapshot, 
  Query, 
  DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // O onSnapshot do Firestore é o melhor lugar para capturar erros de permissão de listagem
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)));
        setLoading(false);
      },
      (error: any) => {
        // Se a permissão for negada, emitimos o erro contextual
        if (error.code === 'permission-denied') {
          // Tenta extrair o caminho da coleção de forma segura
          let path = 'users';
          try {
            // Acessa a propriedade interna do SDK para diagnóstico do caminho
            const internalQuery = (query as any)._query || query;
            if (internalQuery.path) {
              path = internalQuery.path.segments.join('/');
            }
          } catch (e) {
            path = 'users';
          }

          const permissionError = new FirestorePermissionError({
            path: `/${path}`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          
          errorEmitter.emit('permission-error', permissionError);
        } else {
          console.error("Firestore useCollection Error:", error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}