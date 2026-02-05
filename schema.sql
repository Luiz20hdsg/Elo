-- Habilita a extensão PostGIS, necessária para geolocalização.
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Tabela de Perfis
-- Armazena informações públicas dos usuários.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[],
  -- A coluna 'location' usa o tipo GEOGRAPHY do PostGIS para armazenar coordenadas.
  location GEOGRAPHY(Point, 4326),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Interações
-- Registra as ações de 'like' e 'dislike' entre os usuários.
CREATE TABLE public.interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Garante que um usuário só pode interagir uma vez com outro.
  UNIQUE(user_id, target_user_id)
);

-- Tabela de Matches
-- Armazena os matches que ocorrem quando dois usuários dão 'like' um no outro.
CREATE TABLE public.matches (
  id BIGSERIAL PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Garante que um par de usuários só pode ter um match.
  UNIQUE(user1_id, user2_id)
);

-- Tabela de Mensagens
-- Armazena as mensagens trocadas em um chat de um match.
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função de Gatilho (Trigger Function)
-- Cria um registro na tabela 'profiles' sempre que um novo usuário se cadastra no 'auth.users'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insere o novo usuário na tabela de perfis, usando o email como username inicial.
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho (Trigger)
-- Aciona a função 'handle_new_user' após a inserção de um novo registro em 'auth.users'.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
