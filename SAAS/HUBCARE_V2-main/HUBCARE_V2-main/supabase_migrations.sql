-- =====================================================
-- HUB CARE - MIGRAÇÕES SUPABASE
-- Gerado em: 2024
-- =====================================================

-- =====================================================
-- 1. TABELA CARE_REQUESTS (Fluxo de Contratação Real)
-- =====================================================
CREATE TABLE IF NOT EXISTS care_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  family_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'finished', 'cancelled')),
  shift VARCHAR(10) CHECK (shift IN ('diurno', 'noturno', '24h')),
  care_type VARCHAR(20) CHECK (care_type IN ('domiciliar', 'hospitalar')),
  contract_type VARCHAR(20) CHECK (contract_type IN ('diaria', 'semanal', 'mensal')),
  agreed_value DECIMAL(10,2),
  city VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  notes TEXT,
  -- Geolocalização da solicitação
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_care_requests_caregiver ON care_requests(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_family ON care_requests(family_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_status ON care_requests(status);
CREATE INDEX IF NOT EXISTS idx_care_requests_created ON care_requests(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_care_requests_updated_at ON care_requests;
CREATE TRIGGER update_care_requests_updated_at
  BEFORE UPDATE ON care_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE care_requests ENABLE ROW LEVEL SECURITY;

-- Famílias podem ver suas próprias solicitações
CREATE POLICY "Families can view own requests" ON care_requests
  FOR SELECT USING (auth.uid() = family_id);

-- Cuidadores podem ver solicitações direcionadas a eles ou pendentes
CREATE POLICY "Caregivers can view their requests" ON care_requests
  FOR SELECT USING (
    auth.uid() = caregiver_id OR 
    (status = 'pending' AND caregiver_id IS NOT NULL)
  );

-- Famílias podem criar solicitações
CREATE POLICY "Families can create requests" ON care_requests
  FOR INSERT WITH CHECK (auth.uid() = family_id);

-- Cuidadores podem atualizar status de suas solicitações
CREATE POLICY "Caregivers can update their requests" ON care_requests
  FOR UPDATE USING (auth.uid() = caregiver_id);

-- Famílias podem atualizar suas solicitações
CREATE POLICY "Families can update own requests" ON care_requests
  FOR UPDATE USING (auth.uid() = family_id);

-- =====================================================
-- 2. ATUALIZAÇÃO DA TABELA PROFILES (Geolocalização)
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

-- Índice geoespacial para busca por proximidade
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);

-- =====================================================
-- 3. TABELA MESSAGES (Chat em Tempo Real)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  care_request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_request ON messages(care_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(care_request_id, is_read) WHERE is_read = FALSE;

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver mensagens de suas care_requests
CREATE POLICY "Users can view messages of their requests" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM care_requests cr 
      WHERE cr.id = messages.care_request_id 
      AND (cr.family_id = auth.uid() OR cr.caregiver_id = auth.uid())
    )
  );

-- Usuários podem enviar mensagens em suas care_requests
CREATE POLICY "Users can send messages in their requests" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM care_requests cr 
      WHERE cr.id = care_request_id 
      AND (cr.family_id = auth.uid() OR cr.caregiver_id = auth.uid())
      AND cr.status = 'accepted'
    )
  );

-- Habilitar Realtime para mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- 4. TABELA REVIEWS (Sistema de Avaliações)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  care_request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  reviewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_type VARCHAR(20) CHECK (review_type IN ('family_to_caregiver', 'caregiver_to_family')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(reviewed_id, rating);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Todos podem ver reviews (para médias públicas)
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

-- Usuários podem criar review apenas para suas care_requests finalizadas
CREATE POLICY "Users can create reviews for finished requests" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM care_requests cr 
      WHERE cr.id = care_request_id 
      AND cr.status = 'finished'
      AND (cr.family_id = auth.uid() OR cr.caregiver_id = auth.uid())
    )
  );

-- Função para calcular média de avaliações
CREATE OR REPLACE FUNCTION get_caregiver_rating(caregiver_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, total_reviews BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*) as total_reviews
  FROM reviews
  WHERE reviewed_id = caregiver_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TABELA PUSH_SUBSCRIPTIONS (Web Push)
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. TABELA TRANSACTIONS (Pagamentos Stripe)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  care_request_id UUID REFERENCES care_requests(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  payee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Valores
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  metadata JSONB
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_payer ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payee ON transactions(payee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON transactions(stripe_payment_intent_id);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- =====================================================
-- 7. TABELA PAYMENT_METHODS (Métodos de Pagamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'card', 'pix'
  last_four VARCHAR(4),
  brand VARCHAR(20), -- 'visa', 'mastercard', etc
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Adicionar stripe_customer_id ao profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR(255);

-- =====================================================
-- 8. HABILITAR REALTIME PARA CARE_REQUESTS
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE care_requests;

-- =====================================================
-- FINAL: Grants para acesso anônimo em funções públicas
-- =====================================================
GRANT EXECUTE ON FUNCTION get_caregiver_rating TO anon, authenticated;
