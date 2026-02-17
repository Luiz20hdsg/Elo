# 📊 Elo App – Plano de Negócios & Monetização

## 1. Visão Geral

O **Elo** é um app de relacionamento que se diferencia pela **autenticidade e conexão real**. A estratégia de monetização é baseada no modelo **freemium com 3 tiers de assinatura**, complementado por **compras avulsas (consumíveis)**. O objetivo é criar uma experiência gratuita funcional, mas com limitações naturais que geram desejo genuíno de upgrade.

---

## 2. Modelo de Receita

### 2.1 Fontes de Receita (por prioridade)

| Fonte | % Receita Estimada | Descrição |
|---|---|---|
| **Assinaturas (IAP)** | 70% | Premium+ e Light mensal/anual |
| **Consumíveis (IAP)** | 20% | Super Likes, Boosts, Rewinds avulsos |
| **Spotlight Ads** | 10% | Destaque pago por 30min (consumível) |

### 2.2 Tiers de Assinatura

#### 🆓 FREE (R$ 0)
Experiência básica funcional – o usuário CONSEGUE usar o app, mas sente a limitação:

| Feature | Limite |
|---|---|
| Likes por dia | **10** |
| Super Likes por dia | **1** |
| Ver quem te curtiu | ❌ (blur) |
| Boost/Spotlight | ❌ |
| Rewind (desfazer) | ❌ |
| Filtro avançado | ❌ (apenas idade) |
| Enviar mensagens | ✅ (apenas matches) |
| Ver perfis | ✅ (20 por sessão) |
| Anúncios | Banner sutil no feed |

#### 💚 LIGHT (R$ 19,90/mês ou R$ 149,90/ano)
O "sweet spot" – desbloqueia o essencial para quem leva a sério:

| Feature | Limite |
|---|---|
| Likes por dia | **Ilimitados** |
| Super Likes por dia | **3** |
| Ver quem te curtiu | ❌ (blur) |
| Boost/Spotlight | **1 grátis por semana** |
| Rewind (desfazer) | ✅ **5 por dia** |
| Filtro avançado | ✅ (idade + distância + interesses) |
| Enviar mensagens | ✅ |
| Ver perfis | ✅ Ilimitado |
| Anúncios | ❌ Removidos |
| Destaque no feed | ✅ Prioridade leve |

#### ⭐ PREMIUM+ (R$ 39,90/mês ou R$ 299,90/ano)
A experiência VIP completa – para quem quer RESULTADOS:

| Feature | Limite |
|---|---|
| Likes por dia | **Ilimitados** |
| Super Likes por dia | **5** |
| Ver quem te curtiu | ✅ **Lista completa** |
| Boost/Spotlight | **1 grátis por dia** |
| Rewind (desfazer) | ✅ **Ilimitado** |
| Filtro avançado | ✅ **Completo** (religião, altura, educação, signo) |
| Enviar mensagens | ✅ |
| Leitura de mensagem | ✅ **Read receipts** |
| Ver perfis | ✅ Ilimitado |
| Anúncios | ❌ Removidos |
| Destaque no feed | ✅ **Máximo** (3x mais visibilidade) |
| Badge exclusivo | ✅ ⭐ no perfil |
| Navegação incógnita | ✅ Ver sem ser visto |

### 2.3 Consumíveis (Compras Avulsas)

| Item | Preço | O que faz |
|---|---|---|
| **5 Super Likes** | R$ 9,90 | Like especial que destaca você |
| **1 Boost (30min)** | R$ 7,90 | Coloca no topo do feed por 30min |
| **5 Boosts** | R$ 29,90 | Pacote economia |
| **3 Rewinds** | R$ 4,90 | Desfazer último dislike |

---

## 3. Psicologia de Conversão (O que faz o usuário QUERER pagar)

### 3.1 Gatilhos de Desejo

1. **"Alguém te curtiu" (blur)** 🔥
   - Free users veem uma notificação "3 pessoas curtiram você" com foto borrada
   - CTA: "Desbloqueie Premium+ para ver quem te curtiu"
   - **Este é o gatilho #1 de conversão em todos os dating apps**

2. **"Seus likes acabaram"** ⏰
   - Após 10 likes, tela com timer: "Volte em 12h ou desbloqueie likes ilimitados"
   - Mostra o próximo perfil borrado com "Continue descobrindo..."

3. **"Spotlight ativo na sua região"** 📍
   - Notificação: "23 pessoas estão com Boost ativo agora. Ative o seu!"
   - Cria urgência e FOMO (Fear of Missing Out)

4. **"Você perdeu um perfil incrível"** ↩️
   - Após dislike, mostra brevemente: "Ops! Passou por [Nome]. Use Rewind para voltar"
   - Free users não têm Rewind

5. **Match boost visual** 🎯
   - Profiles de Premium+ e Light aparecem com borda/badge sutil
   - Indica "pessoa séria" → atrai mais likes → mais matches → mais valor percebido

### 3.2 Diferencial Competitivo (O que ninguém faz)

**"Elo Score" – Índice de Compatibilidade Visível**

Diferente do Tinder/Bumble que apenas mostram fotos, o Elo mostra um **score de compatibilidade de 0-100%** baseado em:
- Interesses em comum
- Proximidade geográfica
- Padrão de atividade (horários similares)
- Idade compatível

**Free users veem o score como "??%"** (blur). **Light veem o score básico. Premium+ veem o breakdown detalhado** (40% interesses, 30% proximidade, etc.).

Isso cria uma curiosidade irresistível: "Será que essa pessoa é 95% compatível comigo?"

---

## 4. Infraestrutura de Pagamento

### 4.1 Por que NÃO usar Mercado Pago

O Mercado Pago é **focado no Brasil** e não serve para um app global. Além disso:
- Apple e Google **exigem** que assinaturas in-app usem IAP (In-App Purchase)
- Mercado Pago não se integra com IAP
- Taxa de 30% da Apple/Google é obrigatória para apps móveis

### 4.2 Solução: RevenueCat + Apple IAP + Google Play Billing

**RevenueCat** é a melhor solução porque:

1. **Abstração única** para iOS (StoreKit) e Android (Google Play Billing)
2. **Dashboard unificado** com métricas de MRR, churn, LTV
3. **Webhooks** para sincronizar status com Supabase
4. **Gratuito até $2.500/mês** de receita (perfeito para começar)
5. **Depois cobra 1%** da receita (muito menor que qualquer gateway)
6. **Compliance automático** com regras Apple/Google

### 4.3 Fluxo do Dinheiro

```
Usuário compra no app
        ↓
Apple IAP / Google Play Billing (processa pagamento)
        ↓
Apple/Google retém 15-30% de comissão*
        ↓
RevenueCat recebe webhook de confirmação
        ↓
RevenueCat envia webhook para Supabase Edge Function
        ↓
Edge Function atualiza tabela 'subscriptions' no banco
        ↓
App detecta mudança → desbloqueia features
        ↓
Apple/Google deposita receita líquida na sua conta bancária
  (via App Store Connect / Google Play Console)
  Prazo: ~45 dias após a compra
```

*Comissão: 30% no 1º ano, 15% a partir do 2º ano (Apple Small Business Program / Google Reduced Fee)

### 4.4 Receita Projetada (Cenário Conservador)

| Métrica | Mês 6 | Mês 12 | Mês 24 |
|---|---|---|---|
| Usuários totais | 10.000 | 50.000 | 200.000 |
| Taxa de conversão | 3% | 4% | 5% |
| Assinantes pagantes | 300 | 2.000 | 10.000 |
| Ticket médio mensal | R$ 25 | R$ 27 | R$ 30 |
| **Receita Bruta/mês** | **R$ 7.500** | **R$ 54.000** | **R$ 300.000** |
| Comissão Apple/Google (20%*) | -R$ 1.500 | -R$ 10.800 | -R$ 60.000 |
| RevenueCat (1%) | -R$ 75 | -R$ 540 | -R$ 3.000 |
| **Receita Líquida/mês** | **R$ 5.925** | **R$ 42.660** | **R$ 237.000** |

*Usando média de 20% considerando Small Business Program

---

## 5. Estrutura Técnica

### 5.1 Novas Tabelas no Supabase

```sql
-- Tabela de Assinaturas
subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan TEXT ('free', 'light', 'premium_plus'),
  status TEXT ('active', 'expired', 'cancelled', 'trial'),
  provider TEXT ('apple', 'google', 'stripe'),
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Tabela de Limites de Uso Diário  
daily_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  usage_date DATE DEFAULT CURRENT_DATE,
  likes_used INTEGER DEFAULT 0,
  super_likes_used INTEGER DEFAULT 0,
  rewinds_used INTEGER DEFAULT 0,
  boosts_used INTEGER DEFAULT 0,
  UNIQUE(user_id, usage_date)
)

-- Tabela de Compras de Consumíveis
consumable_balance (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  super_likes INTEGER DEFAULT 0,
  boosts INTEGER DEFAULT 0,
  rewinds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ
)

-- Histórico de Transações
purchase_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id TEXT,
  type TEXT ('subscription', 'consumable'),
  amount_cents INTEGER,
  currency TEXT DEFAULT 'BRL',
  provider TEXT,
  provider_transaction_id TEXT,
  created_at TIMESTAMPTZ
)
```

### 5.2 Hook `useSubscription` (React)

```typescript
// Responsabilidades:
// - Buscar plano atual do usuário no Supabase
// - Expor: plan, canLike(), canSuperLike(), canRewind(), canBoost(), 
//          canSeeWhoLiked(), canUseAdvancedFilters(), isAdFree()
// - Decrementar limites diários ao usar
// - Mostrar paywall quando limite atingido
```

### 5.3 RevenueCat Integration

```
react-native-purchases (SDK)
        ↓
Configura offerings (Light, Premium+)
        ↓
Apresenta paywall nativa
        ↓
Processa pagamento via Apple/Google
        ↓
Webhook → Supabase Edge Function
        ↓
Atualiza subscriptions table
```

### 5.4 Feature Gating (Onde aplicar no código)

| Tela | Feature Gated |
|---|---|
| **PeopleScreen** | Limite de likes, Super Likes, Rewind, filtros avançados |
| **ProfileScreen** | "Ver quem curtiu" (blur para free), badge Premium |
| **ChatsScreen** | Read receipts (Premium+ only) |
| **SettingsScreen** | Link para gerenciar assinatura |
| **Feed/Recommendations** | Ordenação com boost (Premium+ primeiro) |

---

## 6. Roadmap de Implementação

### Fase 1 – Infraestrutura ✅
- [x] Criar migração SQL com tabelas de subscription (`00012_subscriptions_and_monetization.sql`)
- [x] Criar `SubscriptionContext` (provider global com feature gating)
- [x] Criar hook `useSubscription` com canLike(), canSuperLike(), canRewind(), etc.
- [x] Funções RPC: `get_user_plan`, `use_daily_action`, `get_who_liked_me`, `update_subscription`, `add_consumables`

### Fase 2 – Feature Gating ✅
- [x] Implementar limites no PeopleScreen (likes, super likes, modal de limite)
- [x] Implementar "Ver quem curtiu" com blur (ProfileScreen)
- [x] Implementar filtros avançados gating (Premium+ only)
- [x] Badge de plano no ProfileScreen
- [x] Seção de assinatura no SettingsScreen
- [x] Feed boost via `get_recommendations` (Premium+ 3x, Light 1.5x)

### Fase 3 – Paywall & Pagamentos ✅
- [x] Criar `PaywallScreen` com comparação de planos
- [x] Integrar RevenueCat SDK (`react-native-purchases`)
- [x] Criar `src/lib/revenueCat.ts` (init, purchase, restore, sync)
- [x] Preços dinâmicos via RevenueCat offerings
- [x] Compra de consumíveis avulsos
- [x] Criar Edge Function para webhooks (`supabase/functions/revenuecat-webhook`)
- [x] Sync bidirecional RevenueCat ↔ Supabase
- [x] Manage Subscription (abre App Store/Play Store)
- [x] Restore Purchases
- [x] i18n completo (7 idiomas) para todas as telas de monetização

### Fase 4 – Polish (Próximos passos)
- [ ] Animações de upgrade (confetti, etc.)
- [ ] Notificações push de "alguém te curtiu" (OneSignal trigger)
- [ ] Tela de "Quem te curtiu" com grid de perfis (blur para free)
- [ ] Métricas e analytics (RevenueCat Charts)
- [ ] A/B test de preços
- [ ] Implementar Rewind e Boost UI
- [ ] Read receipts no ChatDetailScreen
- [ ] Modo incógnito (Premium+ only)

---

## 7. Arquitetura de Pagamento Implementada

### 7.1 Fluxo Completo do Código

```
App Start
  └─ SubscriptionContext monta
      └─ configureRevenueCat(userId)
      └─ loginRevenueCat(userId)
      └─ addCustomerInfoListener() → escuta mudanças
      └─ refreshPlan() → Supabase RPC get_user_plan()

Usuário toca "Upgrade"
  └─ Navega para PaywallScreen
      └─ getOfferings() → busca preços locais das stores
      └─ Seleciona plano + ciclo (mensal/anual)
      └─ purchasePackage(pkg)
          └─ Apple/Google processa pagamento
          └─ syncSubscriptionToSupabase() → RPC update_subscription
      └─ refreshPlan() → UI atualiza instantaneamente

Webhook (backup server-side)
  └─ RevenueCat envia evento para Edge Function
      └─ Valida auth header
      └─ RPC update_subscription()
      └─ insert purchase_history
```

### 7.2 Arquivos Criados

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/revenueCat.ts` | SDK wrapper (configure, purchase, restore, sync) |
| `src/contexts/SubscriptionContext.tsx` | Estado global + feature gating |
| `src/screens/PaywallScreen.tsx` | Tela de upgrade com preços dinâmicos |
| `supabase/migrations/00012_*.sql` | Schema completo de monetização |
| `supabase/functions/revenuecat-webhook/` | Webhook handler (Deno) |

---

## 8. Pacotes Necessários

```bash
npm install react-native-purchases  # RevenueCat SDK (já instalado ✅)
```

Configuração necessária:
- [x] Instalar `react-native-purchases` no projeto
- [x] Criar wrapper `src/lib/revenueCat.ts`
- [x] Adicionar `REVENUECAT_APPLE_KEY` e `REVENUECAT_GOOGLE_KEY` ao `.env`
- [ ] Criar conta gratuita em [RevenueCat](https://www.revenuecat.com/)
- [ ] Criar produtos no App Store Connect (Light mensal, Light anual, Premium+ mensal, Premium+ anual)
- [ ] Criar produtos no Google Play Console (mesmos 4 produtos)
- [ ] Configurar Entitlements no RevenueCat: `light` e `premium_plus`
- [ ] Configurar Offerings no RevenueCat: `light` (monthly+annual) e `premium_plus` (monthly+annual)
- [ ] Copiar API keys Apple/Android para o `.env`
- [ ] Configurar webhook URL: `https://<project>.supabase.co/functions/v1/revenuecat-webhook`
- [ ] Definir secret: `supabase secrets set REVENUECAT_WEBHOOK_AUTH_KEY=<key>`
- [ ] Fazer deploy: `supabase functions deploy revenuecat-webhook`

---

## 9. Resumo Executivo

| Aspecto | Decisão |
|---|---|
| **Modelo** | Freemium (Free + Light + Premium+) |
| **Gateway** | RevenueCat (abstrai Apple IAP + Google Play) |
| **SDK** | `react-native-purchases` v8 ✅ |
| **Sync** | Webhook → Supabase Edge Function + client sync |
| **Gatilho #1** | "Ver quem te curtiu" (blur) |
| **Diferencial** | Elo Score (compatibilidade visível) |
| **Preço Light** | R$ 19,90/mês ou R$ 149,90/ano |
| **Preço Premium+** | R$ 39,90/mês ou R$ 299,90/ano |
| **Receita Mês 12** | ~R$ 42.660 líquido (conservador) |
| **Custo RevenueCat** | Grátis até $2.500/mês, depois 1% |
| **Comissão stores** | 15-30% (Apple/Google) |
| **Status** | ✅ Código 100% implementado. Falta: config nas stores + RevenueCat dashboard |

---

*Documento gerado em Fevereiro/2026. Atualizar conforme métricas reais.*
