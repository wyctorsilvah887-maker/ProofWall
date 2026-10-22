
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

### 5.1 Configuração "Zero-Click" do Google Maps
- **O que é:** Busca inteligente pelo nome da empresa para capturar o `place_id`.
- **Objetivo:** Eliminar a necessidade do usuário "caçar" links técnicos do Google Business.

### 5.2 Kit de Marketing One-Click (Geração Expressa)
- **O que é:** Botão de download rápido do Cartaz de Balcão.
- **Objetivo:** O sistema detecta a logo e as cores da marca e gera o PDF pronto para impressão sem abrir diálogos de configuração.

### 5.3 Sugestões de Ação Proativas (O "Consultor")
- **O que é:** Alertas baseados em comportamento de dados.
- **Exemplo:** "Sua coleta esfriou há 7 dias. Clique aqui para enviar o link para seus clientes via WhatsApp."

### 5.4 Atalhos de Compartilhamento Dinâmico (Social Cards)
- **O que é:** Geração automática de cards para Instagram/Stories.
- **Objetivo:** Transformar depoimentos 5 estrelas em conteúdo visual para redes sociais em um clique.
