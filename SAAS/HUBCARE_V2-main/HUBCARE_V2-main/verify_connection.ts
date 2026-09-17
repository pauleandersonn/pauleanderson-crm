
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

console.log('--- Iniciando Teste de Conectividade Supabase ---')

// Ler .env manualmente para não depender de dotenv
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
            if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value;
        }
    });
}

console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : 'Não encontrada'}`);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERRO: Credenciais não encontradas no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    try {
        console.log('\n1. Testando SELECT na tabela profiles...');
        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Erro no SELECT:', error.message);
            if (error.cause) console.error('   Causa:', error.cause);
        } else {
            console.log('✅ Conexão com Banco de Dados OK!');
        }

        console.log('\n2. Testando Auth Service (getSession)...');
        const { data: authData, error: authError } = await supabase.auth.getSession();

        if (authError) {
            console.error('❌ Erro no Auth:', authError.message);
        } else {
            console.log('✅ Serviço de Auth OK!');
        }

        console.log('\n3. Testando Storage (List Buckets)...');
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

        if (storageError) {
            console.error('❌ Erro no Storage:', storageError.message);
        } else {
            console.log(`✅ Storage OK! Encontrados ${buckets?.length || 0} buckets.`);
            buckets?.forEach(b => console.log(`   - ${b.name} (${b.public ? 'public' : 'private'})`));
        }

    } catch (err: any) {
        console.error('❌ EXCEÇÃO NÃO TRATADA:', err.message);
        if (err.cause) console.error('Causa:', err.cause);
    }
}

runTest();
