'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star, CheckCircle2, Link2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-saas');
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
      text: "O ProofWall é a melhor ferramenta de prova social que já utilizei. Simples e poderosa.",
      avatar: avatars[2]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center font-bold text-xl tracking-tight">
          <span className="font-headline text-2xl">ProofWall</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-10 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs md:text-sm font-medium text-gray-700 border mx-auto lg:mx-0 w-fit">
                    🚀 Novo: Suporte a depoimentos em vídeo 4K
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none font-headline max-w-[800px] leading-[1.1]">
                    Transforme elogios de clientes em <span className="text-primary">vendas</span> no seu site.
                  </h1>
                  <p className="max-w-[600px] text-gray-700 text-base md:text-lg lg:text-xl/relaxed mx-auto lg:mx-0">
                    Colete, modere e exiba depoimentos em texto ou vídeos em minutos. 
                    Sem código complexo, sem impacto na velocidade do seu site.
                  </p>
                </div>
                
                <div className="space-y-4 flex flex-col items-center lg:items-start">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto h-14 px-8 md:px-10 rounded-full text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                      Garantir Acesso VIP Agora
                    </Button>
                  </Link>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-700 flex items-center justify-center lg:justify-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Grátis para os primeiros 50 inscritos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative group lg:mt-0 mt-8 mx-auto lg:mx-0 w-full max-w-[500px] lg:max-w-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-card shadow-2xl">
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
                  <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 bg-background/90 backdrop-blur-sm p-3 md:p-4 rounded-xl border shadow-lg">
                    <div className="flex gap-1 mb-1.5 md:mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm italic mb-1.5 md:mb-2 line-clamp-2">"Aumentamos nossa conversão em 25% na primeira semana usando a ProofWall!"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] md:text-[10px] font-bold">JD</div>
                      <span className="text-[10px] md:text-xs font-semibold">João D., CEO da TechNova</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section: Mockup */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                  Personalização sem esforço
                </h2>
                <p className="max-w-[900px] text-gray-700 text-sm md:text-lg lg:text-xl/relaxed">
                  Veja como o ProofWall se adapta perfeitamente ao design da sua marca.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              {/* Mockup Widget */}
              <div className="relative w-full max-w-5xl p-4 md:p-8 bg-card rounded-2xl md:rounded-3xl border shadow-2xl overflow-hidden min-h-[400px]">
                <div className="hidden sm:block absolute top-0 right-0 p-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                    <div className="w-3 h-3 rounded-full bg-green-400/50" />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {testimonials.map((t, idx) => (
                    <div 
                      key={idx} 
                      className="bg-background border rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex gap-0.5 md:gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 italic leading-relaxed">"{t.text}"</p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 md:mt-6 border-t pt-4">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-primary/10">
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
                          <p className="text-[10px] md:text-xs font-bold">{t.name}</p>
                          <p className="text-[9px] md:text-[10px] text-gray-700">{t.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center">
                  <div className="px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 text-[9px] md:text-[10px] font-mono text-primary/60 text-center">
                    &lt;script src="https://proofwall.io/widget.js"&gt;&lt;/script&gt;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Benefícios Chaves
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4 p-6 md:p-8 rounded-2xl md:rounded-3xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/5 text-primary">
                  <Link2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-headline">Coleta sem atrito</h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  Envie um link direto para o seu cliente. Ele envia o depoimento em segundos, sem precisar criar conta.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 md:p-8 rounded-2xl md:rounded-3xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/5 text-primary">
                  <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-headline">Moderação em um clique</h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  Escolha exatamente o que vai para o ar no seu painel centralizado antes de publicar.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 md:p-8 rounded-2xl md:rounded-3xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/5 text-primary">
                  <Zap className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-headline">Widget ultra leve</h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  Um snippet de linha única que carrega instantaneamente sem prejudicar seu SEO ou tempo de carregamento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline leading-tight">
                  Seja um membro fundador.
                </h2>
                <p className="max-w-[700px] text-primary-foreground/80 text-sm md:text-lg lg:text-xl/relaxed mx-auto">
                  Inscreva-se hoje para garantir 50% de desconto perpétuo no lançamento oficial e acesso prioritário aos novos recursos de video.
                </p>
              </div>
              <div className="w-full max-w-sm mx-auto space-y-3 px-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="w-full h-14 text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                    Garantir Meu Lugar VIP
                  </Button>
                </Link>
                <p className="text-[10px] md:text-xs text-primary-foreground/60 uppercase tracking-widest font-medium">
                  Oferta limitada para as primeiras 50 empresas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-xs md:text-sm text-gray-700">© 2026 ProofWall. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

