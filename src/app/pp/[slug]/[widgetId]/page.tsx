
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
      const intervalId = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [layout, filteredTestimonials]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 px-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium animate-pulse">Sincronizando Provas Sociais...</p>
        </div>
      </div>
    );
  }

  if (!companyData || !widgetData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full text-center p-8 border-none shadow-xl">
          <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold font-headline mb-2">Página não encontrada</h1>
          <p className="text-sm text-muted-foreground">O link acessado é inválido ou o mural não está mais disponível.</p>
        </Card>
      </div>
    );
  }

  const TestimonialCard = ({ t, isPopup = false, index = 0 }: { t: any, isPopup?: boolean, index?: number }) => (
    <Card 
      className={cn(
        "break-inside-avoid border-none shadow-lg transition-all duration-700 bg-background group",
        "hover:-translate-y-2 hover:shadow-2xl hover:ring-2",
        isPopup ? "max-w-[calc(100vw-2rem)] sm:max-w-md border-l-4" : "border-t-4 mb-6",
        "animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
      )} 
      style={{ 
        borderTopColor: !isPopup ? themeColor : 'transparent',
        borderLeftColor: isPopup ? themeColor : 'transparent',
        borderTopWidth: !isPopup ? '4px' : '0',
        borderLeftWidth: isPopup ? '4px' : '0',
        borderStyle: 'solid',
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'both',
        boxShadow: `0 10px 30px -15px ${themeColor}40`,
        // @ts-ignore
        "--tw-ring-color": `${themeColor}20`
      }}
    >
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:scale-110" style={{ color: themeColor, fill: themeColor }} />
            ))}
          </div>
          <Badge variant="outline" className="text-[8px] md:text-[9px] bg-green-50 text-green-600 border-green-200 px-1.5 md:px-2">
            <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
          </Badge>
        </div>
        <blockquote className="text-sm md:text-base text-gray-700 leading-relaxed italic group-hover:text-gray-900 transition-colors">
          "{t.text}"
        </blockquote>
        <div className="flex items-center gap-3 pt-3 md:pt-4 border-t border-muted/50">
          <div className="bg-primary/5 p-1.5 md:p-2 rounded-full group-hover:rotate-12 transition-transform" style={{ backgroundColor: `${themeColor}10` }}>
            <User className="w-4 h-4 md:w-5 md:h-5" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="font-bold text-xs md:text-sm text-gray-900">{t.userName}</p>
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Cliente Recente'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/10 font-body pb-12 md:pb-20">
      <header className="bg-background border-b py-12 md:py-24 px-4 shadow-sm relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-32 h-32 md:w-48 md:h-48" style={{ color: themeColor }} />
        </div>
        <div className="absolute -bottom-24 -left-24 p-4 opacity-[0.03] pointer-events-none">
          <MessageSquare className="w-64 h-64 md:w-96 md:h-96" style={{ color: themeColor }} />
        </div>
        
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 relative z-10">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4 md:px-6 py-1 md:py-1.5 text-[9px] md:text-xs uppercase tracking-[0.2em] font-black" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
            Social Proof by Proova
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-headline tracking-tighter text-gray-900 leading-[1] md:leading-[0.9]">
            O que dizem sobre <br className="hidden sm:block"/> <span className="underline decoration-4 md:decoration-8 underline-offset-4" style={{ textDecorationColor: `${themeColor}40` }}>{companyData.companyName}</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium px-4">
            {widgetData.name} — Experiências reais de clientes satisfeitos que confiam em nosso trabalho.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-16">
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 md:py-32 bg-background rounded-2xl md:rounded-[2rem] border-2 md:border-4 border-dashed border-muted px-4">
            <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/20 mx-auto mb-4 md:mb-6" />
            <p className="text-muted-foreground text-base md:text-lg font-bold">Aguardando a seleção de depoimentos para este mural.</p>
          </div>
        ) : (
          <>
            {layout === 'mural' && (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-8">
                {filteredTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id} t={t} index={i} />
                ))}
              </div>
            )}

            {layout === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id} t={t} index={i} />
                ))}
              </div>
            )}

            {layout === 'carousel' && (
              <div className="flex flex-col items-center gap-8 md:gap-12 py-8 md:py-16">
                <div className="relative w-full max-w-3xl flex items-center justify-center gap-2 md:gap-6">
                   <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentIndex(prev => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length)}
                    className="rounded-full shadow-lg bg-background h-10 w-10 md:h-14 md:w-14 border-none hover:scale-110 transition-transform shrink-0"
                  >
                    <ChevronLeft className="h-5 w-5 md:h-8 md:h-8" />
                  </Button>
                  
                  <div className="w-full min-w-0" key={filteredTestimonials[currentIndex].id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} index={0} />
                  </div>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length)}
                    className="rounded-full shadow-lg bg-background h-10 w-10 md:h-14 md:w-14 border-none hover:scale-110 transition-transform shrink-0"
                  >
                    <ChevronRight className="h-5 w-5 md:h-8 md:h-8" />
                  </Button>
                </div>
                <div className="flex gap-2 md:gap-3">
                  {filteredTestimonials.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        "h-1.5 md:h-2 rounded-full transition-all duration-500",
                        i === currentIndex ? "w-6 md:w-10" : "w-1.5 md:w-2 bg-gray-300 hover:bg-gray-400"
                      )}
                      style={{ backgroundColor: i === currentIndex ? themeColor : undefined }}
                    />
                  ))}
                </div>
              </div>
            )}

            {layout === 'popup' && (
              <div className="flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] py-12 md:py-20 relative px-4">
                <div className="text-center mb-8 md:mb-16 space-y-3 md:space-y-4">
                  <Badge variant="outline" className="px-4 md:px-6 py-0.5 md:py-1 text-xs font-bold tracking-widest" style={{ color: themeColor, borderColor: `${themeColor}40` }}>EXIBIÇÃO EM POPUP VIP</Badge>
                  <p className="text-xs md:text-sm text-muted-foreground italic font-medium">Os feedbacks aparecerão como notificações dinâmicas para seus usuários.</p>
                </div>
                
                <div 
                  key={filteredTestimonials[currentIndex].id}
                  className="animate-in slide-in-from-bottom-12 fade-in zoom-in duration-700 ease-out"
                >
                  <TestimonialCard t={filteredTestimonials[currentIndex]} isPopup index={0} />
                </div>
                
                <div className="mt-8 md:mt-12 flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] animate-pulse" style={{ color: themeColor }}>
                  <Zap className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Sincronizando próximo feedback...
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-16 md:mt-32 py-12 md:py-20 border-t bg-background text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-muted-foreground text-base md:text-lg font-medium">Conheça a</span>
              <span className="font-headline font-black text-3xl md:text-4xl tracking-tighter text-primary">Proova</span>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm max-w-sm">
              Transforme a satisfação dos seus clientes em sua ferramenta de vendas mais poderosa.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 md:gap-3 px-8 md:px-10 py-3 md:py-4 rounded-full text-primary-foreground text-base md:text-lg font-black hover:scale-105 transition-all shadow-xl"
              style={{ backgroundColor: themeColor }}
            >
              Conhecer a Proova <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

