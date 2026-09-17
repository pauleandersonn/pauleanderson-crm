
const fs = require('fs');

// Ler .env manualmente
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('Key:', key ? key.substring(0, 10) + '...' : 'MISSING');

if (!url || !key) {
    console.error('Missing credentials');
    process.exit(1);
}

// Teste 1: Conexão Direta HTTP com a URL base
// Supabase geralmente retorna um JSON na raiz ou 404, mas responde.
// Um endpoint garantido é /rest/v1/ com API Key
async function test() {
    try {
        console.log('\n--- Teste 1: GET /rest/v1/ (Check Service) ---');
        const response = await fetch(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        if (response.ok || response.status === 404) {
            console.log('✅ Serviço acessível via rede.');
        } else {
            console.log('❌ Serviço retornou erro HTTP:', response.status);
        }

    } catch (error) {
        console.error('❌ Falha na conexão de rede (Failed to fetch):', error.cause || error.message);
    }
}

test();
