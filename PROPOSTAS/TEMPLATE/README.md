# Template `proposta-pauleandersonn.html`

Template reutilizável de proposta comercial, otimizado pra cliente institucional ou particular do **Pauleandersonn Souza / MCR**.

Baseado na proposta real enviada ao **Instituto Consulado da Mulher** em 07/07/2026 (única que passou por revisão de design + validação WCAG).

---

## 🚀 Como usar em 3 passos

### 1. Copie o template

```bash
cp proposta-pauleandersonn.html proposta-NOME-DO-CLIENTE.html
```

### 2. Edite os placeholders

Abra o arquivo em qualquer editor (VS Code, Sublime, até Bloco de Notas) e faça **Buscar → Substituir** dos placeholders abaixo.

**Atalhos por editor:**
- **VS Code**: `Ctrl+H` → `Ctrl+Alt+Enter` pra todas as ocorrências
- **Sublime**: `Ctrl+H` → `Replace All`

### 3. Gere o PDF

```bash
# Subir servidor local
cd "C:\Users\paule\Documents\PROGRAMAÇÃO\PROPOSTAS\NOME-DO-CLIENTE"
python -m http.server 8000

# Abrir no Chrome/Edge: http://localhost:8000/proposta-NOME.html
# Ctrl+P → Salvar como PDF
# Margens: nenhuma | Gráficos de fundo: ativado
```

Ou via Edge headless (CI):
```bash
msedge --headless --print-to-pdf="proposta.pdf" "http://localhost:8000/proposta.html"
```

---

## 📋 Lista de placeholders (ordem de edição)

### Hero
| Placeholder | Exemplo | Notas |
|---|---|---|
| `{{DATA_PROPOSTA}}` | `07 de julho de 2026` | Aparece no eyebrow do hero |
| `{{PROGRAMA_TITULO}}` | `Formação Fotografia da Mulher Empreendedora` | H1 do hero |
| `{{PROGRAMA_SUBTITULO}}` | `Programa de 40 horas em 7 encontros práticos, do celular ao portfólio` | Subtítulo do hero |
| `{{CARGA_HORARIA}}` | `40h` | Aparece em pill + ao longo do texto |
| `{{NUMERO_ENCONTROS}}` | `7` | Aparece em pill + tabela |
| `{{NUMERO_ALUNAS}}` | `60` | Aparece em pill + seção 5 |
| `{{ANO}}` | `2026` | Aparece em pill |

### Sobre você
| Placeholder | Exemplo | Notas |
|---|---|---|
| `{{MEU_NOME}}` | `Pauleandersonn Souza` | **Não muda** se for sempre você |
| `{{MEU_TITULO}}` | `publicitário, fotógrafo e instrutor` | Adapte ao programa (mentor / diretor / etc) |
| `{{FRASE_ANCORA}}` | `O celular é o único estúdio que elas já têm...` | Citação que aparece no `.crta` |

### Sobre o cliente
| Placeholder | Exemplo | Notas |
|---|---|---|
| `{{PARAGRAFO_TRANSICAO_CLIENTE}}` | `Essa experiência prévia é a base desta proposta...` | Liga sua experiência ao cliente |
| `{{PARAGRAFO_ENTENDIMENTO_CLIENTE}}` | `O Instituto Consulado da Mulher atende 60 mulheres...` | **Reescrever** pra cada cliente |
| `{{CLIENTE_NOME}}` | `Instituto Consulado da Mulher` | Aparece no título + na seção 6 |

### Metodologia
| Placeholder | Exemplo |
|---|---|
| `{{PARAGRAFO_METODOLOGIA}}` | (parágrafo introdutório da abordagem) |
| `{{PILAR_1_TITULO}}` / `{{PILAR_1_DESC}}` | `Inspirar` / `Criar conexão genuína com o público` |
| `{{PILAR_2_TITULO}}` / `{{PILAR_2_DESC}}` | `Comunicar` / `...` |
| `{{PILAR_3_TITULO}}` / `{{PILAR_3_DESC}}` | `Transformar` / `...` |

### Programação (7 encontros)
| Placeholder | Notas |
|---|---|
| `{{HORAS_POR_ENCONTRO}}` | Ex: `6` (6h × 6 encontros = 36h + 4h final = 40h) |
| `{{ENCONTRO_N_TEMA}}` | Tema de cada um dos 7 encontros |
| `{{ENCONTRO_N_ENTREGAVEL}}` | O que a aluna leva de cada encontro |

> **Dica**: apague as linhas dos encontros que não usar (se for programa menor).

### Logística
| Placeholder | Exemplo |
|---|---|
| `{{LOCAL}}` | `Espaços do Instituto (Monte das Oliveiras + Santos Dumont)` |
| `{{PERIODO}}` | `Agosto-Setembro 2026, sábados 8h-14h` |
| `{{FORMATO}}` | `6 encontros de 6h + 1 de fechamento de 4h` |
| `{{PUBLICO}}` | `Mulheres em situação de vulnerabilidade` |

### Investimento
| Placeholder | Exemplo |
|---|---|
| `{{VALOR_TOTAL}}` | `R$ 6.000` |
| `{{VALOR_DESCRICAO}}` | `Pagamento total pela formação de 60 alunas em 40 horas...` |
| `{{PAGAMENTO_1_VALOR}}` | `R$ 2.000` |
| `{{PAGAMENTO_2_VALOR}}` | `R$ 2.000` |
| `{{PAGAMENTO_2_ENCONTRO}}` | `3` (meio do programa) |
| `{{PAGAMENTO_3_VALOR}}` | `R$ 2.000` |
| `{{PAGAMENTO_3_ENCONTRO}}` | `7` (entrega final) |

> **Se preferir 3 cenários** (A/B/C em vez de valor único), copie o bloco `.grid3` da v1 do Instituto (proposta-pauleandersonn-V1-backup.html) e cole aqui no lugar do `.pricebox`.

### Diferenciais
| Placeholder | Exemplo |
|---|---|
| `{{DIFERENCIAL_N_TITULO}}` / `{{DIFERENCIAL_N_DESC}}` | `Tom respeitoso` / `Método adaptado pra mulheres em vulnerabilidade...` |

### Próximos passos
| Placeholder | Exemplo |
|---|---|
| `{{DATA_CONFIRMACAO}}` | `15 de julho de 2026` (data limite pra resposta) |

### Contato fixo (não muda)
- `{{WHATSAPP}}` → `(92) 99241-1099`
- `{{WHATSAPP_NUMERO}}` → `5592992411099` (formato wa.me)

---

## 🎨 Customização rápida

### Mudar a cor de destaque (de dourado pra azul, vermelho, etc)

Edite na seção `:root` do `<style>`:

```css
:root{
  --ink:#111418;        /* preto suave — manter */
  --ink-strong:#1a2027; /* preto forte — manter */
  --paper:#FDFCF8;      /* off-white — manter */
  --gold:#A07F3A;       /* ← TROQUE AQUI */
  --rule:#E5E1D6;       /* cinza da borda — manter */
  --muted:#272A30;      /* cinza escuro (AA) — manter */
  --soft:#FAF8F0;       /* fundo do pricebox — manter */
}
```

Sugestões de cor por perfil de cliente:
- **Educacional/ONG**: dourado atual (`#A07F3A`) ou verde sálvia (`#5B7553`)
- **Tech/SaaS**: azul corporativo (`#1F4F8C`)
- **Moda/Beleza**: bordô (`#7A2E3F`) ou preto
- **Saúde**: verde água (`#3A7A6B`)
- **Cristão/MCR**: manter dourado

### Mudar tipografia (de Georgia pra outra)

Edite o `font-family` no `body`:

```css
body{
  font-family: "Georgia", "Source Serif Pro", serif;
}
```

Sugestões:
- **Editorial/Moda**: `"Playfair Display", "Georgia", serif`
- **Técnico/Corporativo**: `"Source Serif Pro", "Georgia", serif`
- **Moderna/Clean**: `"Inter", "Helvetica Neue", sans-serif` (mas muda o tom de voz)

### Adicionar logo do cliente

Logo antes do hero (linha 124 do template), adicione:

```html
<img src="logo-cliente.png" alt="{{CLIENTE_NOME}}" style="max-width:140px;margin-bottom:24px">
```

---

## ✅ Checklist pré-envio

Antes de mandar a proposta pra um cliente, confira:

- [ ] Todos os `{{PLACEHOLDERS}}` substituídos (Ctrl+F em cada um)
- [ ] Valores batem com a conversa prévia (sem divergência)
- [ ] Telefone e e-mail estão corretos no signoff
- [ ] Data da proposta no hero é a data HOJE
- [ ] PDF gerado com fontes embutidas (Ctrl+P → Salvar PDF → verificar)
- [ ] Nome do arquivo PDF é claro: `proposta-CLIENTE-AAAA-MM-DD.pdf`
- [ ] Backup da versão final em `proposta-final-AAAA-MM-DD\`

---

## 📁 Estrutura sugerida pra cada novo cliente

```
PROPOSTAS\NOME-DO-CLIENTE\
├── proposta-NOME-DO-CLIENTE.html          (versão editável)
├── proposta-NOME-DO-CLIENTE.pdf           (PDF final)
├── email-para-cliente.txt                 (texto do e-mail de envio)
├── conversa-cliente.md                    (notas das conversas)
└── proposta-final-AAAA-MM-DD\             (versão fechada/assinada)
    ├── 01-proposta-...html
    └── 02-proposta-...pdf
```

---

## 🐛 Problemas comuns

### "Os placeholders aparecem no PDF"

Você não substituiu tudo. Abra o HTML, `Ctrl+F` → `{{` e navegue em todos.

### "Tabela estourando margem"

Reduza `font-size` de 13px pra 12px na `<table>`:
```css
table{font-size:12px}
```

### "Cor de destaque do cliente não combinou"

Geralmente é porque você trocou só `--gold` mas o hero/eyebrow/pill/pricebox dependem dela. A boa notícia: trocar **só** `--gold` no `:root` já propaga pra **todos** esses elementos automaticamente.

### "Cliente pediu formato de tabela diferente"

Copie o bloco `<table>` da v1 do Instituto e adapte. A v3 (template) tem 4 colunas: `#` / Tema / H / Entregável.

---

## 📐 Decisões de design por trás do template

- **Paleta**: 60% paper (off-white) / 30% ink (preto suave) / 10% gold (acento). Regra 60-30-10 clássica.
- **Contraste**: todos os pares de cor passam WCAG AA (4.5:1+). Body ink/paper = 8,17:1 (AAA).
- **Tipografia**: 1 serifa (Georgia) + 1 sans (Helvetica). 2 famílias no máximo.
- **Hierarquia**: H1 38-42px (Display) → H2 26px (Título) → H3 16px (Subtítulo) → corpo 15px → caption 11-13px. Sistema Bringhurst.
- **Largura**: 668px de conteúdo (780px max-width - 2×56px padding) = ~75 chars/linha, dentro do limite editorial.

Pra customizações avançadas (versão impressão CMYK, layout 2 colunas, capa personalizada, etc), me chama que abrimos sprint de design.

---

**Versão do template**: v1.0 (07/07/2026)
**Baseado em**: proposta Instituto Consulado da Mulher
**Mantido por**: Pauleandersonn / MCR
