
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **DNS e Domínio:** Orientação para gestão de DNS via Vercel Dashboard (Nameservers apontando para ns1.vercel-dns.com).
- **Consolidação de Marca:** Atualização do rodapé da Landing Page e página de recuperação de senha com a assinatura "Synapse Group".
- **Sistema de E-mail (Resend):** Configuração do remetente customizado `proova@proova.wsstudioscompany.com.br` para contornar limitações do modo Sandbox do Resend.
- **Double-Down Reviews (Google Maps):** Implementada lógica na página de coleta (`/c`) que exibe o botão do Google Maps apenas para depoimentos de 4 ou 5 estrelas.
- **Correção de Conexão Firestore:** Ativado `experimentalForceLongPolling` para resolver erros de rede em proxies de nuvem.
- **Simplificação de UX:** Removida a seção de Visualização no Dashboard para focar em métricas e gestão de depoimentos em largura total.

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo (Ver tese em docs/strategy.md).
- [ ] Moderação Automática com IA (Genkit).
- [ ] Sistema de Recompensas e Cupons.
