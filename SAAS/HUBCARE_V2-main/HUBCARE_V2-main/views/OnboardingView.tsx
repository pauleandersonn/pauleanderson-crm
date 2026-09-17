
import React, { useState, useRef } from 'react';
import {
  Heart,
  UserCircle,
  Users,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Briefcase,
  Lock,
  Mail,
  Smartphone,
  FileText,
  ShieldAlert,
  Loader2,
  Upload,
  CheckCircle2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Role } from '../types';
import { supabase } from '../supabaseClient';

interface OnboardingViewProps {
  onLogin: (role: Role) => void;
}

type OnboardingState = 'entry' | 'register_family' | 'register_caregiver' | 'login' | 'forgot_password';

const OnboardingView: React.FC<OnboardingViewProps> = ({ onLogin }) => {
  const [state, setState] = useState<OnboardingState>('entry');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para upload de documento
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para termos de aceite
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedCaregiver, setTermsAcceptedCaregiver] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    education: 'Cuidador',
    experience: '',
    bio: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(null);
  };

  const goBack = () => {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
    else setState('entry');
  };

  const nextStep = () => setStep(step + 1);

  const handleResetPassword = async () => {
    if (!formData.email) {
      setErrorMessage("Por favor, digite seu e-mail.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setErrorMessage("✅ E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      console.error('Erro reset password:', error);
      let msg = error.message || "Erro ao enviar e-mail.";
      if (msg.includes("Failed to fetch")) msg = "Erro de conexão. Verifique sua internet.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handler para seleção de arquivo de documento
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Formato de arquivo não suportado. Use JPG, PNG, WebP ou PDF.');
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Arquivo muito grande. O tamanho máximo é 5MB.');
        return;
      }

      setDocumentFile(file);
      setErrorMessage(null);

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    }
  };

  // Remover documento selecionado
  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload do documento para Supabase Storage
  const uploadDocumentToStorage = async (userId: string): Promise<string | null> => {
    if (!documentFile) return null;

    setUploadingDocument(true);
    try {
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${userId}/document_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, documentFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      throw new Error('Falha no upload do documento: ' + error.message);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleRegister = async (role: Role) => {
    // Validar termos de aceite
    if (role === 'family' && !termsAccepted) {
      setErrorMessage("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }
    if (role === 'caregiver' && !termsAcceptedCaregiver) {
      setErrorMessage("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    // Validar documento para cuidadores
    if (role === 'caregiver' && !documentFile) {
      setErrorMessage("Você precisa fazer upload de um documento com foto.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user && authData.session) {
        // 2. Upload documento se for cuidador (agora temos sessão válida)
        let avatarUrl: string | null = null;
        if (role === 'caregiver' && documentFile) {
          avatarUrl = await uploadDocumentToStorage(authData.user.id);
        }

        // 3. Atualizar o perfil criado pelo trigger com dados adicionais
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone,
            cpf: formData.cpf,
            education: role === 'caregiver' ? formData.education : null,
            experience: role === 'caregiver' ? formData.experience : null,
            bio: role === 'caregiver' ? formData.bio : null,
            city: role === 'caregiver' ? formData.city : null,
            avatar_url: avatarUrl,
            plan_type: role === 'caregiver' ? 'featured' : 'free'
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          // Se falhar o update, tenta upsert como fallback
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              name: formData.name,
              role: role,
              phone: formData.phone,
              cpf: formData.cpf,
              education: role === 'caregiver' ? formData.education : null,
              experience: role === 'caregiver' ? formData.experience : null,
              bio: role === 'caregiver' ? formData.bio : null,
              city: role === 'caregiver' ? formData.city : null,
              avatar_url: avatarUrl,
              plan_type: role === 'caregiver' ? 'featured' : 'free'
            });

          if (upsertError) throw upsertError;
        }

        onLogin(role);
      } else if (authData.user && !authData.session) {
        // Usuário criado mas precisa confirmar email
        setErrorMessage("Conta criada! Verifique seu email para confirmar o cadastro.");
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Erro detalhado no registro:', error);

      let msg = error.message || "Erro ao criar conta.";

      // Tratamento de erros comuns
      if (msg.includes("Failed to fetch")) {
        msg = "Não foi possível conectar ao servidor (Failed to fetch). Verifique sua internet, se o servidor backend está rodando, ou se algum AdBlock está bloqueando a conexão.";
      } else if (msg.includes("weak_password")) {
        msg = "Senha muito fraca. Use letras, números e símbolos.";
      } else if (msg.includes("User already registered")) {
        msg = "Este e-mail já está cadastrado.";
      }

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch profile to get role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Fallback to metadata if profile fetch fails or role missing
        const role = profile?.role || data.user.user_metadata?.role || 'family';
        onLogin(role as Role);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = (totalSteps: number) => (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step > i ? 'bg-emerald-500' : 'bg-slate-200'}`} />
      ))}
    </div>
  );

  const renderEntry = () => (
    <div className="p-8 flex flex-col items-center text-center space-y-8 animate-in fade-in duration-500">
      <div className="mt-12 space-y-4">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm border border-emerald-50">
          <Heart className="w-10 h-10 fill-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hub Care</h1>
        <p className="text-slate-500 text-sm max-w-[240px] mx-auto leading-relaxed">
          Conectando famílias e profissionais para um cuidado hospitalar humano.
        </p>
      </div>

      <div className="w-full space-y-3 pt-8">
        <EntryButton
          icon={<Users className="w-6 h-6" />}
          title="Sou Familiar"
          description="Acompanhar um paciente"
          onClick={() => { setState('register_family'); setStep(1); setErrorMessage(null); }}
        />
        <EntryButton
          icon={<Stethoscope className="w-6 h-6" />}
          title="Sou Cuidador"
          description="Oferecer meus serviços"
          onClick={() => { setState('register_caregiver'); setStep(1); setErrorMessage(null); }}
        />
      </div>

      <p className="text-xs text-slate-400">
        Já tem uma conta? <button onClick={() => { setState('login'); setErrorMessage(null); }} className="text-emerald-600 font-bold hover:underline">Entrar agora</button>
      </p>
    </div>
  );

  const renderRegisterFamily = () => (
    <div className="p-8 animate-in slide-in-from-right duration-300">
      <button onClick={goBack} className="mb-6 flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-slate-600">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro Familiar</h2>
      <p className="text-slate-500 text-sm mb-6">Centralize o cuidado e a comunicação da sua família.</p>

      {renderProgress(2)}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <Input name="name" value={formData.name} onChange={handleChange} label="Nome completo" placeholder="Ex: Ana Silva" icon={<UserCircle className="w-4 h-4" />} />
          <Input name="cpf" value={formData.cpf} onChange={handleChange} label="CPF" placeholder="000.000.000-00" icon={<ShieldCheck className="w-4 h-4" />} />
          <Input name="email" value={formData.email} onChange={handleChange} label="E-mail" placeholder="ana@exemplo.com" icon={<Mail className="w-4 h-4" />} />
          <Input name="phone" value={formData.phone} onChange={handleChange} label="Telefone/WhatsApp" placeholder="(11) 99999-9999" icon={<Smartphone className="w-4 h-4" />} />
          <button onClick={nextStep} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-6">
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input name="password" value={formData.password} onChange={handleChange} label="Criar senha" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />
          <Input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} label="Confirmar senha" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-emerald-600"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
              Aceito os <span className="text-emerald-600 font-bold underline cursor-pointer">Termos de Uso</span> e a <span className="text-emerald-600 font-bold underline cursor-pointer">Política de Privacidade</span>.
            </label>
          </div>
          <button
            onClick={() => handleRegister('family')}
            disabled={loading || !termsAccepted}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg mt-6 flex justify-center items-center transition-all ${termsAccepted
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar conta'}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Já tem uma conta? <button onClick={() => { setState('login'); setErrorMessage(null); }} className="text-emerald-600 font-bold hover:underline">Faça login</button>
          </p>
        </div>
      )}
    </div>
  );

  const renderRegisterCaregiver = () => (
    <div className="p-8 animate-in slide-in-from-right duration-300">
      <button onClick={goBack} className="mb-6 flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-slate-600">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro Cuidador</h2>

      {renderProgress(3)}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Input name="name" value={formData.name} onChange={handleChange} label="Nome completo" placeholder="Ex: João Técnico" icon={<UserCircle className="w-4 h-4" />} />
          <Input name="cpf" value={formData.cpf} onChange={handleChange} label="CPF" placeholder="000.000.000-00" icon={<ShieldCheck className="w-4 h-4" />} />
          <Input name="email" value={formData.email} onChange={handleChange} label="E-mail" placeholder="joao@exemplo.com" icon={<Mail className="w-4 h-4" />} />
          <Input name="phone" value={formData.phone} onChange={handleChange} label="Telefone" placeholder="(11) 99999-9999" icon={<Smartphone className="w-4 h-4" />} />
          <button onClick={nextStep} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg mt-6">Continuar</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formação/Tipo</label>
            <select name="education" value={formData.education} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Cuidador">Cuidador</option>
              <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
              <option value="Enfermagem">Enfermagem</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <Input name="experience" value={formData.experience} onChange={handleChange} label="Experiência (anos)" type="number" placeholder="5" icon={<Briefcase className="w-4 h-4" />} />
          <Input name="bio" value={formData.bio} onChange={handleChange} label="Bio Curta" placeholder="Conte um pouco sobre seu trabalho..." />
          <Input name="city" value={formData.city} onChange={handleChange} label="Cidade / Bairro" placeholder="São Paulo, SP" icon={<MapPin className="w-4 h-4" />} />

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] text-emerald-800 leading-tight">
              <strong>Verificação:</strong> Você precisará anexar um documento com foto no próximo passo para ser aprovado.
            </p>
          </div>
          <button onClick={nextStep} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg mt-2">Continuar</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documentação</label>

            {/* Input file oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDocumentSelect}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              id="document-upload"
            />

            {/* Área de upload ou preview */}
            {!documentFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 hover:bg-slate-50 hover:border-emerald-300 transition-all flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8" />
                <span className="text-xs font-bold">Clique para fazer upload</span>
                <span className="text-[10px] text-slate-300">JPG, PNG, WebP ou PDF (máx. 5MB)</span>
              </button>
            ) : (
              <div className="relative border-2 border-emerald-300 rounded-2xl p-4 bg-emerald-50">
                <button
                  type="button"
                  onClick={removeDocument}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  {documentPreview ? (
                    <img
                      src={documentPreview}
                      alt="Preview do documento"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{documentFile.name}</p>
                    <p className="text-xs text-slate-400">{(documentFile.size / 1024).toFixed(1)} KB</p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-medium">Arquivo selecionado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Input name="password" value={formData.password} onChange={handleChange} label="Criar senha" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />
            <Input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} label="Confirmar senha" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />
          </div>

          {/* Termos de aceite para cuidador */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-emerald-600"
              id="terms-caregiver"
              checked={termsAcceptedCaregiver}
              onChange={(e) => setTermsAcceptedCaregiver(e.target.checked)}
            />
            <label htmlFor="terms-caregiver" className="text-xs text-slate-500 leading-relaxed">
              Aceito os <span className="text-emerald-600 font-bold underline cursor-pointer">Termos de Uso</span> e a <span className="text-emerald-600 font-bold underline cursor-pointer">Política de Privacidade</span>.
            </label>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-800 text-center">
            <p className="text-xs font-bold">Cadastro pendente de aprovação</p>
            <p className="text-[10px] opacity-80 mt-1">Nossa equipe verificará seus dados em até 24h.</p>
          </div>

          <button
            onClick={() => handleRegister('caregiver')}
            disabled={loading || uploadingDocument || !termsAcceptedCaregiver || !documentFile}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg flex justify-center items-center transition-all ${(termsAcceptedCaregiver && documentFile)
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
          >
            {loading || uploadingDocument ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{uploadingDocument ? 'Enviando documento...' : 'Criando conta...'}</span>
              </div>
            ) : (
              'Enviar cadastro'
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Já tem uma conta? <button onClick={() => { setState('login'); setErrorMessage(null); }} className="text-emerald-600 font-bold hover:underline">Faça login</button>
          </p>
        </div>
      )}
    </div>
  );

  const renderLogin = () => (
    <div className="p-8 animate-in slide-in-from-bottom duration-300">
      <button onClick={() => { setState('entry'); setErrorMessage(null); }} className="mb-6 flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-slate-600">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
        <p className="text-slate-500 text-sm">Acesse sua conta para continuar o cuidado.</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <Input name="email" value={formData.email} onChange={handleChange} label="E-mail" placeholder="seu@email.com" icon={<Mail className="w-4 h-4" />} />
        <Input name="password" value={formData.password} onChange={handleChange} label="Senha" type="password" placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />

        <div className="flex justify-end pt-1">
          <button onClick={() => { setState('forgot_password'); setErrorMessage(null); }} className="text-xs text-slate-500 hover:text-emerald-600 font-medium">Esqueci minha senha</button>
        </div>

        <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg mt-4 flex justify-center items-center">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">
          Não tem uma conta? <button onClick={() => { setState('entry'); setErrorMessage(null); }} className="text-emerald-600 font-bold hover:underline">Cadastre-se</button>
        </p>
      </div>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="p-8 animate-in slide-in-from-right duration-300">
      <button onClick={() => { setState('login'); setErrorMessage(null); }} className="mb-6 flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-slate-600">
        <ArrowLeft className="w-4 h-4" /> Voltar para Login
      </button>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Recuperar senha</h2>
        <p className="text-slate-500 text-sm">Digite seu e-mail para receber um link de redefinição.</p>
      </div>

      {errorMessage && (
        <div className={`mb-4 p-3 text-sm rounded-xl border ${errorMessage.includes('✅') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <Input name="email" value={formData.email} onChange={handleChange} label="E-mail" placeholder="seu@email.com" icon={<Mail className="w-4 h-4" />} />

        <button onClick={handleResetPassword} disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg mt-6 flex justify-center items-center">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar e-mail'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto flex flex-col shadow-2xl relative">
      <div className="flex-1 overflow-y-auto">
        {state === 'entry' && renderEntry()}
        {state === 'register_family' && renderRegisterFamily()}
        {state === 'register_caregiver' && renderRegisterCaregiver()}
        {state === 'login' && renderLogin()}
        {state === 'forgot_password' && renderForgotPassword()}
      </div>
    </div>
  );
};

const EntryButton: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
  <button onClick={onClick} className="w-full p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 text-left shadow-sm hover:shadow-md hover:border-emerald-200 transition-all active:scale-[0.98] group">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
  </button>
);

const Input: React.FC<{
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  name?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, placeholder, type = 'text', icon, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-300`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export default OnboardingView;
