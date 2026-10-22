'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Lock, Eye } from 'lucide-react';
import Image from 'next/image';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/30 font-body text-foreground pb-20">
      <header className="bg-background border-b h-20 md:h-28 flex items-center px-4 md:px-8 sticky top-0 z-[60] shadow-sm">
        <Link href="/" className="flex items-center group -ml-2 md:-ml-4">
          <div className="relative w-[200px] h-[65px] md:w-[320px] md:h-[105px]">
            <Image src="/Logotipo%20PROOVA%20white%20mode%201.png" alt="Logo" fill className="object-contain dark:hidden" priority />
            <Image src="/Logotipo%20PROOVA%20dark%20mode%201.png" alt="Logo" fill className="object-contain hidden dark:block" priority />
          </div>
        </Link>
        <div className="ml-auto">
          <Link href="/">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit text-primary">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tight">Política de Privacidade</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Conforme a LGPD - Lei Geral de Proteção de Dados</p>
        </div>

        <div className="bg-card border rounded-[2rem] p-8 md:p-12 shadow-xl space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground italic">
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> 1. Coleta de Dados
            </h2>
            <p>Coletamos informações estritamente necessárias para a prestação do serviço, incluindo: nome, e-mail e dados da empresa dos nossos Contratantes. Dos Usuários Finais (clientes), coletamos apenas o nome e e-mail vinculados voluntariamente ao depoimento.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 2. Finalidade do Tratamento
            </h2>
            <p>Os dados coletados têm como única finalidade a exibição técnica de depoimentos nos widgets e páginas públicas, bem como a comunicação transacional entre a plataforma e o contratante. Não vendemos ou alugamos bancos de dados de leads para terceiros sob nenhuma hipótese.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 3. Segurança e Armazenamento
            </h2>
            <p>Utilizamos infraestrutura de nuvem de nível militar com criptografia em trânsito e em repouso (Firebase/Google Cloud). O acesso aos dados é restrito apenas ao administrador da conta contratante e sistemas automatizados necessários para o funcionamento do app.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic">4. Direitos do Titular</h2>
            <p>Em conformidade com a LGPD, garantimos ao titular dos dados o direito de solicitar a exclusão total de suas informações de nossa base de dados a qualquer momento, mediante solicitação formal via e-mail ou exclusão direta no painel administrativo.</p>
          </section>

          <div className="bg-muted/50 p-6 rounded-2xl border border-dashed text-xs text-center space-y-2">
            <p className="font-bold text-foreground opacity-70">Operador de Dados:</p>
            <p>Synapse Group Technology | CNPJ sob demanda judicial.</p>
            <p>contato@wsstudioscompany.com.br</p>
          </div>
        </div>
      </main>
    </div>
  );
}
