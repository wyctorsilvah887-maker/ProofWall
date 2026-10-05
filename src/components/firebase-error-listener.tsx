'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    errorEmitter.on('permission-error', (error: FirestorePermissionError) => {
      // Em desenvolvimento, lançamos o erro para que o Next.js exiba o overlay rico com o contexto das regras
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // Em produção, exibimos um toast amigável
        toast({
          variant: 'destructive',
          title: 'Erro de Permissão',
          description: 'Não foi possível salvar os dados devido a restrições de segurança.',
        });
      }
    });
  }, []);

  return null;
}
