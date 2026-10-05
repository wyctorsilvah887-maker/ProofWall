
'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star, CheckCircle2, Layout, Palette, Zap } from "lucide-react";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-saas');
  const designImage = PlaceHolderImages.find(img => img.id === 'brand-design');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center font-bold text-xl tracking-tight">
          <span className="font-headline">ProofWall</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground border mx-auto lg:mx-0 w-fit">
                    🚀 Novo: Suporte a depoimentos em vídeo 4K
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none font-headline max-w-[800px]">
                    Transforme elogios de clientes em <span className="text-primary">vendas</span> no seu site.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0">
                    Colete, modere e exiba depoimentos em texto ou vídeos em minutos. 
                    Sem código complexo, sem impacto na velocidade do seu site.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Link href="/signup">
                    <Button 
                      size="lg" 
                      className="h-14 px-10 rounded-full text-lg shadow-xl transition-all hover:scale-105"
                    >
                      Garantir Acesso Antecipado Agora
                    </Button>
                  </Link>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center justify-center lg:justify-start gap-1.5 ml-0 lg:ml-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Grátis para os primeiros 50 inscritos. Crie sua conta em segundos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                        <Image 
                          src={`https://picsum.photos/seed/user${i}/32/32`} 
                          width={32} 
                          height={32} 
                          alt="User avatar" 
                        />
                      </div>
                    ))}
                  </div>
                  <p>Junte-se a +2.000 empresas que confiam na ProofWall</p>
                </div>
              </div>
              
              <div className="relative group lg:mt-0 mt-12 mx-auto lg:mx-0 w-full max-w-[500px] lg:max-w-none">
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
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-xl border shadow-lg">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm italic mb-2">"Aumentamos nossa conversão em 25% na primeira semana usando a ProofWall!"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">JD</div>
                      <span className="text-xs font-semibold">João D., CEO da TechNova</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section: Adaptability */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Personalização sem esforço
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Veja como o ProofWall se adapta perfeitamente ao design da sua marca.
                </p>
              </div>
            </div>
            
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-card shadow-lg">
                {designImage && (
                  <Image
                    src={designImage.imageUrl}
                    alt={designImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={designImage.imageHint}
                  />
                )}
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">Cores Customizáveis</h3>
                    <p className="text-muted-foreground">Combine as cores dos widgets com a paleta da sua identidade visual em segundos.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">Layouts Flexíveis</h3>
                    <p className="text-muted-foreground">Escolha entre carrosséis, grades ou murais. O widget se ajusta a qualquer espaço do seu site.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline">Performance Nativa</h3>
                    <p className="text-muted-foreground">Carregamento ultra-rápido que não interfere no SEO ou na experiência do usuário.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 ProofWall. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:underline">Privacidade</a>
            <a href="#" className="hover:underline">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
