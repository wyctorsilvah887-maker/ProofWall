
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **Otimização de Dash Mobile - [FINALIZADO]:** Redesenhada a barra de progresso e o checklist de onboarding para telas menores. Agora o layout é mais compacto, reduzindo o scroll vertical e focando nas ações essenciais sem poluir a interface.
- **Alerta de Feedback Crítico - [FINALIZADO]:** Implementado sistema de notificação automática via e-mail (Resend). Agora, sempre que um feedback de 1-3 estrelas é recebido no Inbox Privado, o dono do negócio recebe um e-mail em tempo real para agir prontamente na recuperação do cliente.
- **Compliance Jurídico - [FINALIZADO]:** Implementada captura automática de endereço IP e timestamp no momento do cadastro. O sistema agora vincula o "Proof of Acceptance" (prova de aceite) aos Termos de Uso diretamente no documento do usuário, garantindo segurança jurídica para a plataforma.
- **Segurança & Rate Limiting - [FINALIZADO]:** Implementada proteção global de 10 requisições por minuto (Rate Limit) baseada em IP via Firestore. O sistema agora protege a API do Google Maps contra abusos e o formulário de coleta contra SPAM. Migrada a lógica de submissão para Server Actions para maior controle de backend.
- **Consultor Proativo & UX Marketing - [FINALIZADO]:** Implementada seção de alertas inteligentes no Dashboard que sugere ações baseadas em dados (ex: configurar Google Maps, responder feedbacks privados). Otimizado o fluxo de geração de Kit de Marketing (Cartaz) para ser mais ágil e intuitivo.
- **Social Cards (Compartilhamento VIP) - [FINALIZADO]:** Implementada ferramenta de geração de artes para redes sociais. O sistema agora permite transformar depoimentos 5 estrelas em imagens de alta resolução (1080x1080) otimizadas para o Instagram, com um clique. Adicionada funcionalidade de compartilhamento nativo (Web Share API) e download direto em PNG.
- **Precisão Google Maps (Zero-Click) - [FINALIZADO]:** Implementada integração real com a `Google Places API` via Server Action. O sistema agora busca estabelecimentos no banco de dados oficial do Google usando a chave de API configurada no servidor, capturando o `place_id` exato para gerar links de avaliação infalíveis.
- **Redirecionamento Google Maps:** Corrigida a lógica de redirecionamento automático ao escolher "Público". O sistema agora dispara a abertura do Google Maps simultaneamente ao clique de envio, evitando bloqueios de pop-up e garantindo que o fluxo não dependa de uma segunda interação no mobile. Recurso agora liberado para todos os planos e notas.
- **Sanitização de URLs:** Implementada verificação automática de protocolo (https) para links de destino do Google Maps.
- **Instruções UX Mobile:** Removida a mentira a "Ctrl+V" nas instruções de sucesso, substituindo por uma linguagem agnóstica para facilitar a compreensão em smartphones e tablets.
- **SEO Local Automático:** Implementada injeção dinâmica de JSON-LD nas Páginas Públicas para exibição de estrelas no Google.
- **Fluxo de Cópia para Clipboard:** Adicionada funcionalidade de cópia automática do depoimento ao escolher "Enviar Público", facilitando a postagem no Google Maps.
- **Proteção Anti-Bot:** Implementado campo Honeypot e verificação de tempo de submissão (Minimum Load Time) para prevenir ataques de spam e bots automáticos.
- **Estratégia Documentada:** Criado `docs/strategy.md` com o roteiro de inovações futuras (AI Smart Pick, Genkit Shield, etc).

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo.
- [ ] Ativação da Moderação Automática com Genkit (Shield).
- [ ] Dashboard de Insights de Sentimento para feedbacks privados.
