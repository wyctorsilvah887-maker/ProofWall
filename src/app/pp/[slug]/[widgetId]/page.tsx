
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User, Loader2, MessageSquare, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicPage({ params }: { params: Promise<{ slug: string, widgetId: string }> }) {
  const { slug, widgetId } = use(params);
  const db = useFirestore();

  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [widgetData, setWidgetData] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!db || !slug || !widgetId) return;

      try {
        setIsLoading(true);
        
        // 1. Encontrar a empresa pelo slug
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('companySlug', '==', slug), limit(1));
        const userSnapshot = await getDocs(q);
        
        if (userSnapshot.empty) {
          setIsLoading(false);
          return;
        }

        const userId = userSnapshot.docs[0].id;
        const userData = userSnapshot.docs[0].data();
        setCompanyData(userData);

        // 2. Buscar o widget específico
        const widgetRef = doc(db, 'users', userId, 'widgets', widgetId);
        const widgetSnap = await getDoc(widgetRef);
        
        if (!widgetSnap.exists()) {
          setIsLoading(false);
          return;
        }

        const wData = widgetSnap.data();
        setWidgetData(wData);

        // 3. Buscar depoimentos selecionados
        const selectedIds = wData.selectedTestimonialIds || [];
        if (selectedIds.length > 0) {
          const testimonialsRef = collection(db, 'users', userId, 'testimonials');
          const tQuery = query(testimonialsRef, where('status', '==', 'approved'));
          const tSnapshot = await getDocs(tQuery);
          
          const filtered = tSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter((t: any) => selectedIds.includes(t.id));
            
          setTestimonials(filtered);
        }
      } catch (err) {
        console.error("Erro ao carregar página pública:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [db, slug, widgetId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium animate-pulse">Carregando Provas Sociais...</p>
        </div>
      </div>
    );
  }

  if (!companyData || !widgetData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full text-center p-8 border-none shadow-xl">
          <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-headline mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground">O link acessado é inválido ou o mural não está mais disponível.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 font-body pb-20">
      {/* Header da Empresa */}
      <header className="bg-background border-b py-12 px-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-32 h-32 text-primary" />
        </div>
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4 py-1 text-xs uppercase tracking-widest font-bold">
            Social Proof by Proova
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-gray-900">
            O que dizem sobre <span className="text-primary">{companyData.companyName}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {widgetData.name} — Experiências reais de clientes satisfeitos.
          </p>
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center overflow-hidden">
                   <User className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-600">
              +{testimonials.length} Clientes Felizes
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-12">
        {testimonials.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-3xl border-2 border-dashed">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum depoimento selecionado para este mural ainda.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((t) => (
              <Card key={t.id} className="break-inside-avoid border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-background group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-green-50 text-green-600 border-green-200">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                    </Badge>
                  </div>
                  
                  <blockquote className="text-base text-gray-700 leading-relaxed italic">
                    "{t.text}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-muted/50">
                    <div className="bg-primary/5 p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.userName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Cliente Recente'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t bg-background text-center space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">
            Deseja coletar depoimentos assim para sua empresa?
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-medium">Conheça a</span>
              <span className="font-headline font-bold text-2xl tracking-tighter text-primary">Proova</span>
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors border border-primary/20"
            >
              Conhecer a Proova <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
