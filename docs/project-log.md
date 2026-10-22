
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
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
