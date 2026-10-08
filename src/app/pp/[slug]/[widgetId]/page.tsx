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
import { Star, User, Loader2, MessageSquare, ShieldCheck, Zap, ArrowRight, MessageCircle } from 'lucide-react';
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
  const [muralIndex, setMuralIndex] = useState(0);

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
  const coverImageUrl = widgetData?.coverImageUrl || '';
  const whatsappEnabled = widgetData?.whatsappEnabled || false;
  const whatsappNumber = widgetData?.whatsappNumber || '';

  useEffect(() => {
    if ((layout === 'carousel' || layout === 'popup') && filteredTestimonials.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 3000);
      return () => clearInterval(intervalId);
    }
    
    if (layout === 'mural' && filteredTestimonials.length > 4) {
      const intervalId = setInterval(() => {
        setMuralIndex(prev => (prev + 4) % filteredTestimonials.length);
      }, 6000);
      return () => clearInterval(intervalId);
    }
  }, [layout, filteredTestimonials]);

  const visibleMuralTestimonials = useMemo(() => {
    if (layout !== 'mural') return filteredTestimonials;
    if (filteredTestimonials.length <= 4) return filteredTestimonials;
    
    const slice = [];
    for (let i = 0; i < 4; i++) {
      const idx = (muralIndex + i) % filteredTestimonials.length;
      slice.push(filteredTestimonials[idx]);
    }
    return slice;
  }, [filteredTestimonials, muralIndex, layout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando prova social...</p>
        </div>
      </div>
    );
  }

  if (!companyData || !widgetData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <Card className="w-full max-w-md text-center shadow-xl border-none">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="mx-auto bg-muted p-4 rounded-full w-fit">
              <MessageSquare className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline">Mural não encontrado</h2>
              <p className="text-muted-foreground">O link acessado é inválido ou a empresa não está cadastrada no sistema.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
          </CardContent>
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
        "animate-in fade-in zoom-in-95 slide-in-from-left-8"
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
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 p-1.5 md:p-2 rounded-full" style={{ backgroundColor: `${themeColor}10` }}>
                <User className="w-4 h-4 md:w-5 md:h-5" style={{ color: themeColor }} />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-bold text-xs md:text-sm text-gray-900 leading-tight mb-1 truncate">{t.userName}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 transition-transform group-hover:scale-110" style={{ color: themeColor, fill: themeColor }} />
                  ))}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-[8px] md:text-[9px] bg-green-50 text-green-600 border-green-200 px-1.5 md:px-2 shrink-0">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
            </Badge>
          </div>

          <blockquote className="text-sm md:text-base text-gray-700 leading-relaxed italic group-hover:text-gray-900 transition-colors pt-2">
            "{t.text}"
          </blockquote>

          <div className="pt-3 border-t border-muted/50 mt-2">
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Cliente Recente'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/10 font-body pb-12 md:pb-20 relative">
      <header className={cn(
        "bg-background border-b shadow-sm relative overflow-hidden text-center transition-all",
        coverImageUrl ? "pt-0 pb-12 md:pb-20" : "py-12 md:py-24 px-4"
      )}>
        {coverImageUrl && (
          <div className="w-full h-48 md:h-80 relative mb-8 md:mb-12">
            <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa da Empresa" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-32 h-32 md:w-48 md:h-48" style={{ color: themeColor }} />
        </div>
        <div className="absolute -bottom-24 -left-24 p-4 opacity-[0.03] pointer-events-none">
          <MessageSquare className="w-64 h-64 md:w-96 md:h-96" style={{ color: themeColor }} />
        </div>
        
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 relative z-10 px-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4 md:px-6 py-1 md:py-1.5 text-[9px] md:text-xs uppercase tracking-[0.2em] font-black" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
            Social Proof by Proova
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-headline tracking-tighter text-gray-900 leading-[1] md:leading-[0.9]">
            O que dizem sobre <br className="hidden sm:block"/> <span className="underline decoration-4 md:decoration-8 underline-offset-4" style={{ textDecorationColor: `${themeColor}40` }}>{companyData?.companyName}</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium px-4">
            {widgetData?.name} — Experiências reais de clientes satisfeitos que confiam em nosso trabalho.
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
              <div 
                key={muralIndex}
                className="columns-1 sm:columns-2 lg:columns-2 gap-4 md:gap-8 max-w-5xl mx-auto"
              >
                {visibleMuralTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id + i} t={t} index={i} />
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
                  <div className="w-full min-w-0" key={filteredTestimonials[currentIndex].id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} index={0} />
                  </div>
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
                <div 
                  key={filteredTestimonials[currentIndex].id}
                  className="animate-in slide-in-from-bottom-12 fade-in zoom-in duration-700 ease-out"
                >
                  <TestimonialCard t={filteredTestimonials[currentIndex]} isPopup index={0} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {whatsappEnabled && whatsappNumber && (
        <a 
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in zoom-in fade-in duration-500"
          title="Falar no WhatsApp"
        >
          <MessageCircle className="w-8 h-8 fill-current" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">1</span>
        </a>
      )}

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
