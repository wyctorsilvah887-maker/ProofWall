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
      async (serverError: any) => {
        // Tenta extrair um caminho amigável da query para o log de erro
        const pathSegments = (query as any)._query?.path?.segments || [];
        const path = pathSegments.length > 0 ? pathSegments.join('/') : 'unknown_collection';
        
        const permissionError = new FirestorePermissionError({
          path: `/${path}`,
          operation: 'list',
        } satisfies SecurityRuleContext);
        
        // Emite o erro contextual para o listener central
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}