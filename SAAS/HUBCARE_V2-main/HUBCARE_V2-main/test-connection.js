
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Carregar variáveis do .env manualmente
const envConfig = dotenv.parse(fs.readFileSync('.env'))
const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY

console.log('Testando conexão com Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key (primeiros 10 chars):', supabaseAnonKey?.substring(0, 10))

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO: Credenciais não encontradas!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    try {
        // Tenta fazer um select simples na tabela profiles
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })

        if (error) {
            console.error('ERRO ao conectar:', error.message)
            console.error('Detalhes:', error)
        } else {
            console.log('SUCESSO! Conexão estabelecida.')
        }

        // Testa autenticação (signup fake para ver se endpoint responde)
        // Não vamos criar usuário real, apenas verificar se auth service responde
        const { data: config, error: configError } = await supabase.auth.getSession()
        if (configError) {
            console.error('ERRO no Auth Service:', configError.message)
        } else {
            console.log('Auth Service respondendo.')
        }

    } catch (err) {
        console.error('ERRO DE EXECUÇÃO:', err)
    }
}

testConnection()
