'use client';

import { useEffect, useState } from 'react';
import { 
  onSnapshot, 
  Query, 
  QuerySnapshot, 
  DocumentData,
  collection,
  query as firestoreQuery
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
      async (error: any) => {
        // Tenta extrair um caminho legível da query para o erro
        const path = (query as any)._query?.path?.segments?.join('/') || 'coleção desconhecida';
        
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
