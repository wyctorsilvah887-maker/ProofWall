
# Proova - Estudos e Estratégias de Implementação

Este documento detalha as teses de evolução do produto para transformar prova social em receita direta.

## 🚀 1. Automação de Curadoria (AI Smart Pick)
**Tese:** Reduzir o tempo que o cliente gasta escolhendo depoimentos.
- **Implementação:** Botão "Auto-Curar" via Genkit.
- **Lógica:** A IA analisa sentimento e diversidade (ex: um sobre atendimento, um sobre entrega, um sobre qualidade) e seleciona os 10 melhores automaticamente.

## 🧠 2. Moderação Automática (Genkit Shield)
**Tese:** Eliminar o trabalho manual de aprovação de depoimentos óbvios.
- **Implementação:** Fluxo Genkit no momento da submissão.
- **Lógica:** Se a nota for 5 e o texto não contiver spam ou ofensas, o sistema marca como `approved` instantaneamente.

## 🔍 3. SEO Local Plug & Play (JSON-LD) - [IMPLEMENTADO]
**Tese:** Fazer as estrelas amarelas aparecerem nos resultados de busca do Google.
- **Implementação:** Injeção dinâmica de `application/ld+json` na Página Pública.
- **Lógica:** O sistema calcula a média (`AggregateRating`) e lista os depoimentos (`Review`) para o crawler do Google.

## 🛠️ 4. Insights de Feedback Privado (Actionable AI)
**Tese:** Transformar críticas em consultoria de negócios automática.
- **Implementação:** Resumo executivo no Inbox Privado.
- **Lógica:** A IA lê todos os feedbacks de 1-3 estrelas e gera um relatório: "40% dos clientes reclamam da demora no checkout. Sugestão: Rever fluxo de pagamento."

## 📊 5. Evolução do Dashboard (Simplicidade & Automação)
**Tese:** Reduzir a carga cognitiva do usuário e tornar o Dash proativo.

### 5.1 Configuração "Zero-Click" do Google Maps - [IMPLEMENTADO]
- **O que é:** Busca inteligente pelo nome da empresa para capturar o `place_id`.
- **Objetivo:** Eliminar a necessidade do usuário "caçar" links técnicos do Google Business.

### 5.2 Kit de Marketing One-Click (Geração Expressa) - [IMPLEMENTADO]
- **O que é:** Botão de download rápido do Cartaz de Balcão e visualização simplificada.
- **Objetivo:** O sistema detecta a logo e as cores da marca e facilita o download do PDF pronto para impressão.

### 5.3 Sugestões de Ação Proativas (O "Consultor") - [IMPLEMENTADO]
- **O que é:** Alertas baseados em comportamento de dados e pendências de configuração.
- **Exemplo:** "Google Maps não configurado" ou "Você tem feedbacks privados sem resposta".

### 5.4 Atalhos de Compartilhamento Dinâmico (Social Cards) - [IMPLEMENTADO]
- **O que é:** Geração automática de cards para Instagram/Stories.
- **Objetivo:** Transformar depoimentos 5 estrelas em conteúdo visual para redes sociais em um clique.

## ⚙️ 6. Estratégias de Automação de Fluxo (No-AI)
**Tese:** Criar uma experiência "hands-free" para o usuário final através de gatilhos técnicos.

### 6.1 Automação de E-mails (Pós-Venda e Alerta)
- **Agradecimento Automático:** Disparo de e-mail via Resend para o cliente final após submissão de nota 5 estrelas (possibilidade de incluir cupom).
- **Alerta de Notificação:** Notificação imediata para o dono do negócio quando um feedback crítico (1-3 estrelas) é recebido no Inbox Privado.

### 6.2 Sincronização Inteligente (Auto-Publish)
- **Regras de Exibição:** Opção para publicar automaticamente todo depoimento 5 estrelas em widgets selecionados, eliminando a curadoria manual constante.

### 6.3 Business Intelligence (BI) e Exportação
- **Exportação de Leads:** Ferramenta para baixar lista de contatos (nome/email) em CSV/Excel para uso em tráfego pago ou CRM.
- **Relatório de Performance Semanal:** E-mail de resumo automático comparando métricas da semana atual vs. anterior.

### 6.4 SEO e Indexação Turbo
- **Sitemap Dinâmico:** Geração de sitemap.xml automático para indexação imediata de novas Páginas Públicas no Google Search Console.
- **Canonical Tags:** Gestão automatizada de autoridade de domínio entre murais e landing pages.

### 6.5 Gestão Técnica de Vídeos
- **Pipeline de Processamento:** Automação de compressão e geração de thumbnails para depoimentos em vídeo, mantendo a performance da página.
