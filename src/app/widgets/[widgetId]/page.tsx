
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Star, 
  Eye,
  Settings,
  MessageSquare,
  Check,
  User,
  Zap,
  LayoutGrid,
  Columns,
  Play,
  Palette,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BellRing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

export default function WidgetEditPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const widgetRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'widgets', widgetId) : null), [db, user, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'testimonials'),
      where('status', '==', 'approved')
    );
  }, [db, user]);

  const { data: approvedTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const [widgetName, setWidgetName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutType>('mural');
  const [themeColor, setThemeColor] = useState('#f97316');
  const [isSaving, setIsSaving] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (widgetData) {
      setWidgetName(widgetData.name || '');
      setSelectedIds(widgetData.selectedTestimonialIds || []);
      setLayout(widgetData.layout || 'mural');
      setThemeColor(widgetData.themeColor || '#f97316');
    }
  }, [widgetData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const selectedTestimonials = useMemo(() => {
    if (!approvedTestimonials) return [];
    return approvedTestimonials.filter((t: any) => selectedIds.includes(t.id));
  }, [approvedTestimonials, selectedIds]);

  useEffect(() => {
    if ((layout === 'carousel' || layout === 'popup') && selectedTestimonials.length > 1) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % selectedTestimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [layout, selectedTestimonials]);

  const handleSave = async () => {
    if (!widgetRef || !widgetName.trim()) return;

    setIsSaving(true);
    const updates = {
      name: widgetName.trim(),
      selectedTestimonialIds: selectedIds,
      layout,
      themeColor,
    };

    updateDoc(widgetRef, updates)
      .then(() => {
        setIsSaving(false);
        toast({
          title: "Widget Atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: widgetRef.path,
          operation: 'update',
          requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const toggleTestimonial = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (authLoading || widgetLoading || testimonialsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const TestimonialCard = ({ t, small = false, isPopup = false, index = 0 }: { t: any, small?: boolean, isPopup?: boolean, index?: number }) => (
    <Card 
      className={cn(
        "bg-background shadow-xl border-t-4 border-none text-left overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-in fade-in zoom-in-95",
        small ? "p-3" : "p-6",
        isPopup && "max-w-[300px] border-l-4 border-t-0"
      )} 
      style={{ 
        borderTopColor: !isPopup ? themeColor : 'transparent', 
        borderLeftColor: isPopup ? themeColor : 'transparent',
        borderTopWidth: !isPopup ? '3px' : '0', 
        borderLeftWidth: isPopup ? '4px' : '0',
        borderStyle: 'solid',
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-primary/10 p-1.5 rounded-full" style={{ backgroundColor: `${themeColor}15` }}>
          <User className="w-3 h-3" style={{ color: themeColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-bold leading-tight truncate", small ? "text-[10px]" : "text-xs")}>{t.userName}</p>
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating || 5 }).map((_, i) => (
              <Star key={i} className={cn("fill-primary text-primary", small ? "w-2 h-2" : "w-2.5 h-2.5")} style={{ color: themeColor, fill: themeColor }} />
            ))}
          </div>
        </div>
        {!small && <Badge className="text-[8px] h-4 px-1.5 bg-green-500/10 text-green-600 border-none shrink-0">Verificado</Badge>}
      </div>
      <p className={cn("text-gray-700 italic leading-relaxed", small ? "text-[10px] line-clamp-2" : "text-sm mb-4")}>
        "{t.text}"
      </p>
      <div className={cn("pt-2 border-t flex items-center justify-between", small ? "mt-2" : "pt-3 mt-4")}>
        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
          Proova Social Proof
        </span>
        <Zap className="w-3 h-3 text-primary animate-pulse" style={{ color: themeColor }} />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body pb-20">
      <header className="bg-background border-b h-16 flex items-center px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/widgets">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-headline tracking-tight">{widgetName || 'Novo Mural'}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Personalização do Widget</p>
          </div>
        </div>

        <div className="ml-auto">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg px-6">
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Projeto
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-80 bg-background border-r flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto z-40">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2">
              <TabsTrigger value="geral" className="data-[state=active]:bg-muted">Geral</TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:bg-muted">Layout</TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-muted">Design</TabsTrigger>
            </TabsList>
            
            <div className="p-6 space-y-8">
              <TabsContent value="geral" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Identificador</Label>
                  <Input 
                    value={widgetName}
                    onChange={(e) => setWidgetName(e.target.value)}
                    placeholder="Ex: Mural da Home"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </TabsContent>

              <TabsContent value="layout" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estilo do Mural</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setLayout('popup')}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                        layout === 'popup' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", layout === 'popup' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <BellRing className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Notificação VIP</p>
                        <p className="text-[10px] text-muted-foreground">Popup flutuante animado (Exclusivo)</p>
                      </div>
                      <Badge className="absolute -top-2 -right-2 bg-primary text-[8px] h-4">Novo</Badge>
                      {layout === 'popup' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                    </button>

                    <button 
                      onClick={() => setLayout('mural')}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        layout === 'mural' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", layout === 'mural' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Mural Dinâmico</p>
                        <p className="text-[10px] text-muted-foreground">Estilo alvenaria premium</p>
                      </div>
                      {layout === 'mural' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                    </button>

                    <button 
                      onClick={() => setLayout('carousel')}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        layout === 'carousel' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", layout === 'carousel' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Play className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Carrossel Slider</p>
                        <p className="text-[10px] text-muted-foreground">Exibição horizontal contínua</p>
                      </div>
                      {layout === 'carousel' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                    </button>

                    <button 
                      onClick={() => setLayout('grid')}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        layout === 'grid' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", layout === 'grid' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Columns className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Grade Estática</p>
                        <p className="text-[10px] text-muted-foreground">Colunas e linhas uniformes</p>
                      </div>
                      {layout === 'grid' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="design" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cor de Destaque</Label>
                  <div className="flex flex-wrap gap-2">
                    {['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#000000'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                          themeColor === color ? "border-foreground" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8 space-y-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-bold font-headline flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Visualização em Tempo Real
            </h2>
            
            <div className={cn(
              "relative border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-10 rounded-2xl min-h-[500px] flex flex-col items-center justify-center transition-all duration-500",
              layout === 'popup' && "items-start justify-end"
            )}>
              {selectedTestimonials.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  {layout === 'mural' && (
                    <div className="columns-1 md:columns-2 gap-6 space-y-6 w-full max-w-2xl">
                      {selectedTestimonials.map((t, idx) => (
                        <div key={t.id + idx} className="break-inside-avoid">
                          <TestimonialCard t={t} small={selectedTestimonials.length > 2} index={idx} />
                        </div>
                      ))}
                    </div>
                  )}

                  {layout === 'carousel' && (
                    <div className="flex items-center justify-center gap-6 animate-in slide-in-from-right-10 duration-500 w-full">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCarouselIndex(prev => (prev - 1 + selectedTestimonials.length) % selectedTestimonials.length)}
                        className="rounded-full shadow-md bg-background/50 h-10 w-10"
                      >
                        <ChevronLeft />
                      </Button>
                      <div className="max-w-[340px] w-full">
                        <TestimonialCard t={selectedTestimonials[carouselIndex]} index={0} />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCarouselIndex(prev => (prev + 1) % selectedTestimonials.length)}
                        className="rounded-full shadow-md bg-background/50 h-10 w-10"
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  )}

                  {layout === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500 w-full max-w-2xl">
                      {selectedTestimonials.slice(0, 4).map((t, idx) => (
                        <TestimonialCard key={t.id + idx} t={t} small index={idx} />
                      ))}
                    </div>
                  )}

                  {layout === 'popup' && (
                    <div className="absolute bottom-10 left-10 flex flex-col items-start gap-4">
                       <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce uppercase tracking-widest shadow-lg" style={{ backgroundColor: themeColor }}>
                        Novo Feedback Real
                      </div>
                      <div 
                        key={selectedTestimonials[carouselIndex].id}
                        className="animate-in slide-in-from-left-full fade-in zoom-in duration-700 ease-out"
                      >
                        <TestimonialCard t={selectedTestimonials[carouselIndex]} isPopup index={0} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6 opacity-40 group">
                  <div className="relative">
                    <MessageSquare className="w-20 h-20 mx-auto text-primary transition-transform group-hover:scale-110" />
                    <Zap className="w-8 h-8 text-primary absolute bottom-0 right-1/4 animate-bounce" />
                  </div>
                  <p className="font-black uppercase tracking-[0.2em] text-sm text-primary">Selecione depoimentos abaixo</p>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-headline flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> 
                Depoimentos Aprovados
              </h2>
              <Badge variant="outline" className="bg-background px-3">{approvedTestimonials?.length || 0} disponíveis</Badge>
            </div>

            {!approvedTestimonials || approvedTestimonials.length === 0 ? (
              <Card className="border-2 border-dashed bg-background/50 rounded-2xl">
                <CardContent className="py-20 text-center space-y-4">
                  <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                  <p className="font-bold text-muted-foreground">Aguardando novos depoimentos para moderação...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {approvedTestimonials.map((t: any) => (
                  <div 
                    key={t.id}
                    onClick={() => toggleTestimonial(t.id)}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-300 rounded-2xl border-2 p-5 bg-background hover:shadow-lg",
                      selectedIds.includes(t.id) ? "border-primary bg-primary/5" : "border-transparent shadow-sm hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                        selectedIds.includes(t.id) ? "bg-primary border-primary scale-110" : "border-muted-foreground/30"
                      )}>
                        {selectedIds.includes(t.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-black text-sm truncate">{t.userName}</span>
                          <div className="flex gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < (t.rating || 5) ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                          "{t.text}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
