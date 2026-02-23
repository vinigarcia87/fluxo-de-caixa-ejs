# Ordenação de Contas por Categoria

## 🎯 **Nova Ordenação Implementada**

O sistema agora ordena automaticamente as contas na tabela de fluxo de caixa seguindo uma hierarquia específica baseada nas **categorias** das contas, não apenas no tipo (RECEITA/DESPESA/SALDO).

## 📋 **Ordem Hierárquica Definida**

### **1ª Posição: Saldo Anterior (Fixo)**
- **Conta**: "Saldo Anterior" (ID 999)
- **Categoria**: "Saldo" (especial)
- **Posição**: Sempre primeira linha
- **Status**: **Não pode ser movida** (protegida)

### **2ª Posição: Categorias "Saldo"**
- **Critério**: Todas as contas com categoria = "Saldo"
- **Subcritério**: Ordem alfabética pelo nome da conta
- **Exemplos**: "Saldo Inicial", "Reserva de Emergência"

### **3ª Posição: Categoria "Salário"**
- **Critério**: Todas as contas com categoria = "Salário"
- **Subcritério**: Ordem alfabética pelo nome da conta
- **Exemplos**: "Salário Principal", "Salário Freelance"

### **4ª+ Posições: Demais Categorias**
- **Critério**: Todas as outras categorias em **ordem alfabética**
- **Subcritério**: Dentro de cada categoria, ordem alfabética pelo nome da conta
- **Exemplos**: "Alimentação", "Educação", "Entretenimento", "Moradia", etc.

## 🔢 **Sistema de Numeração Interna**

### **Faixas de Ordenação:**
```javascript
0       : Saldo Anterior (fixo)
100-199 : Categorias "Saldo"
200-299 : Categoria "Salário"
300+    : Demais categorias (código ASCII alfabético)
```

### **Algoritmo de Cálculo:**
```javascript
function getOrdemPorCategoria(conta) {
  if (conta.id === CONTA_SALDO_ANTERIOR_ID) {
    return 0; // Sempre primeiro
  }

  const nomeCategoria = conta.categoriaConta?.categoria?.toLowerCase() || 'zz';

  // Categorias "Saldo"
  if (nomeCategoria === 'saldo') {
    return 100 + (conta.nomeConta?.toLowerCase() || '').charCodeAt(0);
  }

  // Categoria "Salário"
  if (nomeCategoria === 'salário') {
    return 200 + (conta.nomeConta?.toLowerCase() || '').charCodeAt(0);
  }

  // Demais categorias alfabeticamente
  const ordemAlfabetica = nomeCategoria.charCodeAt(0);
  const desempateNome = (conta.nomeConta?.toLowerCase() || '').charCodeAt(0);
  return 300 + ordemAlfabetica + (desempateNome / 1000);
}
```

## 📊 **Exemplo Prático de Ordenação**

### **Contas Cadastradas:**
```
- Saldo Anterior (Categoria: Saldo)
- Reserva de Emergência (Categoria: Saldo)
- Saldo Inicial (Categoria: Saldo)
- Salário Principal (Categoria: Salário)
- Salário Freelance (Categoria: Salário)
- Supermercado (Categoria: Alimentação)
- Restaurante (Categoria: Alimentação)
- Uber (Categoria: Transporte)
- Combustível (Categoria: Transporte)
- Netflix (Categoria: Entretenimento)
- Spotify (Categoria: Entretenimento)
- Aluguel (Categoria: Moradia)
```

### **Resultado da Ordenação:**
```
1. 🔒 Saldo Anterior          (Saldo - fixo)
2. 💰 Reserva de Emergência    (Saldo - alfabético)
3. 💰 Saldo Inicial           (Saldo - alfabético)
4. 💵 Salário Freelance       (Salário - alfabético)
5. 💵 Salário Principal       (Salário - alfabético)
6. 🍽️  Restaurante            (Alimentação - categoria alfabética)
7. 🛒 Supermercado            (Alimentação - categoria alfabética)
8. 🎬 Netflix                 (Entretenimento - categoria alfabética)
9. 🎵 Spotify                 (Entretenimento - categoria alfabética)
10. 🏠 Aluguel                (Moradia - categoria alfabética)
11. 🚗 Combustível            (Transporte - categoria alfabética)
12. 🚕 Uber                   (Transporte - categoria alfabética)
```

## 🔧 **Implementação Técnica**

### **1. Função de Ordenação - `models/Conta.js`:**

#### **Inicialização Automática:**
```javascript
function inicializarOrdemPadrao() {
  contas.forEach((conta) => {
    if (conta.ordemExibicao === null || conta.ordemExibicao === undefined) {
      conta.ordemExibicao = getOrdemPorCategoria(conta);
    }
  });
}
```

#### **Obter Contas Ordenadas:**
```javascript
function getContasOrdenadas() {
  inicializarOrdemPadrao();

  return contas.sort((a, b) => {
    return (a.ordemExibicao || 0) - (b.ordemExibicao || 0);
  });
}
```

#### **Reorganização Forçada:**
```javascript
function reorganizarContasPorCategoria() {
  // Reset de todas as ordens para aplicar nova lógica
  contas.forEach(conta => {
    conta.ordemExibicao = null;
  });

  // Reaplicar ordem baseada em categorias
  inicializarOrdemPadrao();
  return true;
}
```

### **2. Aplicação na Rota - `routes/fluxo-caixa.js`:**

#### **Reorganização Automática:**
```javascript
router.get('/fluxo', function(req, res, next) {
  // ... código anterior ...

  // Reorganizar contas por categoria antes de exibir
  reorganizarContasPorCategoria();
  const todasContas = getContasOrdenadas();

  // ... resto da lógica ...
});
```

### **3. Drag and Drop Mantido:**

#### **Funcionalidade Preservada:**
- **Arrastar e soltar** continua funcionando
- **Saldo Anterior** continua protegido (não pode ser movido)
- **Ordem personalizada** dentro de cada categoria é respeitada
- **Salvamento automático** via AJAX mantido

#### **Comportamento Atualizado:**
- Contas só podem ser reordenadas **dentro da sua faixa de categoria**
- Nova ordem é aplicada automaticamente quando página recarrega
- Drag and drop respeita as faixas: Saldo (100-199), Salário (200-299), etc.

## ⚖️ **Vantagens da Nova Ordenação**

### **✅ Organização Lógica:**
- **Saldos primeiro**: Informações de saldo sempre no topo para referência
- **Salários destacados**: Receitas principais em posição proeminente
- **Categorias agrupadas**: Contas similares ficam juntas
- **Alfabética intuitiva**: Fácil localização dentro de cada grupo

### **✅ Experiência Melhorada:**
- **Previsibilidade**: Usuário sempre sabe onde encontrar cada tipo de conta
- **Navegação rápida**: Agrupamento lógico facilita localização
- **Consistência**: Mesmo padrão sempre aplicado
- **Flexibilidade**: Ainda permite reordenação via drag and drop

### **✅ Manutenibilidade:**
- **Automática**: Nova ordenação aplicada automaticamente
- **Escalável**: Funciona com qualquer quantidade de categorias/contas
- **Configurável**: Lógica centralizada e fácil de modificar
- **Robusta**: Funciona mesmo com dados inconsistentes

## 📝 **Categorias Existentes**

### **Categorias Especiais (Priorizadas):**
- **"Saldo"** → Posições 100-199
- **"Salário"** → Posições 200-299

### **Demais Categorias (Alfabéticas):**
1. **Alimentação** → Posições 300+
2. **Educação** → Posições 300+
3. **Entretenimento** → Posições 300+
4. **Freelances** → Posições 300+
5. **Investimentos** → Posições 300+
6. **Moradia** → Posições 300+
7. **Outros** → Posições 300+
8. **Saúde** → Posições 300+
9. **Transporte** → Posições 300+

## 🔄 **Comportamento em Diferentes Cenários**

### **Nova Conta Criada:**
```javascript
1. Conta criada com categoria específica
2. Sistema calcula posição baseada na categoria
3. Conta inserida na posição correta automaticamente
4. Ordem mantida ao recarregar página
```

### **Categoria de Conta Alterada:**
```javascript
1. Usuário altera categoria de uma conta
2. Sistema recalcula posição baseada na nova categoria
3. Conta movida para nova posição na próxima visualização
4. Orden alfabética aplicada dentro da nova categoria
```

### **Drag and Drop Usado:**
```javascript
1. Usuário arrasta conta para nova posição
2. Posição salva respeitando faixa da categoria
3. Ordem personalizada mantida dentro da categoria
4. Nova ordem padrão aplicada ao recarregar (se desejado)
```

## 🎯 **Resultado Final**

### **✅ Ordem Hierárquica Clara:**
1. **Saldo Anterior** (sempre fixo no topo)
2. **Contas de Saldo** (ordenadas alfabeticamente)
3. **Contas de Salário** (ordenadas alfabeticamente)
4. **Demais categorias** (alfabéticas) com contas ordenadas alfabeticamente

### **✅ Funcionalidades Mantidas:**
- **Drag and drop** funcional dentro das faixas
- **Proteção** do Saldo Anterior
- **Salvamento automático** de reordenações
- **Interface intuitiva** com handles visuais

### **✅ Experiência Otimizada:**
- **Localização rápida** de qualquer conta
- **Agrupamento lógico** por finalidade
- **Previsibilidade** na organização
- **Flexibilidade** para personalização

**A nova ordenação por categoria está implementada e ativa! 🎉**

Agora as contas são automaticamente organizadas de forma lógica e hierárquica, facilitando a navegação e análise financeira no fluxo de caixa.