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
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)));
        setLoading(false);
      },
      async (serverError: any) => {
        // Tenta extrair o caminho de forma ultra-segura para evitar crash no reporte do erro
        let path = 'users';
        try {
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
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}
