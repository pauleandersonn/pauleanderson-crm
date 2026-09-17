# Contrato · Luap Studio Pro

Template de contrato de prestação de serviços audiovisuais para **eventos sociais** (casamento, 15 anos, chá, revelação, bodas, debut, etc).

**Mantido por:** Pauleanderson Souza · Luap Studio Pro
**Versão:** 1.0 (07/07/2026)
**Tipo de empresa:** produção audiovisual (fotografia, vídeo, drone, edição)
**Diferenciação importante:** Este contrato é da **Luap Studio Pro** (empresa de audiovisual), separado da MCR (capacitação). Não use pra cursos/formações.

---

## 🚀 Como usar (4 passos)

### 1. Copie o template

```bash
cd "C:\Users\paule\Documents\PROGRAMAÇÃO\PROPOSTAS\LUAP-STUDIO-PRO"
mkdir CONTRATOS-ATIVOS\{{EVENTO_DATA}}-{{CLIENTE_NOME}}
cp TEMPLATE-CONTRATO\contrato-luap-studio-pro.html CONTRATOS-ATIVOS\{{EVENTO_DATA}}-{{CLIENTE_NOME}}\contrato.html
```

### 2. Preencha os placeholders

Abra no VS Code, `Ctrl+H`, substitua os `{{}}` um por um. A lista completa tá na seção "Placeholders" abaixo.

### 3. Gere o PDF (pra apresentar)

```bash
cd "C:\Users\paule\Documents\PROGRAMAÇÃO\PROPOSTAS\LUAP-STUDIO-PRO\CONTRATOS-ATIVOS\{{EVENTO_DATA}}-{{CLIENTE_NOME}}"
python -m http.server 8000

# Abre http://localhost:8000/contrato.html
# Ctrl+P → Salvar como PDF
```

### 4. Assinatura

**Opção A — presencial:** imprime 2 vias, ambos assinam, cada um fica com a sua.
**Opção B — remota:** usa plataforma de assinatura digital (Clicksign, DocuSign, ZapSign). Exporta o PDF preenchido e sobe lá.

---

## 📋 Placeholders (ordem de edição)

### Cabeçalho
| Placeholder | Exemplo |
|---|---|
| `{{NUMERO_CONTRATO}}` | `2026-001` (incremental, 1 por ano) |
| `{{DATA_CONTRATO}}` | `Manaus, 07 de julho de 2026` |

### CONTRATANTE (cliente)
| Placeholder | Exemplo |
|---|---|
| `{{CLIENTE_NOME}}` | `Maria Silva dos Santos` |
| `{{CLIENTE_CPF}}` | `123.456.789-00` |
| `{{CLIENTE_RG}}` | `1234567 SSP/AM` |
| `{{CLIENTE_ENDERECO}}` | `Rua das Flores, 123, Centro, Manaus/AM, CEP 69000-000` |
| `{{CLIENTE_TELEFONE}}` | `(92) 98765-4321` |
| `{{CLIENTE_EMAIL}}` | `maria@email.com` |

### CONTRATADO (Luap Studio Pro) — **fixo, edite só se CNPJ mudar**
| Placeholder | Valor padrão |
|---|---|
| `{{CONTRATADO_CNPJ}}` | `XX.XXX.XXX/0001-XX` (substitua pelo real) |
| `{{CONTRATADO_TITULO}}` | `sócio-proprietário` |
| `{{CONTRATADO_CPF}}` | `XXX.XXX.XXX-XX` (Paule) |

### Evento
| Placeholder | Exemplo casamento | Exemplo 15 anos |
|---|---|---|
| `{{EVENTO_TIPO}}` | `Casamento civil e religioso` | `Festa de 15 anos` |
| `{{EVENTO_DATA}}` | `15 de novembro de 2026` | `20 de março de 2027` |
| `{{EVENTO_HORARIO_INICIO}}` | `16h00` | `19h00` |
| `{{EVENTO_HORARIO_FIM}}` | `02h00 (do dia seguinte)` | `03h00 (do dia seguinte)` |
| `{{EVENTO_LOCAL}}` | `Espaço Villa Jardim` | `Salão de Festas Aurora` |
| `{{EVENTO_ENDERECO}}` | `Av. Principal, 1000, Manaus/AM` | `Rua 2, 50, Manaus/AM` |
| `{{EVENTO_HOMENAGEADO}}` | `Maria Silva & João Santos` | `Ana Clara Silva` |

### Pacote contratado
| Placeholder | Como preencher |
|---|---|
| `{{PACOTE_FOTO_QTD}}` | `1 fotógrafo` ou `2 fotógrafos` |
| `{{PACOTE_FOTO_HORAS}}` | `8 horas` ou `cobertura completa` |
| `{{PACOTE_VIDEO_QTD}}` | `1 cinegrafista` ou `2 cinegrafistas` |
| `{{PACOTE_VIDEO_HORAS}}` | `8 horas` |
| `{{PACOTE_DRONE}}` | `Sim` ou `Não` |
| `{{PACOTE_DRONE_HORAS}}` | `1 hora de voo` (se Sim) ou `—` (se Não) |
| `{{PACOTE_MAKING}}` | `Sim` ou `Não` |
| `{{PACOTE_MAKING_HORAS}}` | `4 horas` (se Sim) ou `—` (se Não) |
| `{{PACOTE_ENSAIO}}` | `Sim` ou `Não` |
| `{{PACOTE_ENSAIO_HORAS}}` | `2 horas + 30 fotos editadas` |
| `{{PACOTE_ALBUM}}` | `Sim` ou `Não` |
| `{{PACOTE_ALBUM_FOTOS}}` | `1 álbum 30x30cm, 60 páginas, 100 fotos` |
| `{{PACOTE_MIDIA}}` | `Sim` ou `Não` |
| `{{PACOTE_MIDIA_DESC}}` | `1 pen drive 32GB com fotos e vídeos` |
| `{{PACOTE_FILME}}` | `Sim` ou `Não` |
| `{{PACOTE_FILME_DURACAO}}` | `Filme de 15-20min editado` |
| `{{PACOTE_REELS}}` | `Sim` ou `Não` |
| `{{PACOTE_REELS_DESC}}` | `3 reels de 30-60s pra Instagram` |
| `{{PACOTE_EQUIPE}}` | `Sim` ou `Não` |
| `{{PACOTE_EQUIPE_DESC}}` | `2º fotógrafo` ou `2º cinegrafista` |

> **Dica:** Se o pacote não inclui algum item, preencha com `Não incluso` ou apague a linha da tabela.

### Prazos
| Placeholder | Padrão sugerido |
|---|---|
| `{{PRAZO_ENTREGA_FOTOS}}` | `30` (dias úteis) |
| `{{PRAZO_ENTREGA_VIDEO}}` | `60` (dias úteis) |
| `{{MIDIA_ENTREGA}}` | `link de download Google Drive + pen drive` |

### Valor e pagamento
| Placeholder | Exemplo |
|---|---|
| `{{VALOR_TOTAL}}` | `R$ 4.500,00` |
| `{{VALOR_TOTAL_EXTENSO}}` | `quatro mil e quinhentos reais` |
| `{{ENTRADA_PERCENTUAL}}` | `30` (padrão da Luap) |
| `{{ENTRADA_VALOR}}` | `R$ 1.350,00` (30% do total) |
| `{{ENTRADA_FORMA}}` | `PIX` (entrada sempre à vista) |
| `{{PARCELA_2_VALOR}}` | `R$ 1.500,00` |
| `{{PARCELA_2_VENCIMENTO}}` | `15/08/2026` |
| `{{PARCELA_2_FORMA}}` | `PIX` ou `Cartão 3x` |
| `{{PARCELA_3_VALOR}}` | `R$ 825,00` |
| `{{PARCELA_3_VENCIMENTO}}` | `15/09/2026` |
| `{{PARCELA_3_FORMA}}` | `PIX` |
| `{{ULTIMA_PARCELA_VALOR}}` | `R$ 825,00` |
| `{{ULTIMA_PARCELA_VENCIMENTO}}` | `15/10/2026` |
| `{{ULTIMA_PARCELA_FORMA}}` | `PIX` |
| `{{FORMA_PAGAMENTO_SALDO}}` | `PIX em 3 parcelas mensais` |
| `{{JUROS_CARTAO}}` | `2,99% a.m. + IOF` (consultar operadora) |

> **Padrão recomendado pela Luap:** entrada 30% PIX + saldo em até 3x PIX (sem juros) ou em 6x/12x no cartão (com juros). Sempre oferecer o desconto pra pagamento à vista ou PIX.

---

## 💡 Decisões de design por trás do template

### Por que Times New Roman e não Georgia?
- **Times New Roman** é o padrão de papel timbrado jurídico no Brasil. Causa seriedade.
- **Georgia** (usado na proposta) é mais "comercial" — passa calor humano. Em contrato, atrapalha.
- Contraste é melhor: preto puro sobre branco, sem dourado ou verde.

### Por que 11 cláusulas e não mais?
- 11 cláusulas cobre **todos os pontos juridicamente necessários** pra evento social.
- Se precisar de mais (ex: subcontratação de terceiros), é só adicionar.

### Por que tabela pro pacote?
- Cliente consegue ver visualmente o que contratou.
- Em caso de discussão futura, é mais difícil contestar uma tabela do que texto corrido.

### Por que "sem reembolso com menos de 30 dias"?
- Reserva de data bloqueia agenda. Se cancelar perto, Luap perde chance de vender a data.
- É a praxe do mercado audiovisual brasileiro.

---

## ⚠️ ALERTA IMPORTANTE: Situação cadastral do CNPJ

**Verifique antes de usar este contrato:** a Luap Studio Pro está com **situação cadastral INAPTA** desde 25/05/2026 (motivo: "Omissão de Declarações").

**O que isso significa na prática:**
- ❌ **Não pode emitir NF-e** (Nota Fiscal Eletrônica)
- ❌ **Não pode abrir conta bancária PJ** (ou pode ter a conta bloqueada)
- ❌ **Não pode participar de licitações** ou contratos com órgão público
- ❌ **Pode ter o CNPJ baixado** se não regularizar em tempo
- ⚠️ **Contrato particular entre PF/PJ** ainda é juridicamente válido, mas o cliente perde a NF pra prest contas

**Como regularizar:**
1. Acessar o **e-CAC** da Receita Federal → https://cav.receita.fazenda.gov.br/
2. Menu **"Cadastro"** → **"Pendências"**
3. Descobrir quais declarações estão em falta (provavelmente DASN-SIMEI ou DEFIS + licenças municipais)
4. Entregar as declarações + pagar eventuais multas
5. Aguardar 1-5 dias úteis pra Receita processar
6. Emitir nova consulta de situação cadastral

**Enquanto o CNPJ estiver INAPTO, este contrato só pode ser usado como:**
- Orçamento particular entre pessoas físicas (Maria Silva, seu CPF, etc)
- Acordo informal pra casamentos/15 anos onde a NF não é exigida pelo cliente
- Documento de alinhamento de expectativas (sem valor fiscal)

**Quando o CNPJ estiver ATIVO, este contrato passa a ter valor fiscal total** (NF-e pode ser emitida, contrato pode ser usado pra prestação de contas do cliente, etc).

**Conta regressiva:** Não demore pra regularizar — quanto mais tempo passa, mais multas se acumulam e maior o risco de baixa do CNPJ.

---

## ⚖️ Aviso legal

> **Este template é um modelo de referência, não substitui aconselhamento jurídico.**
>
> Pra uso definitivo, recomendo:
> - Revisão por um advogado (R$ 500-1.500 pra um contrato simples de audiovisual)
> - Adaptação às leis locais (Município/Estado)
> - Atualização anual (leis mudam)
>
> O template cobre os **pontos-padrão** do mercado. Cláusulas específicas (ex: evento internacional, cerimônia religiosa com regras próprias, cobertura de transmissão ao vivo) precisam de análise caso a caso.

---

## 📁 Estrutura sugerida

```
LUAP-STUDIO-PRO/
├── CONTRATOS-FECHADOS/             ← contratos assinados (arquivo morto)
│   └── 2026-001-Maria-Silva-15nov/
│       ├── contrato.pdf            (assinado, escaneado)
│       ├── comprovantes-pagamento/
│       └── fotos-evento/
├── CONTRATOS-ATIVOS/               ← contratos em negociação
│   ├── 2026-002-Joao-Casamento-15nov/
│   └── 2026-003-Festa-15anos/
├── PROPOSTAS-COMERCIAIS/           ← orçamentos antes de virar contrato
└── TEMPLATE-CONTRATO/
    ├── contrato-luap-studio-pro.html
    ├── contrato-EXEMPLO-preenchido.html
    └── README.md (este arquivo)
```

---

## 🐛 Problemas comuns

### "Cliente não tem CPF, só RG"

CPF é essencial pra NF e contrato. Se for menor de idade, usar CPF do responsável + RG do menor no campo "observações". Anotar no campo da assinatura.

### "Cliente quer parcelar em 12x no cartão"

OK, mas recalcule o valor com juros. Exemplo:
- Total: R$ 4.500 à vista
- 12x no cartão com 2,99% a.m.: parcela ≈ R$ 480, total ≈ R$ 5.760
- Deixar claro que a diferença é juros da operadora, não da Luap

### "Cliente cancelou faltando 15 dias"

Pela Cláusula 8.1, sem reembolso. Mas ser flexível pode ser bom relacionamento. Se o cliente pedir, ofereça remarcar a data pro mesmo pacote (em vez de devolver) — geralmente é melhor pra ambos.

### "Evento de 15 anos: pai da aniversariante assina?"

Sim, sempre. Menor de 18 anos não tem capacidade civil. Pai/mãe/responsável assina como CONTRATANTE.

### "Cliente quer adicionar item depois da assinatura"

Pode ser aditivo contratual. Cria um documento separado referenciando o contrato original e lista só os novos itens + valores. Não precisa reescrever o contrato todo.

---

## ✅ Checklist pré-assinatura

Antes de mandar pro cliente assinar:

- [ ] Todos os `{{PLACEHOLDERS}}` substituídos (Ctrl+F em cada um)
- [ ] CPF do cliente correto
- [ ] Data do evento no formato brasileiro
- [ ] Valor total escrito em número E por extenso
- [ ] Entrada = 30% (ou conforme combinado)
- [ ] Forma de pagamento especificada (PIX ou cartão)
- [ ] Juros do cartão calculados e descritos (se aplicável)
- [ ] Pacote discriminado (foto/vídeo/drone/álbum/etc)
- [ ] Prazos de entrega definidos
- [ ] Cláusula 4 (imagem) marcada se cliente não autorizar portfólio
- [ ] Luap Studio Pro CNPJ correto
- [ ] 2 testemunhas escolhidas (se for presencial)
- [ ] PDF gerado com fontes embutidas
- [ ] Backup do PDF antes de enviar

---

**Versão do template:** v1.0 (07/07/2026)
**Mantido por:** Pauleanderson Souza / Luap Studio Pro
**Base legal:** CDC + Código Civil Brasileiro
