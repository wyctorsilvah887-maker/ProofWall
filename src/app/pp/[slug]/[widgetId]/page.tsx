
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
  onSnapshot
} from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User, Loader2, MessageSquare, ShieldCheck, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PublicPage({ params }: { params: Promise<{ slug: string, widgetId: string }> }) {
  const { slug, widgetId } = use(params);
  const db = useFirestore();

  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [widgetData, setWidgetData] = useState<any>(null);
  const [allTestimonials, setAllTestimonials] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function findCompany() {
      if (!db || !slug) return;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('companySlug', '==', slug), limit(1));
        const userSnapshot = await getDocs(q);
        
        if (!userSnapshot.empty) {
          setTargetUserId(userSnapshot.docs[0].id);
          setCompanyData(userSnapshot.docs[0].data());
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Erro ao localizar empresa:", err);
        setIsLoading(false);
      }
    }
    findCompany();
  }, [db, slug]);

  useEffect(() => {
    if (!db || !targetUserId || !widgetId) return;

    const widgetRef = doc(db, 'users', targetUserId, 'widgets', widgetId);
    const unsubWidget = onSnapshot(widgetRef, (docSnap) => {
      if (docSnap.exists()) {
        setWidgetData(docSnap.data());
        setIsLoading(false);
      } else {
        setWidgetData(null);
        setIsLoading(false);
      }
    });

    const testimonialsRef = collection(db, 'users', targetUserId, 'testimonials');
    const tQuery = query(testimonialsRef, where('status', '==', 'approved'));
    const unsubTestimonials = onSnapshot(tQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTestimonials(docs);
    });

    return () => {
      unsubWidget();
      unsubTestimonials();
    };
  }, [db, targetUserId, widgetId]);

  const filteredTestimonials = useMemo(() => {
    if (!widgetData || !allTestimonials.length) return [];
    const selectedIds = widgetData.selectedTestimonialIds || [];
    return allTestimonials.filter(t => selectedIds.includes(t.id));
  }, [widgetData, allTestimonials]);

  const layout = widgetData?.layout || 'mural';
  const themeColor = widgetData?.themeColor || '#f97316';

  useEffect(() => {
    if ((layout === 'carousel' || layout === 'popup') && filteredTestimonials.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [layout, filteredTestimonials]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium animate-pulse">Sincronizando Provas Sociais...</p>
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

  const TestimonialCard = ({ t, isPopup = false }: { t: any, isPopup?: boolean }) => (
    <Card className={cn(
      "break-inside-avoid border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-background group animate-in fade-in slide-in-from-bottom-4",
      isPopup ? "max-w-md border-l-4" : "border-t-4"
    )} style={{ 
      borderTopColor: !isPopup ? themeColor : 'transparent',
      borderLeftColor: isPopup ? themeColor : 'transparent',
      borderTopWidth: !isPopup ? '4px' : '0',
      borderLeftWidth: isPopup ? '4px' : '0',
      borderStyle: 'solid'
    }}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" style={{ color: themeColor, fill: themeColor }} />
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
          <div className="bg-primary/5 p-2 rounded-full group-hover:bg-primary/10 transition-colors" style={{ backgroundColor: `${themeColor}10` }}>
            <User className="w-5 h-5" style={{ color: themeColor }} />
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
  );

  return (
    <div className="min-h-screen bg-muted/10 font-body pb-20">
      <header className="bg-background border-b py-12 px-4 shadow-sm relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-32 h-32" style={{ color: themeColor }} />
        </div>
        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4 py-1 text-xs uppercase tracking-widest font-bold" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
            Social Proof by Proova
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-gray-900">
            O que dizem sobre <span style={{ color: themeColor }}>{companyData.companyName}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {widgetData.name} — Experiências reais de clientes satisfeitos.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-12">
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-3xl border-2 border-dashed">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Aguardando a seleção de depoimentos para este mural.</p>
          </div>
        ) : (
          <>
            {layout === 'mural' && (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredTestimonials.map((t) => (
                  <TestimonialCard key={t.id} t={t} />
                ))}
              </div>
            )}

            {layout === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map((t) => (
                  <TestimonialCard key={t.id} t={t} />
                ))}
              </div>
            )}

            {layout === 'carousel' && (
              <div className="flex flex-col items-center gap-8 py-10">
                <div className="relative w-full max-w-2xl flex items-center justify-center gap-4">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCurrentIndex(prev => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length)}
                    className="rounded-full shadow-lg bg-background"
                  >
                    <ChevronLeft />
                  </Button>
                  
                  <div className="w-full animate-in slide-in-from-right-8 fade-in duration-500" key={filteredTestimonials[currentIndex].id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} />
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length)}
                    className="rounded-full shadow-lg bg-background"
                  >
                    <ChevronRight />
                  </Button>
                </div>
                <div className="flex gap-2">
                  {filteredTestimonials.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        i === currentIndex ? "w-6" : "opacity-20"
                      )}
                      style={{ backgroundColor: themeColor }}
                    />
                  ))}
                </div>
              </div>
            )}

            {layout === 'popup' && (
              <div className="flex flex-col items-center justify-center min-h-[400px] py-10 relative">
                <div className="text-center mb-12 space-y-2">
                  <Badge variant="outline" className="px-4" style={{ color: themeColor, borderColor: `${themeColor}40` }}>Modo Notificação VIP</Badge>
                  <p className="text-sm text-muted-foreground italic">Simulando a exibição de popups na sua Página Pública.</p>
                </div>
                
                <div 
                  key={filteredTestimonials[currentIndex].id}
                  className="animate-in slide-in-from-bottom-12 fade-in duration-1000 ease-out"
                >
                  <TestimonialCard t={filteredTestimonials[currentIndex]} isPopup />
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest animate-pulse" style={{ color: themeColor }}>
                  <Zap className="w-4 h-4" /> Próximo em instantes...
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-20 py-10 border-t bg-background text-center space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-medium">Conheça a</span>
              <span className="font-headline font-bold text-2xl tracking-tighter text-primary">Proova</span>
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-primary-foreground text-sm font-bold hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: themeColor }}
            >
              Conhecer a Proova <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
