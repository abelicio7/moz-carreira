-- ==========================================
-- SCRIPT DE CRIAÇÃO DA BASE DE DADOS COMPLETO
-- Copie este conteúdo e cole no SQL Editor do Supabase
-- ==========================================

-- 1. TIPOS CUSTOMIZADOS (ENUMS)
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.plano_tipo AS ENUM ('gratuito','premium');
CREATE TYPE public.cv_status AS ENUM ('rascunho','concluido','arquivado');
CREATE TYPE public.carta_tipo AS ENUM ('apresentacao','motivacao');

-- 2. FUNÇÕES COMUNS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 3. TABELA DE PERFIS DE UTILIZADOR
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  telefone TEXT,
  pais TEXT NOT NULL DEFAULT 'Moçambique',
  idioma TEXT NOT NULL DEFAULT 'pt-MZ',
  plano public.plano_tipo NOT NULL DEFAULT 'gratuito',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. TABELA DE FUNÇÕES E CONTROLO DE ACESSO
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Utilizadores veem o seu perfil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Utilizadores criam o seu perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Utilizadores atualizam o seu perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Utilizadores veem as suas funcoes" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- 5. TRIGGER DE SINCRONIZAÇÃO AUTOMÁTICA DE REGISTO (AUTH -> PUBLIC)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, telefone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name',''), NEW.email, NEW.raw_user_meta_data->>'telefone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. TABELA DE CURRÍCULOS (CVs)
CREATE TABLE public.curriculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT 'Novo currículo',
  modelo TEXT NOT NULL DEFAULT 'minimalista',
  idioma TEXT NOT NULL DEFAULT 'pt-MZ',
  cor_principal TEXT NOT NULL DEFAULT '#1B4079',
  tipografia TEXT NOT NULL DEFAULT 'inter',
  espacamento TEXT NOT NULL DEFAULT 'normal',
  tamanho_fonte SMALLINT NOT NULL DEFAULT 11,
  ordem_seccoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  seccoes_visiveis JSONB NOT NULL DEFAULT '{}'::jsonb,
  dados_pessoais JSONB NOT NULL DEFAULT '{}'::jsonb,
  foto TEXT,
  status public.cv_status NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculos TO authenticated;
GRANT ALL ON public.curriculos TO service_role;
ALTER TABLE public.curriculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dono gere os seus curriculos" ON public.curriculos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins veem curriculos" ON public.curriculos FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_curriculos_updated BEFORE UPDATE ON public.curriculos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_curriculos_user ON public.curriculos(user_id);

-- 7. TABELAS SECUNDÁRIAS DO CURRÍCULO
CREATE TABLE public.experiencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa TEXT NOT NULL DEFAULT '', cargo TEXT NOT NULL DEFAULT '', descricao TEXT,
  local TEXT, data_inicio TEXT, data_fim TEXT, atual BOOLEAN NOT NULL DEFAULT false,
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.formacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instituicao TEXT NOT NULL DEFAULT '', curso TEXT NOT NULL DEFAULT '', nivel TEXT,
  descricao TEXT, data_inicio TEXT, data_fim TEXT, atual BOOLEAN NOT NULL DEFAULT false,
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '', nivel SMALLINT NOT NULL DEFAULT 3,
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.idiomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idioma TEXT NOT NULL DEFAULT '', nivel TEXT NOT NULL DEFAULT 'Intermédio',
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '', instituicao TEXT, data TEXT, url TEXT,
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '', descricao TEXT, url TEXT, data TEXT,
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.referencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id UUID NOT NULL REFERENCES public.curriculos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '', cargo TEXT, empresa TEXT, telefone TEXT, email TEXT,
  ordem SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.cartas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curriculo_id UUID REFERENCES public.curriculos(id) ON DELETE SET NULL,
  tipo public.carta_tipo NOT NULL DEFAULT 'apresentacao',
  titulo TEXT NOT NULL DEFAULT 'Nova carta', conteudo TEXT NOT NULL DEFAULT '',
  idioma TEXT NOT NULL DEFAULT 'pt-MZ',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_cartas_updated BEFORE UPDATE ON public.cartas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. APLICAÇÃO DE POLÍTICAS E CONTROLO DE SEGURANÇA POR LOOP DO
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['experiencias','formacoes','competencias','idiomas','certificados','projetos','referencias','cartas'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "Dono gere %1$s" ON public.%1$I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', t);
    EXECUTE format('CREATE INDEX idx_%1$s_user ON public.%1$I(user_id);', t);
  END LOOP;
END $$;

-- 9. PERMISSÕES DE EXECUÇÃO E SEGURANÇA ADICIONAL
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
