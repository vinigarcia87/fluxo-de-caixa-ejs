# Ordenação Numérica das Contas

## 🎯 **Nova Implementação de Ordenação**

Implementado sistema de ordenação numérica sequencial para as contas na tabela de fluxo de caixa, onde cada conta possui um **campo específico de ordem** (`ordemTabela`) que determina sua posição exata na tabela.

## 🔢 **Lógica de Numeração**

### **Campo de Ordem:**
- **Propriedade**: `ordemTabela` (número inteiro)
- **Valor 0**: Primeira linha da tabela (Saldo Anterior)
- **Valor 1**: Segunda linha da tabela
- **Valor 2**: Terceira linha da tabela
- **E assim sucessivamente...**

### **Regras de Atribuição:**
1. **Saldo Anterior**: `ordemTabela = 0` (fixo, não pode mudar)
2. **Categorias "Saldo"**: `ordemTabela = 1, 2, 3...` (alfabética por nome)
3. **Demais Categorias**: Continuam sequência numérica (alfabética por categoria, depois por nome)

## 🏗️ **Implementação Técnica**

### **1. Classe Conta Atualizada - `models/Conta.js`:**

#### **Nova Propriedade:**
```javascript
class Conta {
  constructor(id, nomeConta, tipoConta, categoriaConta, ordemTabela = null) {
    this.id = id;
    this.nomeConta = nomeConta;
    this.tipoConta = tipoConta;
    this.categoriaConta = categoriaConta;
    this.ordemTabela = ordemTabela; // Número da ordem na tabela (0 = primeira linha)
  }
}
```

#### **Serialização JSON:**
```javascript
toJSON() {
  return {
    id: this.id,
    nomeConta: this.nomeConta,
    tipoConta: this.tipoConta,
    categoriaConta: this.categoriaConta ? this.categoriaConta.toJSON() : null,
    ordemTabela: this.ordemTabela // Incluir ordem na serialização
  };
}
```

### **2. Função Principal de Definição de Ordem:**

#### **`definirOrdemPorCategoria()` - Nova Lógica:**
```javascript
function definirOrdemPorCategoria() {
  // Separar contas por grupos
  const contaSaldoAnterior = contas.find(c => c.id === CONTA_SALDO_ANTERIOR_ID);
  const contasSaldo = contas.filter(c =>
    c.id !== CONTA_SALDO_ANTERIOR_ID &&
    c.categoriaConta?.categoria?.toLowerCase() === 'saldo'
  );
  const demaisContas = contas.filter(c =>
    c.id !== CONTA_SALDO_ANTERIOR_ID &&
    c.categoriaConta?.categoria?.toLowerCase() !== 'saldo'
  );

  // Ordenar grupos alfabeticamente
  contasSaldo.sort((a, b) => {
    const nomeA = a.nomeConta?.toLowerCase() || '';
    const nomeB = b.nomeConta?.toLowerCase() || '';
    return nomeA.localeCompare(nomeB);
  });

  demaisContas.sort((a, b) => {
    const catA = a.categoriaConta?.categoria?.toLowerCase() || 'zzz';
    const catB = b.categoriaConta?.categoria?.toLowerCase() || 'zzz';

    if (catA !== catB) {
      return catA.localeCompare(catB); // Primeiro por categoria
    }

    // Se mesma categoria, ordenar por nome da conta
    const nomeA = a.nomeConta?.toLowerCase() || '';
    const nomeB = b.nomeConta?.toLowerCase() || '';
    return nomeA.localeCompare(nomeB);
  });

  // Atribuir números sequenciais
  let ordemAtual = 0;

  // 1. Saldo Anterior = 0
  if (contaSaldoAnterior) {
    contaSaldoAnterior.ordemTabela = ordemAtual++;
  }

  // 2. Contas da categoria "Saldo" = 1, 2, 3...
  contasSaldo.forEach(conta => {
    conta.ordemTabela = ordemAtual++;
  });

  // 3. Demais contas = continuam a sequência
  demaisContas.forEach(conta => {
    conta.ordemTabela = ordemAtual++;
  });
}
```

### **3. Função de Inicialização:**

#### **`inicializarOrdemTabela()`:**
```javascript
function inicializarOrdemTabela() {
  // Aplicar ordem apenas se as contas não têm ordem definida
  const temContaSemOrdem = contas.some(c =>
    c.ordemTabela === null || c.ordemTabela === undefined
  );

  if (temContaSemOrdem) {
    definirOrdemPorCategoria();
  }
}
```

### **4. Função de Ordenação para Exibição:**

#### **`getContasOrdenadas()`:**
```javascript
function getContasOrdenadas() {
  // Garantir que todas as contas tenham ordem definida
  inicializarOrdemTabela();

  // Ordenar por número da ordem na tabela (0 = primeiro)
  return [...contas].sort((a, b) => {
    const ordemA = a.ordemTabela ?? 999;
    const ordemB = b.ordemTabela ?? 999;
    return ordemA - ordemB;
  });
}
```

### **5. Atualização por Drag and Drop:**

#### **`atualizarOrdemContas(novaOrdem)`:**
```javascript
function atualizarOrdemContas(novaOrdem) {
  // novaOrdem é um array de IDs na nova ordem definida pelo usuário
  // Renumerar todas as contas baseado na nova posição

  if (!Array.isArray(novaOrdem)) return false;

  // Garantir que Saldo Anterior esteja sempre na posição 0
  const ordemFinal = [];

  // Se Saldo Anterior não está na primeira posição, colocá-lo lá
  if (novaOrdem[0] !== CONTA_SALDO_ANTERIOR_ID &&
      novaOrdem.includes(CONTA_SALDO_ANTERIOR_ID)) {
    ordemFinal.push(CONTA_SALDO_ANTERIOR_ID);
    ordemFinal.push(...novaOrdem.filter(id => parseInt(id) !== CONTA_SALDO_ANTERIOR_ID));
  } else {
    ordemFinal.push(...novaOrdem);
  }

  // Renumerar todas as contas baseado na nova ordem
  ordemFinal.forEach((contaId, index) => {
    const conta = getContaById(contaId);
    if (conta) {
      conta.ordemTabela = index;
    }
  });

  return true;
}
```

## 📊 **Exemplo Prático de Numeração**

### **Contas Existentes:**
```javascript
// Dados de entrada
[
  { id: 999, nome: 'Saldo Anterior',    categoria: 'Saldo' },
  { id: 6,   nome: 'Saldo Inicial',    categoria: 'Saldo' },
  { id: 3,   nome: 'Salário Principal', categoria: 'Salário' },
  { id: 4,   nome: 'Freelance Design',  categoria: 'Freelances' },
  { id: 1,   nome: 'Supermercado',     categoria: 'Alimentação' },
  { id: 2,   nome: 'Combustível',      categoria: 'Transporte' },
  { id: 5,   nome: 'Aluguel',          categoria: 'Moradia' }
]
```

### **Processo de Numeração:**

#### **Passo 1: Separar por Grupos**
```javascript
// Grupo 1: Saldo Anterior
contaSaldoAnterior = [
  { id: 999, nome: 'Saldo Anterior', categoria: 'Saldo' }
]

// Grupo 2: Categoria "Saldo" (exceto Saldo Anterior)
contasSaldo = [
  { id: 6, nome: 'Saldo Inicial', categoria: 'Saldo' }
]

// Grupo 3: Demais Categorias
demaisContas = [
  { id: 3, nome: 'Salário Principal', categoria: 'Salário' },
  { id: 4, nome: 'Freelance Design',  categoria: 'Freelances' },
  { id: 1, nome: 'Supermercado',     categoria: 'Alimentação' },
  { id: 2, nome: 'Combustível',      categoria: 'Transporte' },
  { id: 5, nome: 'Aluguel',          categoria: 'Moradia' }
]
```

#### **Passo 2: Ordenar Grupos Alfabeticamente**
```javascript
// contasSaldo já tem apenas 1 item, não precisa ordenar

// demaisContas ordenadas por categoria, depois por nome:
demaisContas = [
  { id: 1, nome: 'Supermercado',     categoria: 'Alimentação' },  // A
  { id: 4, nome: 'Freelance Design',  categoria: 'Freelances' },   // F
  { id: 5, nome: 'Aluguel',          categoria: 'Moradia' },      // M
  { id: 3, nome: 'Salário Principal', categoria: 'Salário' },     // S
  { id: 2, nome: 'Combustível',      categoria: 'Transporte' }   // T
]
```

#### **Passo 3: Atribuir Números Sequenciais**
```javascript
let ordemAtual = 0;

// Saldo Anterior
{ id: 999, ordemTabela: 0 }  // ordemAtual = 1

// Categorias "Saldo"
{ id: 6,   ordemTabela: 1 }  // ordemAtual = 2

// Demais categorias
{ id: 1,   ordemTabela: 2 }  // ordemAtual = 3
{ id: 4,   ordemTabela: 3 }  // ordemAtual = 4
{ id: 5,   ordemTabela: 4 }  // ordemAtual = 5
{ id: 3,   ordemTabela: 5 }  // ordemAtual = 6
{ id: 2,   ordemTabela: 6 }  // ordemAtual = 7
```

### **Resultado Final na Tabela:**
```
Posição | ordemTabela | Conta
--------|-------------|---------------------------
   1    |      0      | 🔒 Saldo Anterior
   2    |      1      | 💰 Saldo Inicial
   3    |      2      | 🍽️ Supermercado (Alimentação)
   4    |      3      | 🎨 Freelance Design (Freelances)
   5    |      4      | 🏠 Aluguel (Moradia)
   6    |      5      | 💵 Salário Principal (Salário)
   7    |      6      | 🚗 Combustível (Transporte)
```

## 🔄 **Comportamento do Drag and Drop**

### **Cenário: Usuário Reordena Contas**

#### **Antes (ordem inicial):**
```javascript
[
  { id: 999, ordemTabela: 0 },  // Saldo Anterior
  { id: 6,   ordemTabela: 1 },  // Saldo Inicial
  { id: 1,   ordemTabela: 2 },  // Supermercado
  { id: 4,   ordemTabela: 3 },  // Freelance Design
  { id: 5,   ordemTabela: 4 },  // Aluguel
  { id: 3,   ordemTabela: 5 },  // Salário Principal
  { id: 2,   ordemTabela: 6 }   // Combustível
]
```

#### **Usuário arrasta "Salário Principal" para 3ª posição:**
```javascript
// Nova ordem enviada pelo frontend:
novaOrdem = [999, 6, 3, 1, 4, 5, 2]
//           [0,   1, 2, 3, 4, 5, 6]
```

#### **Após atualização:**
```javascript
[
  { id: 999, ordemTabela: 0 },  // Saldo Anterior (mantém)
  { id: 6,   ordemTabela: 1 },  // Saldo Inicial (mantém)
  { id: 3,   ordemTabela: 2 },  // Salário Principal (movido para 3ª posição)
  { id: 1,   ordemTabela: 3 },  // Supermercado (deslocado)
  { id: 4,   ordemTabela: 4 },  // Freelance Design (deslocado)
  { id: 5,   ordemTabela: 5 },  // Aluguel (deslocado)
  { id: 2,   ordemTabela: 6 }   // Combustível (deslocado)
]
```

## 🌐 **Integração com Backend**

### **Rota de Atualização - `routes/fluxo-caixa.js`:**
```javascript
router.post('/fluxo/contas/ordem', function(req, res, next) {
  try {
    const { novaOrdem } = req.body;

    if (!novaOrdem || !Array.isArray(novaOrdem)) {
      return res.status(400).json({
        success: false,
        message: 'Ordem inválida fornecida'
      });
    }

    // Atualizar ordem das contas (renumera ordemTabela)
    const sucesso = atualizarOrdemContas(novaOrdem);

    if (sucesso) {
      res.json({
        success: true,
        message: 'Ordem das contas atualizada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar ordem das contas'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar ordem das contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});
```

### **Rota de Debug - Visualizar Ordens:**
```javascript
router.get('/debug/contas/ordem', function(req, res, next) {
  try {
    const contasOrdenadas = getContasOrdenadas();
    const debug = contasOrdenadas.map(conta => ({
      id: conta.id,
      nome: conta.nomeConta,
      categoria: conta.categoriaConta?.categoria,
      ordemTabela: conta.ordemTabela
    }));

    res.json({
      success: true,
      contas: debug,
      total: debug.length
    });
  } catch (error) {
    console.error('Erro ao obter debug das contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});
```

## 🎨 **Interface Frontend**

### **JavaScript Atualizado - `views/fluxo-caixa/fluxo.ejs`:**

#### **Função de Salvamento (Já Implementada):**
```javascript
function salvarNovaOrdemContas() {
  const tbody = document.getElementById('contas-tbody');
  const rows = tbody.querySelectorAll('tr[data-conta-id]');
  const novaOrdem = [];

  rows.forEach(row => {
    const contaId = row.getAttribute('data-conta-id');
    if (contaId) {
      novaOrdem.push(parseInt(contaId));
    }
  });

  // Enviar nova ordem para servidor (que atualizará ordemTabela)
  fetch('/fluxo-caixa/fluxo/contas/ordem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ novaOrdem: novaOrdem })
  })
  // ... resto da lógica de feedback
}
```

## ✅ **Vantagens da Nova Implementação**

### **🔢 Simplicidade Numérica:**
- **Ordem clara**: 0, 1, 2, 3... (sem gaps ou faixas complexas)
- **Fácil compreensão**: Número menor = posição anterior na tabela
- **Renumeração simples**: Apenas atualizar números sequenciais
- **Debug facilitado**: Fácil visualizar ordem atual

### **🎯 Flexibilidade Total:**
- **Drag and drop irrestrito**: Usuário pode mover qualquer conta (exceto Saldo Anterior)
- **Personalização completa**: Ordem definida pelo usuário é respeitada
- **Persistência**: Ordem salva e mantida entre sessões
- **Recuperação**: Sempre possível resetar para ordem por categoria

### **🏗️ Arquitetura Robusta:**
- **Campo específico**: `ordemTabela` dedicado apenas para ordenação
- **Inicialização automática**: Ordem definida automaticamente se não existir
- **Validações**: Saldo Anterior sempre protegido na posição 0
- **Consistência**: Numeração sempre sequencial sem gaps

### **🔄 Manutenibilidade:**
- **Lógica centralizada**: Toda ordenação em funções específicas
- **Separação clara**: Ordenação inicial vs. atualização por drag and drop
- **Debug integrado**: Rota para visualizar ordens atuais
- **Código limpo**: Funções com responsabilidade única

## 🚀 **Status da Implementação**

### **✅ Implementado:**
- **Campo `ordemTabela`** na classe Conta
- **Função `definirOrdemPorCategoria()`** para ordem inicial
- **Função `inicializarOrdemTabela()`** para inicialização automática
- **Função `getContasOrdenadas()`** para exibição ordenada
- **Função `atualizarOrdemContas()`** para drag and drop
- **Rota de atualização** via POST /fluxo/contas/ordem
- **Rota de debug** via GET /debug/contas/ordem
- **Integração completa** com frontend existente

### **✅ Funcionalidades:**
- **Ordenação automática** por categoria na primeira vez
- **Drag and drop funcional** com renumeração automática
- **Proteção do Saldo Anterior** (sempre posição 0)
- **Persistência das ordenações** personalizadas
- **Debug e visualização** das ordens atuais

### **✅ Comportamentos:**
- **Saldo Anterior**: Sempre `ordemTabela = 0`
- **Categorias "Saldo"**: Primeiras posições em ordem alfabética
- **Demais categorias**: Seguem ordem alfabética por categoria e nome
- **Drag and drop**: Renumera todos os números sequencialmente
- **Recarregamento**: Mantém ordem personalizada do usuário

**A nova ordenação numérica está completamente implementada e funcional! 🎉**

Agora cada conta tem um número específico que determina sua posição exata na tabela, permitindo máxima flexibilidade de ordenação mantendo a proteção necessária para o Saldo Anterior.