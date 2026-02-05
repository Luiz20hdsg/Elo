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
- [ ] **Implementar busca de dados do perfil do usuário logado.**
  - Tentativa de implementação na `ProfileScreen.tsx` falhou devido a problemas com a ferramenta `replace`.
  - Plano para a próxima tentativa:
    1. Adicionar estado para `profile` e `loading`.
    2. Importar `supabase`.
    3. Usar `useFocusEffect` para buscar dados na ativação da tela.
    4. Implementar `fetchProfile` para:
        * Ativar `loading`.
        * Obter usuário atual via `supabase.auth.getUser()`.
        * Buscar perfil do usuário na tabela `profiles`.
        * Atualizar o estado `profile`.
        * Tratar erros com alertas.
        * Desativar `loading`.
    5. Atualizar a UI com os dados do `profile` e adicionar um indicador de `loading`.
    6. Alterar `handleLogout` para chamar `supabase.auth.signOut()`.
    7. Fazer o botão "Completar perfil" navegar para `EditProfileScreen`.
- [ ] Implementar a edição de informações do perfil (nome, bio, interesses).
- [ ] Implementar o upload de fotos para o Supabase Storage e associá-las ao perfil.
- [ ] Implementar a coleta e atualização da localização do usuário.
- [ ] Configurar Políticas de Segurança (RLS) para a tabela `profiles`.

### Fase 3: Descoberta de Pessoas e Interações (Matchmaking)
- [ ] **Algoritmo de Recomendação (Função RPC):**
  - [ ] Criar uma função no banco de dados `get_recommendations()` que retorna uma lista de usuários.
  - [ ] O "score" de recomendação será baseado em:
    - **Proximidade:** Calcular a distância usando PostGIS (maior score para menor distância).
    - **Interesses em Comum:** Comparar arrays de `interests` (maior score para mais interesses em comum).
  - [ ] A função deve filtrar usuários já interagidos ou que são matches.
- [ ] Implementar a funcionalidade de **"like" / "dislike"** na UI, que chamará a função de interação.
- [ ] Criar uma função no DB que, ao receber um "like", verifica se é mútuo e, em caso afirmativo, cria um registro na tabela `matches`.
- [ ] Configurar RLS para `interactions` e `matches`.

### Fase 4: Chat em Tempo Real
- [ ] Implementar a busca da lista de `matches` (conversas) do usuário.
- [ ] Ativar o serviço de **Realtime** do Supabase para a tabela `messages`.
- [ ] Implementar a tela de chat para buscar o histórico e receber novas mensagens em tempo real.
- [ ] Implementar a função de envio de mensagens.
- [ ] Configurar RLS para `messages` para garantir a privacidade das conversas.
