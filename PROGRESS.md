# Plano de Implementação do Backend "Elo" com Supabase

Este documento descreve o plano e o progresso da implementação do backend para o aplicativo Elo usando a plataforma Supabase.

## Estrutura do Banco de Dados (Schema)

- [x] **Tabela `profiles`**: Armazena dados dos usuários.
  - `id` (UUID, FK para `auth.users.id`)
  - `username` (text)
  - `full_name` (text)
  - `avatar_url` (text)
  - `bio` (text, opcional)
  - `interests` (array de text, opcional)
  - `location` (geography, opcional): Armazena a localização do usuário (latitude/longitude).
  - `updated_at` (timestampz)

- [x] **Tabela `interactions`**: Registra as ações de "like" e "dislike".
  - `id` (bigint)
  - `user_id` (UUID)
  - `target_user_id` (UUID)
  - `action` (text: 'like' ou 'dislike')
  - `created_at` (timestampz)

- [x] **Tabela `matches`**: Armazena os matches (likes mútuos).
  - `id` (bigint)
  - `user1_id` (UUID)
  - `user2_id` (UUID)
  - `created_at` (timestampz)

- [x] **Tabela `messages`**: Armazena as mensagens dos chats.
  - `id` (bigint)
  - `match_id` (bigint)
  - `sender_id` (UUID)
  - `content` (text)
  - `created_at` (timestampz)

---

## Fases de Implementação

### Fase 1: Configuração e Autenticação
- [x] Criar o projeto no Supabase.
- [x] Ativar a extensão PostGIS para geolocalização.
- [x] Instalar e configurar o cliente Supabase no app React Native.
- [x] Implementar as funções de **Cadastro**, **Login** e **Recuperação de Senha**.
- [x] Criar um trigger no DB para criar um `profile` quando um novo `auth.user` for criado.

### Fase 2: Gerenciamento de Perfis
- [x] **Implementar busca de dados do perfil do usuário logado.**
- [x] Implementar a edição de informações do perfil (nome, bio, interesses).
- [x] Implementar o upload de fotos para o Supabase Storage e associá-las ao perfil.
- [x] Implementar a coleta e atualização da localização do usuário.
- [x] Configurar Políticas de Segurança (RLS) para a tabela `profiles`.

### Fase 3: Descoberta de Pessoas e Interações (Matchmaking)
- [x] **Algoritmo de Recomendação (Função RPC):**
  - [x] Criar uma função no banco de dados `get_recommendations()` que retorna uma lista de usuários.
  - [x] O "score" de recomendação será baseado em:
    - **Proximidade:** Calcular a distância usando PostGIS (maior score para menor distância).
    - **Interesses em Comum:** Comparar arrays de `interests` (maior score para mais interesses em comum).
  - [x] A função deve filtrar usuários já interagidos ou que são matches.
- [x] Implementar a funcionalidade de **"like" / "dislike"** na UI, que chamará a função de interação.
- [x] Criar uma função no DB que, ao receber um "like", verifica se é mútuo e, em caso afirmativo, cria um registro na tabela `matches`.
- [x] Configurar RLS para `interactions` e `matches`.

### Fase 4: Chat em Tempo Real
- [x] Implementar a busca da lista de `matches` (conversas) do usuário.
- [x] Ativar o serviço de **Realtime** do Supabase para a tabela `messages`.
- [x] Implementar a tela de chat para buscar o histórico e receber novas mensagens em tempo real.
- [x] Implementar a função de envio de mensagens.
- [x] Configurar RLS para `messages` para garantir a privacidade das conversas.

---

## Próximos Passos para Produção

- [x] **Recursos Avançados de Perfil:** Adicionar mais campos como data de nascimento (com cálculo de idade), preferências, etc.
  - [x] Adicionada coluna `birth_date` à tabela `profiles`.
  - [x] Criada view `profiles_with_age` para calcular a idade automaticamente.
  - [x] Atualizada a tela de Registro para incluir o campo de data de nascimento.
  - [x] Atualizada a tela de Perfil para exibir a idade do usuário.
  - [x] Atualizada a função `get_recommendations` e a tela de Pessoas para buscar e exibir a idade dos usuários recomendados.

- [x] **Login Social (Google & Apple):** Permitir que os usuários se cadastrem e façam login com contas de provedores OAuth.
  - [x] Adicionada a biblioteca do Google Sign-In (`@react-native-google-signin/google-signin`).
  - [x] Adicionada a biblioteca do Apple Sign-In (`@invertase/react-native-apple-authentication`).
  - [x] Implementada a lógica de UI e autenticação com Supabase nas telas de Login e Cadastro.
  - [x] Corrigida a API do Google Sign-In v16 (`response.data?.idToken` em vez de `{ idToken }`).
  - [x] Variável `GOOGLE_WEB_CLIENT_ID` movida para `.env` e `env.d.ts`.
  - [ ] **Pendente:** Configuração nativa de iOS/Android e obtenção da chave real `GOOGLE_WEB_CLIENT_ID` do Google Cloud Console.

- [x] **Notificações Push (OneSignal):** Essencial para notificar sobre novos matches, mensagens e reengajamento.
  - [x] Adicionada a biblioteca do OneSignal (`react-native-onesignal`).
  - [x] Criada a tabela `push_tokens` no banco de dados para armazenar os tokens dos dispositivos.
  - [x] Criado um `notificationService.ts` atualizado para OneSignal v5 API.
  - [x] Integrado o serviço ao `App.tsx` para lidar com o ciclo de vida de login/logout.
  - [x] Variável `ONESIGNAL_APP_ID` movida para `.env` e `env.d.ts`.
  - [ ] **Pendente:** Configuração nativa de iOS/Android e obtenção da chave real `ONESIGNAL_APP_ID` do painel OneSignal.
  - [ ] **Pendente:** Criação de Edge Function no Supabase para enviar as notificações.

- [ ] **Gerenciamento de Imagens:** Permitir múltiplas fotos por perfil, exigindo uma tabela `photos` e lógica associada.

- [ ] **Bloqueio/Denúncia de Usuários:** Crucial para a segurança, com tabelas e lógica para `blocked_users` e `reports`.

- [ ] **Ajuste Fino do Algoritmo de Recomendação:** Evoluir o algoritmo com base no comportamento do usuário.

- [ ] **Testes de Backend:** Criar testes automatizados para nossas funções de banco de dados.

- [ ] **Indexação do Banco de Dados:** Adicionar índices para otimizar a performance com o crescimento de usuários.

---

### Correções Aplicadas (Sessão Atual - 16/02/2026)

#### Correções Críticas de Infraestrutura:

1. **`supabase.ts` - Persistência de Sessão:**
   - Adicionado `@react-native-async-storage/async-storage` como dependência.
   - Configurado o cliente Supabase com `AsyncStorage` para manter a sessão do usuário entre reinicializações.
   - Adicionadas opções `autoRefreshToken`, `persistSession` e `detectSessionInUrl: false`.

2. **`.env` e `env.d.ts` - Variáveis de Ambiente:**
   - Adicionadas `ONESIGNAL_APP_ID` e `GOOGLE_WEB_CLIENT_ID` ao `.env`.
   - Atualizado `env.d.ts` para declarar as novas variáveis.

#### Correções de Navegação:

3. **`App.tsx` - Navegação Completa:**
   - Criado `MainNavigator` que envolve o `TabNavigator` + telas de detalhe.
   - Registradas as telas: `ChatDetail`, `EditProfileScreen`, `ChangePassword`, `PhotoTips`, `SummaryScreen`, `ForgotPassword`.
   - Antes, essas telas não estavam registradas em nenhum navegador, causando crashes ao navegar.

#### Correções de Telas:

4. **`LoginScreen.tsx` e `RegisterScreen.tsx` - Google Sign-In v16:**
   - Corrigida a API de `{ idToken } = await GoogleSignin.signIn()` para `response.data?.idToken`.
   - Substituído `YOUR_WEB_CLIENT_ID` hardcoded por variável de ambiente.

5. **`RegisterScreen.tsx` - Ícones de Input:**
   - Corrigidos ícones emoji (`👤`, `✉️`, `🎂`, `🔒`) para ícones Ionicons válidos (`person-outline`, `mail-outline`, `calendar-outline`, `lock-closed-outline`).

6. **`ChangePasswordScreen.tsx` - Implementação Real:**
   - Implementada a lógica de alteração de senha via `supabase.auth.updateUser({ password })`.
   - Adicionadas validações (campos vazios, senhas não coincidem, tamanho mínimo).

7. **`SettingsScreen.tsx` - Logout e Exclusão de Conta:**
   - `handleLogout` agora usa `supabase.auth.signOut()` em vez de `navigation.navigate('Initial')`.
   - `handleDeleteAccount` agora exclui o perfil do Supabase e faz sign out (antes era apenas UI).
   - Importado o `supabase` client.

8. **`ChatsScreen.tsx` - Dados Reais:**
   - Removido `CHATS_DATA` hardcoded com dados falsos.
   - Lista de mensagens agora usa dados reais dos matches do Supabase.
   - Removido modal intrusivo que abria toda vez que a tela era montada.
   - Adicionado estado vazio com mensagem amigável.

9. **`ProfileScreen.tsx` - Export:**
   - Adicionado `export default ProfileScreen` que estava faltando.

10. **`PeopleScreen.tsx` - Geolocalização:**
    - Adicionada função `updateUserLocation` que solicita permissão e atualiza a localização no banco.
    - A localização é atualizada antes de buscar recomendações.

11. **`SummaryScreen.tsx` - Salvar no Supabase:**
    - O botão "Concluir" agora salva bio e interesses no Supabase.
    - Navega para `Tabs` em vez de rota inexistente `Main`.

12. **`notificationService.ts` - OneSignal v5:**
    - Atualizado da API v4 (deprecated) para v5.
    - `OneSignal.initialize()` em vez de `OneSignal.setAppId()`.
    - `OneSignal.Notifications.requestPermission()` em vez de `promptForPushNotificationsWithUserResponse()`.
    - Novo sistema de event listeners com `addEventListener`.
    - `OneSignal.login(userId)` para associar o dispositivo ao usuário.

#### Correções de Banco de Dados:

13. **`00010_fix_rls_and_security_definer.sql` - Migração Crítica:**
    - Removida a política `"Block all client-side modifications on matches"` que usava `FOR ALL`, bloqueando inclusive SELECT (impedindo que matches fossem listados).
    - Criadas políticas específicas de INSERT/UPDATE/DELETE block para matches.
    - Re-criada a política SELECT para matches.
    - Adicionado `SECURITY DEFINER` às funções `handle_interaction`, `get_recommendations` e `get_matches` para que possam acessar dados necessários independente do RLS.
    - Corrigido `get_recommendations` para funcionar mesmo sem localização do usuário (score 0 se sem localização).
    - Adicionada política de DELETE para profiles (necessária para exclusão de conta).

---

### Histórico de Migrações:

Ordem correta de execução no Supabase SQL Editor:

1. `schema.sql` (Estrutura base)
2. `00001_get_recommendations.sql` (Função de recomendação inicial - substituída pela 00009)
3. `00002_handle_interaction.sql` (Função de interação - substituída pela 00010)
4. `00003_rls_policies.sql` (Políticas RLS base)
5. `00004_get_matches.sql` (Função de matches - substituída pela 00010)
6. `00005_messages_rls.sql` (RLS para mensagens)
7. `00006_add_birth_date_to_profiles.sql` (Coluna birth_date + view)
8. `00008_create_push_tokens_table.sql` (Tabela push_tokens)
9. `00009_fix_get_recommendations_age_calculation.sql` (Recomendação com idade - substituída pela 00010)
10. `00010_fix_rls_and_security_definer.sql` (Corrige RLS e SECURITY DEFINER - substituída pela 00011)
11. **`00011_definitive_migration.sql`** (**MIGRAÇÃO DEFINITIVA — Executar esta para configurar TUDO do zero**)

---

### Migração Definitiva (00011)

A migração `00011_definitive_migration.sql` é autossuficiente e cobre **toda** a infraestrutura do app em um único arquivo. Pode ser executada em um banco limpo (após criar o projeto no Supabase). Inclui:

- Extensão PostGIS
- Todas as tabelas: `profiles`, `interactions`, `matches`, `messages`, `push_tokens`
- Coluna `birth_date` e view `profiles_with_age`
- Trigger `handle_new_user` (cria perfil ao registrar)
- RLS em todas as tabelas com políticas granulares
- Funções RPC com `SECURITY DEFINER`: `get_recommendations`, `handle_interaction`, `get_matches`
- Função auxiliar `count_common_elements`
- Índices de performance
- Realtime habilitado para `messages`

---

### Refinamento Visual Premium (Sessão 3 - 17/02/2026)

Todas as telas e componentes receberam um refinamento visual completo, elevando a qualidade da UI para nível premium.

(... Conteúdo Omitido ...)

- Corrigido `useFocusEffect(fetchProfile)` no `EditProfileScreen.tsx` — wrapeado com `React.useCallback`.

### Correção de Desempenho (Sessão 4 - 19/02/2026)

#### Otimização de Renderização de Componentes e Contexto:

- **Problema:** O teclado era dispensado inesperadamente e a seleção de texto ficava descontrolada ao digitar nos campos de texto (inputs) nas telas de Login e Cadastro.
- **Causa Raiz:** Múltiplos componentes estavam sendo re-renderizados a cada toque de tecla, causando a perda de foco dos inputs. A investigação revelou duas causas principais:
    1.  **Componente `StyledInput`:** Não estava memoizado. Como as telas de Login/Cadastro armazenam o valor do input em seu estado, elas re-renderizavam a cada mudança, forçando uma re-renderização do `StyledInput`.
    2.  **Contexto `ThemeContext`:** O objeto `value` fornecido ao `ThemeContext.Provider` era um objeto literal (`{...}`), que era recriado em toda renderização. Isso forçava a re-renderização de todos os componentes que consumiam o contexto (incluindo o `StyledInput`), mesmo que os valores dentro do objeto não tivessem mudado.
- **Solução Aplicada:**
    1.  **`StyledInput.tsx`:** O componente foi envolvido em `React.memo` para evitar re-renderizações desnecessárias quando seus adereços (props) permanecem os mesmos. Adicionalmente, a pedido do usuário, o feedback visual de foco (borda com a cor primária e sombra) foi removido para simplificar a interface e garantir que não houvesse efeitos visuais indesejados.
    2.  **`ThemeContext.tsx`:** O valor do provedor de contexto foi memoizado usando `React.useMemo`, e a função `toggleTheme` foi envolvida em `React.useCallback`. Isso garante que o objeto de contexto só seja atualizado quando seus valores realmente mudarem, estabilizando os consumidores do contexto.

Essa abordagem dupla resolveu o problema de perda de foco, melhorou a fluidez da digitação e otimizou o desempenho geral do aplicativo, prevenindo renderizações em cascata.

**Nota:** A migração `00007` foi substituída por `00009`, que por sua vez foi substituída por `00010`. A migração `00010` é a versão final e definitiva das funções RPC.

### Ordem Correta de Execução das Migrações no Supabase SQL Editor:

Para garantir que todas as alterações de banco de dados sejam aplicadas corretamente, execute os seguintes scripts **nesta ordem**:

1.  **`00006_add_birth_date_to_profiles.sql`** (Conteúdo atualizado para apenas adicionar a coluna e criar a view)
2.  **`00009_fix_get_recommendations_age_calculation.sql`** (Conteúdo que calcula a idade diretamente na função RPC)
3.  **`00008_create_push_tokens_table.sql`** (Conteúdo para criar a tabela de tokens de push)

---
