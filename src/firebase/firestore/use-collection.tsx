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
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)));
        setLoading(false);
      },
      async (err: any) => {
        setError(err);
        if (err.code === 'permission-denied') {
          let path = 'unknown-collection';
          try {
            const internalQuery = (query as any)._query || query;
            if (internalQuery.path && internalQuery.path.segments) {
              path = internalQuery.path.segments.join('/');
            } else if (typeof (query as any).path === 'string') {
              path = (query as any).path;
            }
          } catch (e) {
            path = 'error-resolving-path';
          }

          const permissionError = new FirestorePermissionError({
            path: `/${path}`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          
          errorEmitter.emit('permission-error', permissionError);
        } else if (err.code === 'failed-precondition' && err.message.includes('requires an index')) {
          console.error("FALTA ÍNDICE NO FIRESTORE:", err.message);
          console.warn("Clique no link acima para criar o índice necessário.");
        } else {
          console.error("Firestore useCollection Error:", err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
