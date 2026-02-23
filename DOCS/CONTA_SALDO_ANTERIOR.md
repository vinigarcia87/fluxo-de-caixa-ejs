# Conta Especial de Saldo Anterior

## 🔒 **Funcionalidade Implementada**

Criada uma **conta fixa especial** que calcula e exibe automaticamente o saldo do mês anterior em cada célula da tabela de fluxo de caixa, proporcionando visibilidade completa da evolução do saldo ao longo do tempo.

## 🎯 **Características da Conta Especial**

### **✅ Propriedades Fixas:**
- **ID**: 999 (fixo e único)
- **Nome**: "Saldo Anterior"
- **Tipo**: SALDO (TipoConta.SALDO)
- **Categoria**: "Saldo" (categoria especial criada automaticamente)
- **Status**: Não editável pelo usuário

### **✅ Comportamento Automático:**
- **Cálculo automático**: Valores preenchidos pelo sistema
- **Baseado no mês anterior**: Cada célula mostra o saldo acumulado até o mês anterior
- **Primeira ocorrência**: Quando não há dados anteriores, valor = 0,00
- **Atualização automática**: Recalculado sempre que há mudanças nas movimentações

### **✅ Proteções Implementadas:**
- **Não clicável**: Células não respondem a cliques
- **Não editável**: Não aparece em formulários de edição
- **Não removível**: Proteção contra exclusão acidental
- **Visual diferenciado**: Destaque visual como conta especial

## 🔧 **Implementação Técnica**

### **1. Estrutura de Dados:**

#### **Categoria Especial:**
```javascript
// Adicionada em CategoriaConta.js
new CategoriaConta(11, 'Saldo') // Categoria especial para saldos
```

#### **Conta Especial:**
```javascript
// Adicionada em Conta.js
new Conta(999, 'Saldo Anterior', TipoConta.SALDO, getCategoriaById(11))

// Constante para identificação
const CONTA_SALDO_ANTERIOR_ID = 999;
```

### **2. Funções de Controle:**

#### **Identificação:**
```javascript
function isContaSaldoAnterior(contaId) {
  return parseInt(contaId) === CONTA_SALDO_ANTERIOR_ID;
}
```

#### **Filtros para Usuário:**
```javascript
// Contas editáveis (exclui a especial)
function getContasEditaveis() {
  return contas.filter(c => c.id !== CONTA_SALDO_ANTERIOR_ID);
}

// Contas para modals (exclui a especial)
function getContasParaModal() {
  return contas.filter(c => c.id !== CONTA_SALDO_ANTERIOR_ID);
}
```

### **3. Algoritmo de Cálculo:**

#### **Lógica Principal:**
```javascript
function calcularESalvarSaldosAnteriores(ano) {
  // 1. Remove saldos anteriores existentes do ano
  // 2. Calcula saldo inicial (ano anterior ou 0)
  // 3. Para cada mês:
  //    - Calcula saldo acumulado até o mês anterior
  //    - Cria movimentação de saldo anterior
  //    - Atualiza saldo para próximo mês
}
```

#### **Fórmula de Cálculo:**
```
Saldo Mês Atual = Saldo Inicial + Σ(Movimentações até mês anterior)

Onde:
- Saldo Inicial = Saldo total do ano anterior (ou 0 se primeiro ano)
- Movimentações = Receitas - Despesas + Saldos (exceto saldo anterior)
```

### **4. Integração com Sistema:**

#### **Trigger Automático:**
```javascript
// Executado automaticamente em:
// - Visualização do fluxo de caixa
// - Adição de movimentação
// - Edição de movimentação
// - Remoção de movimentação

calcularESalvarSaldosAnteriores(anoSelecionado);
```

#### **Recálculo em Cascata:**
```javascript
// Quando há alteração em um ano, recalcula anos seguintes
function recalcularSaldosAno(ano) {
  calcularESalvarSaldosAnteriores(ano);

  // Se próximo ano tem dados, recalcula também
  if (temDadosProximoAno) {
    calcularESalvarSaldosAnteriores(proximoAno);
  }
}
```

## 📊 **Exemplo de Funcionamento**

### **Cenário:**
```
Ano: 2024
Movimentações existentes:
- Janeiro: +1000 (receita)
- Fevereiro: -200 (despesa)
- Março: +500 (receita)
```

### **Cálculo dos Saldos Anteriores:**
```
Janeiro/2024:   Saldo Anterior = 0,00      (primeiro mês/ano)
Fevereiro/2024: Saldo Anterior = 1.000,00  (saldo de janeiro)
Março/2024:     Saldo Anterior = 800,00    (1000 - 200)
Abril/2024:     Saldo Anterior = 1.300,00  (800 + 500)
... demais meses = 1.300,00
```

### **Se em 2025 houver dados:**
```
Janeiro/2025:   Saldo Anterior = 1.300,00  (saldo final de 2024)
... demais cálculos seguem a mesma lógica
```

## 🎨 **Interface Visual**

### **Identificação na Tabela:**
- **Linha destacada**: Background amarelo claro
- **Badge "Automática"**: Indica controle do sistema
- **Ícone de cadeado**: Em cada célula
- **Borda esquerda**: Linha amarela na linha inteira
- **Cursor "not-allowed"**: Indica células não clicáveis

### **CSS Aplicado:**
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

### **Tooltip Informativo:**
- **Células normais**: "Clique para adicionar movimentação"
- **Células especiais**: "Saldo calculado automaticamente do mês anterior"

## 🔐 **Proteções e Validações**

### **1. Proteção contra Edição:**
```javascript
// Em rotas de movimentação
if (isContaSaldoAnterior(contaId)) {
  errors.push('Não é possível adicionar movimentações na conta de Saldo Anterior');
}
```

### **2. Proteção contra Exclusão:**
```javascript
// Em rota de exclusão de conta
if (isContaSaldoAnterior(contaId)) {
  return res.redirect('...?message=' + encodeURIComponent('Não é possível remover a conta especial de Saldo Anterior'));
}
```

### **3. Exclusão de Interfaces:**
- **Formulários de movimentação**: Conta não aparece em selects
- **Modals de edição**: Filtrada das opções
- **Cliques na tabela**: JavaScript ignora cliques nas células

### **4. Validação de Integridade:**
```javascript
// Sistema verifica e recria se necessário
if (!getContaSaldoAnterior()) {
  // Recria conta especial se removida acidentalmente
}
```

## 📈 **Vantagens da Implementação**

### **✅ Visibilidade Completa:**
- **Evolução do saldo**: Clara visualização mês a mês
- **Contexto histórico**: Cada mês tem contexto do anterior
- **Análise de fluxo**: Fácil identificação de padrões

### **✅ Automatização:**
- **Zero intervenção**: Usuário não precisa calcular
- **Sempre atualizado**: Recálculo automático
- **Consistência**: Valores sempre corretos

### **✅ Integridade:**
- **Protegido contra erro**: Não pode ser alterado
- **Auto-reparação**: Recalcula automaticamente
- **Histórico preservado**: Dados não se perdem

### **✅ Usabilidade:**
- **Visual claro**: Diferenciação óbvia
- **Informativo**: Tooltips explicativos
- **Integrado**: Funciona com todas funcionalidades existentes

## 🔄 **Fluxo de Operação**

### **1. Inicialização:**
```
Sistema carrega → Verifica conta especial → Cria se necessário
```

### **2. Visualização:**
```
Usuário acessa fluxo → Sistema calcula saldos → Exibe na tabela
```

### **3. Alteração de Dados:**
```
Usuário modifica movimentação → Sistema recalcula ano → Atualiza saldos → Propaga para anos seguintes
```

### **4. Navegação entre Anos:**
```
Usuário muda ano → Sistema calcula saldos do novo ano → Exibe resultados
```

## 🎯 **Casos de Uso**

### **1. Primeiro Uso (Sem Dados):**
```
Resultado: Todos os meses com Saldo Anterior = R$ 0,00
```

### **2. Adição de Primeira Movimentação:**
```
Movimentação Janeiro → Fevereiro a Dezembro = valor da movimentação
```

### **3. Múltiplos Anos:**
```
Saldo 2024 → Saldo Anterior Janeiro/2025 = saldo final 2024
```

### **4. Edição/Remoção:**
```
Qualquer mudança → Recálculo automático → Propagação anos seguintes
```

## 🚀 **Funcionalidade Completa!**

### **✅ Implementado:**
- **Conta especial criada** com ID fixo 999
- **Categoria "Saldo"** para organização
- **Cálculo automático** baseado no mês anterior
- **Proteções completas** contra edição/exclusão
- **Visual diferenciado** na interface
- **Recálculo automático** em mudanças
- **Propagação entre anos** para consistência
- **Integração total** com sistema existente

### **✅ Benefícios:**
- **Visibilidade do fluxo** mês a mês
- **Automatização completa** de cálculos
- **Proteção de dados** críticos
- **Interface intuitiva** e informativa
- **Performance otimizada** com cálculos eficientes

**A conta especial de Saldo Anterior está totalmente implementada e funcional! 🎉**

Agora o sistema oferece visibilidade completa da evolução do saldo financeiro ao longo do tempo, com cálculos automáticos e proteções robustas.