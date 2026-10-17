
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star, CheckCircle2, Link2, ShieldCheck, Zap, Loader2, ArrowRight } from "lucide-react";
import { useUser } from "@/firebase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dash');
    }
  }, [user, loading, router]);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-saas');
  const heroBg = PlaceHolderImages.find(img => img.id === 'hero-bg-photo');
  const ctaBg = PlaceHolderImages.find(img => img.id === 'cta-bg-photo');
  
  const avatars = [
    PlaceHolderImages.find(img => img.id === 'avatar-1'),
    PlaceHolderImages.find(img => img.id === 'avatar-2'),
    PlaceHolderImages.find(img => img.id === 'avatar-3'),
  ];

  const testimonials = [
    {
      name: "Alice M.",
      company: "TechFlow Solutions",
      text: "A facilidade de instalar o widget no meu site foi impressionante. O visual combinou direto!",
      avatar: avatars[0]
    },
    {
      name: "Bruno R.",
      company: "Creative Labs",
      text: "Nossos clientes adoram gravar depoimentos em vídeo. A conversão subiu drasticamente.",
      avatar: avatars[1]
    },
    {
      name: "Carla S.",
      company: "Global E-commerce",
      text: "O Proova é a melhor ferramenta de prova social que já utilizei. Simples e poderosa.",
      avatar: avatars[2]
    }
  ];

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body overflow-x-hidden">
      <header className="px-4 lg:px-6 h-20 flex items-center justify-between border-b sticky top-0 bg-background/80 backdrop-blur-md z-[100]">
        <div className="flex items-center font-bold text-xl tracking-tight relative w-[56px] h-[56px]">
          <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-sm dark:hidden" />
          <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-sm hidden dark:block" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-bold">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="font-bold shadow-lg">Cadastro Grátis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION WITH BG PHOTO */}
        <section className="relative w-full py-16 md:py-32 lg:py-48 flex items-center justify-center overflow-hidden">
          {heroBg && (
            <div className="absolute inset-0 z-0">
              <Image 
                src={heroBg.imageUrl} 
                alt="Background" 
                fill 
                priority 
                className="object-cover opacity-20 dark:opacity-10 grayscale-[50%]"
                data-ai-hint={heroBg.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </div>
          )}
          
          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
                <div className="space-y-6">
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-bold text-primary border border-primary/20 mx-auto lg:mx-0 w-fit backdrop-blur-sm">
                    🚀 Novo: Suporte a depoimentos em vídeo 4K
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl font-headline max-w-[800px] leading-[1.05]">
                    Transforme elogios em <span className="text-primary italic">Máquinas de Vendas</span>.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl lg:text-2xl/relaxed mx-auto lg:mx-0 font-medium">
                    Colete, modere e exiba depoimentos reais em minutos com o domínio premium <strong>proova.wsstudioscompany.com.br</strong>.
                  </p>
                </div>
                
                <div className="space-y-4 flex flex-col items-center lg:items-start">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto h-16 px-10 rounded-2xl text-xl font-black shadow-[0_20px_40px_-15px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 group"
                    >
                      Começar Agora <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center lg:justify-start gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Setup em 2 min</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Sem Cartão</span>
                  </div>
                </div>
              </div>
              
              <div className="relative group mx-auto lg:mx-0 w-full max-w-[550px] lg:max-w-none">
                <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-8 border-background shadow-2xl bg-card">
                  {heroImage && (
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      fill
                      priority
                      className="object-cover transition duration-500 group-hover:scale-105"
                      data-ai-hint={heroImage.imageHint}
                    />
                  )}
                  <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-md p-6 rounded-3xl border shadow-2xl border-primary/10">
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm md:text-base italic mb-4 font-medium">"Aumentamos nossa conversão em 25% logo na primeira semana com o Proova!"</p>
                    <div className="flex items-center gap-3 border-t pt-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">JD</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black">João D.</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">CEO da TechNova</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION WITH SUBTLE TEXTURE */}
        <section className="w-full py-24 md:py-32 bg-muted/30 relative">
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter sm:text-5xl font-headline">
                  Identidade Visual <span className="text-primary italic">Impecável</span>.
                </h2>
                <p className="max-w-[800px] text-muted-foreground text-base md:text-xl font-medium">
                  O Proova se adapta à sua marca, não o contrário.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-full max-w-6xl p-6 md:p-12 bg-card rounded-[3rem] border shadow-2xl overflow-hidden min-h-[500px] ring-1 ring-primary/5">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {testimonials.map((t, idx) => (
                    <div 
                      key={idx} 
                      className="bg-background border rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
                          ))}
                        </div>
                        <p className="text-sm md:text-base text-foreground italic leading-relaxed font-medium">"{t.text}"</p>
                      </div>
                      <div className="flex items-center gap-4 mt-8 border-t pt-6">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-sm">
                          {t.avatar && (
                            <Image 
                              src={t.avatar.imageUrl} 
                              alt={t.avatar.description} 
                              fill 
                              className="object-cover" 
                              data-ai-hint={t.avatar.imageHint}
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 flex justify-center">
                  <div className="px-6 py-3 bg-primary/5 rounded-full border border-primary/10 text-[10px] md:text-xs font-mono text-primary font-bold shadow-sm">
                    &lt;script src="https://proova.wsstudioscompany.com.br/widget.js"&gt;&lt;/script&gt;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 md:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-[2.5rem] border bg-card shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="p-5 rounded-[2rem] bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Link2 className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tight">Coleta Viral</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                  Envie um link <strong>proova</strong> direto no WhatsApp. Seu cliente avalia em 30 segundos.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-[2.5rem] border bg-card shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="p-5 rounded-[2rem] bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tight">Moderação Inteligente</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                  Você no controle total. Escolha quais elogios merecem destaque no seu site com um clique.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-[2.5rem] border bg-card shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="p-5 rounded-[2rem] bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Zap className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-2xl font-black font-headline tracking-tight">Carga Instantânea</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
                  Widget ultra otimizado servido via CDN de alta velocidade. Zero impacto no seu SEO.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA WITH BG PHOTO */}
        <section className="relative w-full py-24 md:py-48 bg-primary text-primary-foreground overflow-hidden">
          {ctaBg && (
            <div className="absolute inset-0 z-0">
              <Image 
                src={ctaBg.imageUrl} 
                alt="Footer Background" 
                fill 
                className="object-cover opacity-15 grayscale brightness-[0.2]"
                data-ai-hint={ctaBg.imageHint}
              />
              <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
            </div>
          )}
          
          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-10 text-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-black tracking-tighter sm:text-6xl font-headline leading-[1] max-w-4xl">
                  Seja um Membro Fundador da <span className="italic">Proova</span>.
                </h2>
                <p className="max-w-[700px] text-primary-foreground/90 text-lg md:text-2xl font-medium mx-auto">
                  Garanta <strong>50% de desconto perpétuo</strong> ao se inscrever hoje no Proova.
                </p>
              </div>
              <div className="w-full max-w-sm mx-auto space-y-4 px-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full h-16 text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-transform rounded-2xl">
                    Garantir Minha Vaga VIP
                  </Button>
                </Link>
                <p className="text-[11px] md:text-xs text-primary-foreground/70 uppercase tracking-[0.2em] font-black">
                  Oferta limitada para os primeiros 50 inscritos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-background relative z-10">
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-6 text-center">
          <div className="flex items-center gap-2 opacity-50 relative w-[32px] h-[32px]">
             <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo Small" width={32} height={32} className="rounded-lg grayscale dark:hidden" />
             <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo Small" width={32} height={32} className="rounded-lg grayscale hidden dark:block" />
          </div>
          <div className="space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground font-bold italic">"Onde a confiança vira conversão."</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-40">
              © 2026 BY SYNAPSE GROUP | SYNP GROUP TECHNOLOGY
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
