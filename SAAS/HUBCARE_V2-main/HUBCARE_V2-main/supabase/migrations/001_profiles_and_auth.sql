-- =====================================================
-- HUB CARE - MIGRATION 001: PROFILES, AUTH, STORAGE
-- Esta migration cria a base de auth/perfis que as
-- demais migrations (care_requests, messages, reviews,
-- transactions, etc.) dependem.
-- =====================================================

-- =====================================================
-- 1. TABELA PROFILES
-- Espelha auth.users com dados de aplicação.
-- O id SEMPRE referencia auth.users(id).
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'family'
    CHECK (role IN ('family', 'caregiver', 'admin')),
  phone VARCHAR(30),
  cpf VARCHAR(20),
  avatar_url TEXT,

  -- Específico do cuidador
  education VARCHAR(100),
  experience VARCHAR(50),
  bio TEXT,
  city VARCHAR(100),
  state VARCHAR(2),

  -- Geolocalização
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_updated_at TIMESTAMP WITH TIME ZONE,

  -- Plano e verificação
  plan_type VARCHAR(20) DEFAULT 'free'
    CHECK (plan_type IN ('free', 'premium', 'featured')),
  is_verified BOOLEAN DEFAULT FALSE,
  price_hour NUMERIC(10,2),
  availability VARCHAR(50),
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Stripe
  stripe_customer_id VARCHAR(255),
  stripe_connect_account_id VARCHAR(255),

  -- Moderação do cadastro de cuidador
  approval_status VARCHAR(20) DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger genérico de updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ler perfis públicos
-- (necessário para listar cuidadores no marketplace)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Usuário pode inserir apenas o próprio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Usuário pode atualizar apenas o próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 4. TRIGGER: cria profile automaticamente no signup
-- Lê o metadata enviado pelo supabase.auth.signUp()
-- (name, role) e cria a linha em profiles.
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, plan_type, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'family'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'family') = 'caregiver' THEN 'featured'
      ELSE 'free'
    END,
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'family') = 'caregiver' THEN 'pending'
      ELSE 'approved'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 5. STORAGE: bucket de avatares/documentos
-- Público para leitura, usuário grava na própria pasta.
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
CREATE POLICY "Avatar images are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Usuário pode fazer upload apenas na própria pasta: {user_id}/...
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 6. Helper: get_caregiver_rating
-- (movido aqui para ficar junto com a tabela profiles
-- e ser criado ANTES de qualquer migration que dependa dele)
-- =====================================================
CREATE OR REPLACE FUNCTION get_caregiver_rating(caregiver_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, total_reviews BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
    COUNT(*) AS total_reviews
  FROM reviews
  WHERE reviewed_id = caregiver_uuid;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_caregiver_rating TO anon, authenticated;

-- =====================================================
-- 7. Grants finais
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;