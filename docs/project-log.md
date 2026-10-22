
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **Social Cards (Compartilhamento VIP) - [FINALIZADO]:** Implementada ferramenta de geração de artes para redes sociais. O sistema agora permite transformar depoimentos 5 estrelas em imagens de alta resolução (1080x1080) otimizadas para o Instagram, com um clique. Adicionada funcionalidade de compartilhamento nativo (Web Share API) e download direto em PNG.
- **Precisão Google Maps (Zero-Click) - [FINALIZADO]:** Implementada integração real com a `Google Places API` via Server Action. O sistema agora busca estabelecimentos no banco de dados oficial do Google usando a chave de API configurada no servidor, capturando o `place_id` exato para gerar links de avaliação infalíveis.
- **Redirecionamento Google Maps:** Corrigida a lógica de redirecionamento automático ao escolher "Público". O sistema agora dispara a abertura do Google Maps simultaneamente ao clique de envio, evitando bloqueios de pop-up e garantindo que o fluxo não dependa de uma segunda interação no mobile. Recurso agora liberado para todos os planos e notas.
- **Sanitização de URLs:** Implementada verificação automática de protocolo (https) para links de destino do Google Maps.
- **Instruções UX Mobile:** Removida a menção a "Ctrl+V" nas instruções de sucesso, substituindo por uma linguagem agnóstica para facilitar a compreensão em smartphones e tablets.
- **SEO Local Automático:** Implementada injeção dinâmica de JSON-LD nas Páginas Públicas para exibição de estrelas no Google.
- **Fluxo de Cópia para Clipboard:** Adicionada funcionalidade de cópia automática do depoimento ao escolher "Enviar Público", facilitando a postagem no Google Maps.
- **Proteção Anti-Bot:** Implementado campo Honeypot e verificação de tempo de submissão (Minimum Load Time) para prevenir ataques de spam e bots automáticos.
- **Compliance Jurídico:** Integração de captura de IP e Timestamp no aceite de Termos de Uso e Privacidade durante o cadastro.
- **Estratégia Documentada:** Criado `docs/strategy.md` com o roteiro de inovações futuras (AI Smart Pick, Genkit Shield, etc).

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo.
- [ ] Ativação da Moderação Automática com Genkit (Shield).
- [ ] Dashboard de Insights de Sentimento para feedbacks privados.
