
import fs from 'fs';
import path from 'path';

console.log('Iniciando teste de conexão...');

try {
    const envPath = path.resolve('.env');
    if (!fs.existsSync(envPath)) {
        console.error('Arquivo .env não encontrado!');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });

    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;

    console.log(`URL Identificada: ${url}`);

    if (!url) {
        console.error('URL não encontrada no .env');
        process.exit(1);
    }

    // Teste de fetch
    console.log('Tentando fetch na URL...');
    const response = await fetch(`${url}/rest/v1/`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });

    console.log(`Response Status: ${response.status}`);

    if (response.ok) {
        console.log('✅ CONEXÃO BEM SUCEDIDA!');
    } else {
        console.log('❌ Falha na resposta:', response.statusText);
        const text = await response.text();
        console.log('Corpo da resposta:', text);
    }

} catch (error) {
    console.error('❌ ERRO CRÍTICO (Failed to fetch):');
    console.error(error);
    if (error.cause) console.error('Causa:', error.cause);
}
