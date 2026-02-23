# Documentação Técnica: Sistema de Saldo Anterior

## 📋 **Índice**
- [1. Conceito e Propósito](#1-conceito-e-propósito)
- [2. Estrutura Técnica](#2-estrutura-técnica)
- [3. Algoritmo de Cálculo](#3-algoritmo-de-cálculo)
- [4. Implementação no Código](#4-implementação-no-código)
- [5. Integração com o Sistema](#5-integração-com-o-sistema)
- [6. Exemplos Práticos](#6-exemplos-práticos)
- [7. Fluxo de Manutenção](#7-fluxo-de-manutenção)

---

## 1. Conceito e Propósito

### **🎯 O que é o Saldo Anterior?**

O **Saldo Anterior** é uma conta especial automatizada que exibe, em cada mês, o saldo acumulado até o final do mês anterior. Funciona como um "carried forward balance" em sistemas contábeis.

### **💡 Propósito:**
- **Visibilidade**: Mostra a evolução do saldo mês a mês
- **Contexto**: Cada mês tem contexto do saldo anterior
- **Análise**: Facilita identificação de padrões de fluxo de caixa
- **Automatização**: Elimina cálculos manuais do usuário

### **🔒 Características:**
- **Automática**: Calculada pelo sistema, não editável pelo usuário
- **Protegida**: Não pode ser modificada ou excluída
- **Sempre presente**: Aparece em todos os meses de todos os anos
- **Acumulativa**: Cada mês considera o histórico completo anterior

---

## 2. Estrutura Técnica

### **2.1 Conta Especial**

#### **Definição em `models/Conta.js`:**
```javascript
// ID fixo para identificação única
const CONTA_SALDO_ANTERIOR_ID = 999;

// Conta especial criada automaticamente
new Conta(999, 'Saldo Anterior', TipoConta.SALDO, getCategoriaById(11))
```

#### **Função de Identificação:**
```javascript
function isContaSaldoAnterior(contaId) {
  return parseInt(contaId) === CONTA_SALDO_ANTERIOR_ID;
}
```

### **2.2 Categoria Especial**

#### **Definição em `models/CategoriaConta.js`:**
```javascript
// Categoria especial para saldos
new CategoriaConta(11, 'Saldo')
```

### **2.3 Proteções Implementadas**

#### **Filtros para Interface do Usuário:**
```javascript
// Contas editáveis (exclui a especial)
function getContasEditaveis() {
  return contas.filter(c => c.id !== CONTA_SALDO_ANTERIOR_ID);
}

// Contas para modais (exclui a especial)
function getContasParaModal() {
  return contas.filter(c => c.id !== CONTA_SALDO_ANTERIOR_ID);
}
```

#### **Validação em Rotas:**
```javascript
// Proteção contra edição manual
if (isContaSaldoAnterior(contaId)) {
  errors.push('Não é possível adicionar movimentações na conta de Saldo Anterior');
}
```

---

## 3. Algoritmo de Cálculo

### **3.1 Fórmula Matemática**

```
Saldo Anterior (Mês N) = Saldo Inicial + Σ(Movimentações até final do Mês N-1)

Onde:
- Saldo Inicial = Saldo acumulado do final do ano anterior (ou 0 se primeiro ano)
- Movimentações = Receitas (+) + Despesas (-) + Outros Saldos
- Exceto = Movimentações da própria conta "Saldo Anterior"
```

### **3.2 Lógica Passo a Passo**

#### **Passo 1: Determinar Saldo Inicial**
```javascript
let saldoInicial = 0;

// Identificar o primeiro ano com dados
const movimentacoesSemSaldoAnterior = contaValores.filter(cv =>
  cv.conta.id !== CONTA_SALDO_ANTERIOR_ID
);
const primeiroAno = Math.min(...movimentacoesSemSaldoAnterior.map(cv =>
  cv.data.getFullYear()
));

if (ano > primeiroAno) {
  // Calcular saldo acumulado desde o primeiro ano até o ano anterior
  const anoAnterior = ano - 1;
  const dataInicioAnterior = new Date(primeiroAno, 0, 1);
  const dataFimAnterior = new Date(anoAnterior, 11, 31, 23, 59, 59);

  const movimentacoesAteAnoAnterior = contaValores.filter(cv =>
    cv.conta.id !== CONTA_SALDO_ANTERIOR_ID &&
    cv.data >= dataInicioAnterior &&
    cv.data <= dataFimAnterior
  );

  saldoInicial = movimentacoesAteAnoAnterior.reduce((acc, cv) =>
    acc + cv.getValorComSinal(), 0
  );
}
```

#### **Passo 2: Calcular Mês a Mês**
```javascript
let saldoAcumuladoAtual = saldoInicial;

for (let mes = 0; mes < 12; mes++) {
  // O saldo anterior do mês é o saldo acumulado até o final do mês anterior
  const saldoAnteriorMes = saldoAcumuladoAtual;

  // Criar movimentação de saldo anterior para o mês atual
  const dataMovimentacao = new Date(ano, mes, 1);
  const novaSaldoAnterior = new ContaValor(
    nextContaValorId++,
    dataMovimentacao,
    saldoAnteriorMes,
    contaSaldoAnterior
  );

  contaValores.push(novaSaldoAnterior);

  // Calcular movimentações do mês atual para atualizar saldo acumulado
  const movimentacoesMesAtual = contaValores.filter(cv =>
    cv.conta.id !== CONTA_SALDO_ANTERIOR_ID &&
    cv.data.getFullYear() === ano &&
    cv.data.getMonth() === mes
  );

  // Adicionar movimentações do mês atual ao saldo acumulado
  movimentacoesMesAtual.forEach(cv => {
    saldoAcumuladoAtual += cv.getValorComSinal();
  });
}
```

---

## 4. Implementação no Código

### **4.1 Função Principal**

#### **`calcularESalvarSaldosAnteriores(ano)` em `models/ContaValor.js`:**

```javascript
function calcularESalvarSaldosAnteriores(ano) {
  const contaSaldoAnterior = getContaSaldoAnterior();
  if (!contaSaldoAnterior) return;

  // PASSO 1: Limpar saldos anteriores existentes do ano
  const indicesParaRemover = [];
  contaValores.forEach((cv, index) => {
    if (cv.conta.id === CONTA_SALDO_ANTERIOR_ID &&
        cv.data.getFullYear() === ano) {
      indicesParaRemover.push(index);
    }
  });

  // Remove de trás para frente para não alterar índices
  indicesParaRemover.reverse().forEach(index => {
    contaValores.splice(index, 1);
  });

  // PASSO 2: Calcular saldo inicial (conforme algoritmo acima)
  // ... código do saldo inicial ...

  // PASSO 3: Gerar registros mês a mês (conforme algoritmo acima)
  // ... código do loop mensal ...
}
```

### **4.2 Função de Recálculo**

#### **`recalcularSaldosAno(ano)` em `models/ContaValor.js`:**

```javascript
function recalcularSaldosAno(ano) {
  // Recalcula o ano atual
  calcularESalvarSaldosAnteriores(ano);

  // Se há dados no próximo ano, recalcula em cascata
  const proximoAno = ano + 1;
  const temDadosProximoAno = contaValores.some(cv =>
    cv.data.getFullYear() === proximoAno &&
    cv.conta.id !== CONTA_SALDO_ANTERIOR_ID
  );

  if (temDadosProximoAno) {
    calcularESalvarSaldosAnteriores(proximoAno);
  }
}
```

### **4.3 Método de Valor com Sinal**

#### **`getValorComSinal()` em `models/ContaValor.js`:**

```javascript
getValorComSinal() {
  if (this.isReceita()) return this.valor;      // +valor
  if (this.isDespesa()) return -this.valor;     // -valor
  return this.valor;                            // valor original (para SALDO)
}
```

---

## 5. Integração com o Sistema

### **5.1 Triggers Automáticos**

#### **Visualização do Fluxo - `routes/fluxo-caixa.js`:**
```javascript
router.get('/fluxo', function(req, res, next) {
  // ...código de setup...

  // TRIGGER: Calcular saldos antes de exibir
  calcularESalvarSaldosAnteriores(anoSelecionado);

  // ...resto da lógica...
});
```

#### **Adição de Movimentação - `routes/fluxo-caixa.js`:**
```javascript
router.post('/fluxo/movimentacao/add', function(req, res, next) {
  // ...validações e criação da movimentação...

  // TRIGGER: Recalcular após adicionar
  recalcularSaldosAno(parseInt(ano));

  // ...redirecionamento...
});
```

### **5.2 Exibição na Interface**

#### **Template EJS - `views/fluxo-caixa/fluxo.ejs`:**

```html
<!-- Loop de contas na tabela -->
<% Object.values(dadosPorContaMes).forEach(function(item) { %>
<tr class="<%= item.conta.id === 999 ? 'conta-especial' : '' %>">
  <td class="conta-cell">
    <div class="d-flex align-items-center">
      <i class="<%= getIconeTipoConta(item.conta.tipoConta) %>
                  text-<%= getCorTipoConta(item.conta.tipoConta) %> icon-tipo"></i>
      <div>
        <strong><%= item.conta.nomeConta %></strong>
        <% if (item.conta.id === 999) { %>
          <span class="badge bg-warning text-dark ms-2">Automática</span>
        <% } %>
        <br><small class="text-muted"><%= item.conta.categoriaConta.categoria %></small>
      </div>
    </div>
  </td>

  <!-- Células dos meses -->
  <% for (let mes = 0; mes < 12; mes++) { %>
  <td class="text-center valor-cell position-relative
            <%= item.conta.id === 999 ? 'conta-especial-cell' : 'celula-clicavel' %>"
      <% if (item.conta.id !== 999) { %>
      onclick="abrirModalMovimentacao('<%= item.conta.id %>', <%= mes %>, <%= anoSelecionado %>)"
      <% } %>
      <% if (item.conta.id === 999) { %>
      title="Saldo calculado automaticamente do mês anterior"
      <% } else if (item.meses[mes] === 0) { %>
      title="Clique para adicionar primeira movimentação em <%= nomesMeses[mes] %>/<%= anoSelecionado %> - Conta sem movimentações"
      <% } else { %>
      title="Clique para adicionar movimentação em <%= nomesMeses[mes] %>/<%= anoSelecionado %>"
      <% } %>>

    <% if (item.meses[mes] === 0) { %>
      <span class="valor-zero">-</span>
    <% } else { %>
      <span class="fw-bold
                   text-<%= item.meses[mes] > 0 ? 'success' : 'danger' %>">
        <%= new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(Math.abs(item.meses[mes])) %>
      </span>
    <% } %>
  </td>
  <% } %>
</tr>
<% }); %>
```

#### **Estilo CSS para Conta Especial:**
```css
.conta-especial {
  background-color: rgba(255, 193, 7, 0.05);
  border-left: 3px solid #ffc107;
}

.conta-especial-cell {
  background-color: rgba(255, 193, 7, 0.08);
  cursor: not-allowed;
}

.conta-especial-cell::after {
  content: "🔒";
  position: absolute;
  top: 3px;
  right: 6px;
  opacity: 0.5;
}
```

---

## 6. Exemplos Práticos

### **6.1 Cenário: Primeiro Ano (2024)**

#### **Dados de Entrada:**
```javascript
// Movimentações do usuário em 2024
movimentacoes = [
  { data: '2024-01-15', valor: 5000, conta: 'Salário' },      // Receita
  { data: '2024-01-20', valor: 1200, conta: 'Aluguel' },     // Despesa
  { data: '2024-02-15', valor: 5000, conta: 'Salário' },     // Receita
  { data: '2024-02-25', valor: 800,  conta: 'Supermercado' }, // Despesa
  { data: '2024-03-15', valor: 5000, conta: 'Salário' }      // Receita
];
```

#### **Cálculo dos Saldos Anteriores:**
```javascript
// Janeiro/2024: Primeiro mês, sem saldo anterior
saldoAnterior_jan = 0;

// Fevereiro/2024: Saldo até final de janeiro
saldoAnterior_fev = 0 + (5000 - 1200) = 3800;

// Março/2024: Saldo até final de fevereiro
saldoAnterior_mar = 3800 + (5000 - 800) = 8000;

// Abril/2024: Saldo até final de março
saldoAnterior_abr = 8000 + 5000 = 13000;

// Maio a Dezembro: Mantém saldo de março
saldoAnterior_mai_a_dez = 13000;
```

#### **Resultado na Tabela:**
```
Conta           | Jan     | Fev     | Mar     | Abr     | Mai     | ...
Salário         | 5000    | 5000    | 5000    | -       | -       | ...
Aluguel         | 1200    | -       | -       | -       | -       | ...
Supermercado    | -       | 800     | -       | -       | -       | ...
Saldo Anterior  | 0       | 3800    | 8000    | 13000   | 13000   | ...
```

### **6.2 Cenário: Segundo Ano (2025)**

#### **Dados de Entrada Adicionais:**
```javascript
// Movimentações em 2025
movimentacoes_2025 = [
  { data: '2025-01-10', valor: 500,  conta: 'Freelance' },   // Receita
  { data: '2025-01-15', valor: 5200, conta: 'Salário' },    // Receita
  { data: '2025-02-15', valor: 5200, conta: 'Salário' }     // Receita
];
```

#### **Cálculo dos Saldos Anteriores para 2025:**
```javascript
// Saldo inicial de 2025 = Saldo final de 2024
saldoInicial_2025 = 13000; // Todo o saldo acumulado de 2024

// Janeiro/2025: Saldo do final do ano anterior
saldoAnterior_jan_2025 = 13000;

// Fevereiro/2025: Saldo de janeiro/2025 + movimentações de janeiro/2025
saldoAnterior_fev_2025 = 13000 + 500 + 5200 = 18700;

// Março/2025: Saldo até final de fevereiro/2025
saldoAnterior_mar_2025 = 18700 + 5200 = 23900;
```

#### **Resultado na Tabela 2025:**
```
Conta           | Jan     | Fev     | Mar     | Abr     | ...
Freelance       | 500     | -       | -       | -       | ...
Salário         | 5200    | 5200    | -       | -       | ...
Saldo Anterior  | 13000   | 18700   | 23900   | 23900   | ...
```

### **6.3 Cenário: Edição de Movimentação**

#### **Ação do Usuário:**
```javascript
// Usuário edita movimentação de fevereiro/2024
// Altera Supermercado de R$ 800 para R$ 1200
```

#### **Trigger de Recálculo:**
```javascript
// Sistema executa: recalcularSaldosAno(2024)
// Que por sua vez executa: calcularESalvarSaldosAnteriores(2024)
// E depois: calcularESalvarSaldosAnteriores(2025) // Cascata
```

#### **Novo Cálculo 2024:**
```javascript
// Fevereiro/2024: Agora com mais despesa
saldoAnterior_mar_2024_novo = 3800 + (5000 - 1200) = 7600; // Era 8000
saldoAnterior_abr_2024_novo = 7600 + 5000 = 12600; // Era 13000
```

#### **Impacto em 2025 (Cascata):**
```javascript
// Janeiro/2025: Novo saldo inicial
saldoInicial_2025_novo = 12600; // Era 13000
saldoAnterior_jan_2025_novo = 12600; // Era 13000
saldoAnterior_fev_2025_novo = 12600 + 500 + 5200 = 18300; // Era 18700
```

---

## 7. Fluxo de Manutenção

### **7.1 Ciclo de Vida**

#### **1. Inicialização:**
```mermaid
Sistema Inicia → Verifica Conta Saldo Anterior → Cria se Não Existir
```

#### **2. Visualização:**
```mermaid
Usuário Acessa Fluxo → calcularESalvarSaldosAnteriores(ano) → Exibe Tabela
```

#### **3. Modificação:**
```mermaid
Usuário Altera Movimentação → recalcularSaldosAno(ano) → Atualiza Cascata
```

### **7.2 Pontos de Trigger**

#### **Chamadas Automáticas:**
```javascript
// 1. Visualização do fluxo
router.get('/fluxo', ...) {
  calcularESalvarSaldosAnteriores(anoSelecionado);
}

// 2. Adição de movimentação
router.post('/fluxo/movimentacao/add', ...) {
  recalcularSaldosAno(parseInt(ano));
}

// 3. Edição de movimentação
router.post('/fluxo/movimentacao/:id/edit', ...) {
  recalcularSaldosAno(movimentacao.data.getFullYear());
}

// 4. Remoção de movimentação
router.post('/fluxo/movimentacao/:id/delete', ...) {
  recalcularSaldosAno(movimentacao.data.getFullYear());
}
```

### **7.3 Validações e Proteções**

#### **Proteção contra Edição Manual:**
```javascript
// Em todas as rotas de movimentação
const { contaId, ano, mes, valor } = req.body;

if (isContaSaldoAnterior(contaId)) {
  errors.push('Não é possível adicionar movimentações na conta de Saldo Anterior');
  return res.redirect('...?error=' + encodeURIComponent(errors.join(', ')));
}
```

#### **Proteção contra Exclusão:**
```javascript
// Em rota de exclusão de conta
router.post('/conta/:id/delete', ...) {
  if (isContaSaldoAnterior(parseInt(id))) {
    return res.redirect('...?message=' +
      encodeURIComponent('Não é possível remover a conta especial de Saldo Anterior'));
  }
}
```

#### **Auto-Reparação:**
```javascript
// Verificação de integridade
function verificarIntegridadeContaSaldoAnterior() {
  if (!getContaSaldoAnterior()) {
    // Recria a conta se foi removida acidentalmente
    criarContaSaldoAnterior();
  }
}
```

---

## 📈 **Resumo Técnico**

### **✅ Características Técnicas:**
- **Conta fixa**: ID 999, Tipo SALDO, Categoria "Saldo"
- **Cálculo automático**: Baseado em saldo acumulado até mês anterior
- **Recálculo em cascata**: Alterações propagam para anos seguintes
- **Proteção total**: Não editável, não removível
- **Performance otimizada**: Algoritmo O(n) linear
- **Atualização automática**: Triggers em todas operações relevantes

### **✅ Benefícios Funcionais:**
- **Visibilidade completa**: Saldo mês a mês sempre visível
- **Automatização total**: Zero intervenção manual
- **Integridade garantida**: Valores sempre corretos
- **Análise facilitada**: Contexto histórico em cada mês

### **✅ Arquitetura Robusta:**
- **Separação de responsabilidades**: Model, View, Controller bem definidos
- **Código limpo**: Funções específicas e bem documentadas
- **Manutenibilidade**: Lógica clara e modificável
- **Escalabilidade**: Funciona com qualquer volume de dados

**O sistema de Saldo Anterior é uma funcionalidade robusta, automatizada e essencial para análise financeira precisa no fluxo de caixa! 🚀**