
import { createClient } from '@supabase/supabase-js'


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Inicializando Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key presente:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    const msg = 'Erro Crítico: Variáveis de ambiente do Supabase não encontradas. Por favor, cheque seu arquivo .env e reinicie o servidor.';
    console.error(msg);
    alert(msg);
    throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

