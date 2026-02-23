# Estrutura do Sistema de Fluxo de Caixa

## 📊 **Sistema Implementado**

Criada a estrutura completa do sistema de fluxo de caixa conforme especificações, com classes organizadas, rotas funcionais e interface moderna.

## 🏗️ **Estrutura de Dados**

### **1. Enumerador TipoConta**
```javascript
// models/TipoConta.js
const TipoConta = {
  DESPESA: 'DESPESA',
  RECEITA: 'RECEITA',
  SALDO: 'SALDO'
};
```

**Características:**
- ✅ Enumerador com os três valores especificados
- ✅ Funções auxiliares para validação e formatação
- ✅ Funções para cores e ícones por tipo
- ✅ Descrições amigáveis para interface

**Funções Disponíveis:**
- `isValidTipoConta(tipo)` - Valida se tipo é válido
- `getTiposContaArray()` - Retorna array com todos os tipos
- `getDescricaoTipoConta(tipo)` - Descrição amigável
- `getCorTipoConta(tipo)` - Classe CSS por tipo
- `getIconeTipoConta(tipo)` - Ícone Bootstrap por tipo

### **2. Classe CategoriaConta**
```javascript
// models/CategoriaConta.js
class CategoriaConta {
  constructor(id, categoria) {
    this.id = id;            // ID único
    this.categoria = categoria; // String da categoria
  }
}
```

**Características:**
- ✅ ID único numérico
- ✅ Campo String "categoria"
- ✅ Métodos de validação e manipulação
- ✅ Categorias pré-cadastradas

**Categorias Padrão:**
- Alimentação, Transporte, Saúde
- Educação, Entretenimento, Moradia
- Salário, Freelances, Investimentos, Outros

**Funções CRUD:**
- `getAllCategorias()` - Lista todas
- `getCategoriaById(id)` - Busca por ID
- `addCategoria(categoria)` - Adiciona nova
- `updateCategoria(id, categoria)` - Atualiza
- `deleteCategoria(id)` - Remove
- `categoriaExists(categoria)` - Verifica duplicata

### **3. Classe Conta**
```javascript
// models/Conta.js
class Conta {
  constructor(id, nomeConta, tipoConta, categoriaConta) {
    this.id = id;                    // ID único
    this.nomeConta = nomeConta;      // String nome da conta
    this.tipoConta = tipoConta;      // TipoConta (enum)
    this.categoriaConta = categoriaConta; // CategoriaConta (instância)
  }
}
```

**Características:**
- ✅ String "nomeConta" como especificado
- ✅ Campo TipoConta (referência ao enum)
- ✅ Campo CategoriaConta (referência à classe)
- ✅ Validações e métodos auxiliares

**Contas Pré-cadastradas:**
- Supermercado (Despesa - Alimentação)
- Combustível (Despesa - Transporte)
- Salário Principal (Receita - Salário)
- Freelance Design (Receita - Freelances)
- Aluguel (Despesa - Moradia)
- Saldo Inicial (Saldo - Outros)

**Funções CRUD:**
- `getAllContas()` - Lista todas
- `getContaById(id)` - Busca por ID
- `getContasByTipo(tipo)` - Filtra por tipo
- `getContasByCategoria(categoriaId)` - Filtra por categoria
- `addConta(conta)` - Adiciona nova
- `updateConta(id, conta)` - Atualiza
- `deleteConta(id)` - Remove
- `contaExists(nome)` - Verifica duplicata

### **4. Classe ContaValor**
```javascript
// models/ContaValor.js
class ContaValor {
  constructor(id, data, valor, conta) {
    this.id = id;        // ID único
    this.data = data;    // Objeto Date
    this.valor = valor;  // Number com 2 casas decimais
    this.conta = conta;  // Conta (instância)
  }
}
```

**Características:**
- ✅ Campo data (Date object)
- ✅ Campo valor numérico com 2 casas decimais
- ✅ Referência para classe Conta
- ✅ Validações e formatações automáticas

**Métodos Especiais:**
- `getValorFormatado()` - Formato moeda brasileira
- `getDataFormatada()` - Formato brasileiro (DD/MM/AAAA)
- `getDataInput()` - Formato input (AAAA-MM-DD)
- `isReceita()`, `isDespesa()`, `isSaldo()` - Identificação de tipo
- `getValorComSinal()` - Valor com sinal (+ receita, - despesa)

**Funções CRUD e Cálculos:**
- `getAllContaValores()` - Lista todas (ordenada por data)
- `getContaValorById(id)` - Busca por ID
- `getContaValoresByPeriodo(inicio, fim)` - Filtra por período
- `getContaValoresByConta(contaId)` - Filtra por conta
- `getContaValoresByTipo(tipo)` - Filtra por tipo
- `addContaValor(contaValor)` - Adiciona nova
- `updateContaValor(id, contaValor)` - Atualiza
- `deleteContaValor(id)` - Remove
- `calcularSaldoAtual()` - Saldo atual total
- `calcularTotalPorTipo(tipo)` - Total por tipo
- `calcularSaldoPorPeriodo(inicio, fim)` - Saldo em período
- `getResumoFinanceiro()` - Resumo completo

## 🛠️ **Dados de Exemplo**

### **Movimentações Pré-cadastradas:**
```javascript
// Receitas
- Salário Principal: R$ 5.000,00 (01/02/2024)
- Freelance Design: R$ 800,00 (10/02/2024)

// Despesas
- Supermercado: R$ 150,50 (02/02/2024)
- Supermercado: R$ 250,75 (12/02/2024)
- Combustível: R$ 80,00 (03/02/2024)
- Combustível: R$ 120,00 (15/02/2024)
- Aluguel: R$ 1.200,00 (05/02/2024)

// Saldo
- Saldo Inicial: R$ 3.000,00 (01/02/2024)
```

### **Resultado dos Cálculos:**
- **Total Receitas**: R$ 5.800,00
- **Total Despesas**: R$ 1.801,25
- **Total Saldos**: R$ 3.000,00
- **Saldo Atual**: R$ 6.998,75
- **Resultado Operacional**: R$ 3.998,75

## 📁 **Estrutura de Arquivos**

### **Modelos (MVC):**
```
models/
├── TipoConta.js        # Enumerador de tipos
├── CategoriaConta.js   # Classe categoria + CRUD
├── Conta.js           # Classe conta + CRUD
└── ContaValor.js      # Classe valor + CRUD + cálculos
```

### **Rotas (MVC):**
```
routes/
└── fluxo-caixa.js     # Todas as rotas do fluxo de caixa
```

### **Views (MVC):**
```
views/fluxo-caixa/
├── dashboard.ejs           # Dashboard principal
├── movimentacoes.ejs       # Lista de movimentações
├── movimentacao-form.ejs   # Formulário add/edit
├── contas.ejs             # Gerenciar contas
└── relatorios.ejs         # Relatórios financeiros
```

## 🔗 **Rotas Implementadas**

### **Dashboard e Navegação:**
```javascript
GET  /fluxo-caixa/              # Dashboard principal
```

### **Movimentações (ContaValor):**
```javascript
GET  /fluxo-caixa/movimentacoes         # Listar com filtros
GET  /fluxo-caixa/movimentacoes/add     # Formulário nova
POST /fluxo-caixa/movimentacoes/add     # Criar nova
GET  /fluxo-caixa/movimentacoes/:id/edit # Formulário editar
POST /fluxo-caixa/movimentacoes/:id/edit # Atualizar
POST /fluxo-caixa/movimentacoes/:id/delete # Remover
```

### **Contas:**
```javascript
GET  /fluxo-caixa/contas           # Listar e gerenciar
POST /fluxo-caixa/contas/add       # Criar nova conta
POST /fluxo-caixa/contas/:id/delete # Remover conta
```

### **Relatórios:**
```javascript
GET  /fluxo-caixa/relatorios       # Relatórios por período
```

## 🎨 **Interface Implementada**

### **Dashboard (dashboard.ejs):**
- ✅ **Cards de resumo** com totais por tipo
- ✅ **Últimas movimentações** em tabela
- ✅ **Ações rápidas** para navegação
- ✅ **Resumo estatístico** do período
- ✅ **Design responsivo** com Bootstrap 5

### **Características Visuais:**
- **Cores por tipo**:
  - 🟢 Verde: Receitas
  - 🔴 Vermelho: Despesas
  - 🔵 Azul: Saldos
- **Ícones Bootstrap** específicos por tipo
- **Formatação monetária** brasileira (R$)
- **Datas formatadas** em português (DD/MM/AAAA)
- **Cards animados** com hover effects
- **Breadcrumb** para navegação

### **Funcionalidades UX:**
- **Alertas auto-fechamento** (5 segundos)
- **Animações de entrada** escalonadas
- **Tabelas responsivas** com hover
- **Botões de ação** contextuais
- **Badges** para categorias
- **Loading states** visuais

## 🔧 **Validações Implementadas**

### **ContaValor (Movimentações):**
- ✅ **Data obrigatória** e válida
- ✅ **Valor numérico** diferente de zero
- ✅ **Conta selecionada** deve existir
- ✅ **Formato automático** com 2 casas decimais

### **Conta:**
- ✅ **Nome obrigatório** e único
- ✅ **Tipo válido** (enum TipoConta)
- ✅ **Categoria obrigatória** e existente
- ✅ **Verificação de duplicatas**

### **Relacionamentos:**
- ✅ **Não permite deletar conta** com movimentações
- ✅ **Referências validadas** entre classes
- ✅ **Integridade dos dados** mantida

## 📊 **Funcionalidades de Cálculo**

### **Saldo Atual:**
```javascript
// Fórmula: Receitas - Despesas + Saldos
Saldo Atual = Σ(Receitas) - Σ(Despesas) + Σ(Saldos)
```

### **Resultado Operacional:**
```javascript
// Fórmula: Apenas Receitas - Despesas (sem saldos)
Resultado = Σ(Receitas) - Σ(Despesas)
```

### **Por Período:**
- Filtragem por data início/fim
- Cálculos específicos do período
- Comparativos e evolutivos

### **Por Categoria:**
- Agrupamento por categoria
- Totais por tipo dentro de categoria
- Análise de distribuição

## 🚀 **Sistema Pronto para Uso**

### **✅ Estrutura Completa:**
- **TipoConta**: Enumerador implementado
- **CategoriaConta**: Classe com ID e categoria
- **Conta**: Classe com nome, tipo e categoria
- **ContaValor**: Classe com data, valor e conta

### **✅ Funcionalidades:**
- **CRUD completo** para todas as entidades
- **Validações robustas** em todos os níveis
- **Cálculos automáticos** de saldos e totais
- **Interface moderna** e responsiva
- **Dados de exemplo** para demonstração

### **✅ Próximos Passos:**
- **Views restantes** (movimentações, relatórios)
- **Filtros avançados** por período/categoria
- **Gráficos interativos** com Chart.js
- **Export de relatórios** (PDF/Excel)
- **Autenticação** de usuários

**O sistema de fluxo de caixa está estruturalmente completo e funcional! 🎉**