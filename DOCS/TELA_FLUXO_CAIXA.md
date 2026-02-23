# Tela de Fluxo de Caixa - Visão Anual

## 📊 **Funcionalidade Implementada**

Criada a tela principal de fluxo de caixa que exibe uma **tabela consolidada** com as contas nas linhas e os meses do ano nas colunas, mostrando uma visão completa do fluxo financeiro anual.

## 🎯 **Características da Tela**

### **✅ Seletor de Ano**
- **Posição**: No cabeçalho da página
- **Padrão**: Ano atual selecionado automaticamente
- **Opções**: Todos os anos que possuem dados na tabela ContaValor
- **Ordenação**: Anos em ordem decrescente (mais recente primeiro)
- **Funcionalidade**: Ao mudar o ano, recarrega a página com os dados filtrados

### **✅ Estrutura da Tabela**
```
| CONTA          | JAN | FEV | MAR | ... | DEZ | TOTAL |
|----------------|-----|-----|-----|-----|-----|-------|
| Supermercado   | 150 | 250 |  80 | ... | 120 |  600  |
| Salário        |5000 |5000 |5000 | ... |5000 |60000  |
| ...            | ... | ... | ... | ... | ... |  ...  |
| TOTAL MENSAL   |4850 |4750 |4920 | ... |4880 |59400  |
```

### **✅ Dados Exibidos**
- **Linhas**: Todas as contas cadastradas (da tabela Conta)
- **Colunas**: 12 meses do ano + coluna Total
- **Células**: Valores da tabela ContaValor filtrados por conta, mês e ano
- **Footer**: Totais por mês e total geral do ano

## 🔧 **Lógica de Processamento**

### **1. Obtenção dos Anos Disponíveis**
```javascript
// Extrai todos os anos únicos das movimentações
const anosDisponiveis = [...new Set(
  todasMovimentacoes.map(mov => mov.data.getFullYear())
)].sort((a, b) => b - a); // Ordenação decrescente
```

### **2. Filtro por Ano**
```javascript
// Filtra movimentações do ano selecionado
const movimentacoesPorAno = todasMovimentacoes.filter(mov =>
  mov.data.getFullYear() === anoSelecionado
);
```

### **3. Estrutura de Dados**
```javascript
// Organiza dados: conta -> mês -> valor
const dadosPorContaMes = {
  contaId: {
    conta: contaObject,
    meses: {
      0: valor,  // Janeiro
      1: valor,  // Fevereiro
      // ... até dezembro (11)
    }
  }
};
```

### **4. Agrupamento por Conta e Mês**
```javascript
movimentacoesPorAno.forEach(mov => {
  const contaId = mov.conta.id;
  const mes = mov.data.getMonth(); // 0-11

  dadosPorContaMes[contaId].meses[mes] += mov.getValorComSinal();
});
```

### **5. Cálculo de Totais**
- **Por Mês**: Soma todos os valores das contas no mês
- **Por Conta**: Soma todos os meses da conta
- **Geral**: Soma de todos os totais mensais

## 🎨 **Interface e Design**

### **Cores por Tipo de Valor:**
- 🟢 **Verde**: Valores positivos (receitas)
- 🔴 **Vermelho**: Valores negativos (despesas)
- ⚫ **Cinza**: Valores zero (sem movimentação)

### **Formatação de Valores:**
- **Moeda brasileira**: R$ 1.234,56
- **Valores negativos**: Indicação "(débito)"
- **Sem movimentação**: Símbolo "-"

### **Elementos Visuais:**
- **Ícones por tipo**: Cada conta tem ícone baseado no TipoConta
- **Badges de categoria**: Categoria da conta em badge
- **Header sticky**: Cabeçalho da tabela fica fixo no scroll
- **Responsividade**: Adaptação para dispositivos móveis

### **Funcionalidades UX:**
- **Hover effects**: Destaque das linhas ao passar o mouse
- **Scroll personalizado**: Barra de rolagem estilizada
- **Animações**: Fade-in suave da tabela
- **Tooltips**: Informações adicionais no mobile

## 📱 **Responsividade**

### **Desktop (>768px):**
- Tabela completa com todos os meses visíveis
- Font-size normal (0.9rem)
- Padding padrão nas células

### **Mobile (≤768px):**
- Font-size reduzido (0.8rem)
- Padding otimizado nas células
- Scroll horizontal automático
- Colunas dos meses com largura mínima
- Tooltips para valores truncados

## 🛠️ **Implementação Técnica**

### **Rota Nova:**
```javascript
GET /fluxo-caixa/fluxo?ano=YYYY
```

### **Parâmetros:**
- **ano** (opcional): Ano para filtrar (padrão: ano atual)

### **Processamento de Dados:**
1. **Extração de anos**: Busca anos únicos nos dados
2. **Filtro temporal**: Filtra movimentações do ano
3. **Inicialização**: Cria estrutura zerada para todas as contas
4. **Agrupamento**: Soma valores por conta e mês
5. **Cálculo de totais**: Totais por mês, conta e geral
6. **Renderização**: Envia dados estruturados para a view

### **Validações:**
- Ano padrão se não especificado
- Tratamento de contas sem movimentação
- Validação de dados de entrada
- Tratamento de erros na rota

## 📊 **Exemplo de Dados Processados**

### **Entrada (ContaValor):**
```javascript
[
  { conta: "Supermercado", valor: 150.50, data: "2024-02-02" },
  { conta: "Salário", valor: 5000.00, data: "2024-02-01" },
  { conta: "Aluguel", valor: 1200.00, data: "2024-02-05" }
]
```

### **Saída Processada:**
```javascript
{
  "Supermercado": { jan: 0, fev: 150.50, mar: 0, ... },
  "Salário":      { jan: 0, fev: 5000.00, mar: 0, ... },
  "Aluguel":      { jan: 0, fev: 1200.00, mar: 0, ... }
}
```

### **Totais Calculados:**
```javascript
{
  totaisPorMes: { jan: 0, fev: 6350.50, mar: 0, ... },
  totaisPorConta: { "Supermercado": 150.50, "Salário": 5000.00, ... },
  totalGeral: 6350.50
}
```

## 🔗 **Navegação Implementada**

### **Links Atualizados:**
- **Página inicial**: `/` → `/fluxo-caixa/fluxo`
- **Dashboard**: Botão "Ver Fluxo" → `/fluxo-caixa/fluxo`
- **Breadcrumb**: Dashboard → Fluxo de Caixa

### **Navegação Interna:**
- **Seletor de ano**: Recarrega com ano selecionado
- **Ações rápidas**: Links para outras funcionalidades
- **Breadcrumb**: Navegação hierárquica

## ⚡ **Performance e Otimizações**

### **Estrutura de Dados:**
- **Map/Object**: Acesso rápido aos dados por chave
- **Inicialização prévia**: Evita verificações repetidas
- **Cache de cálculos**: Totais calculados uma vez

### **Interface:**
- **Scroll otimizado**: Container com altura fixa
- **Render condicional**: Valores zero não renderizam HTML complexo
- **CSS otimizado**: Animações com transform/opacity

### **Responsividade:**
- **Media queries**: CSS responsivo eficiente
- **JavaScript condicional**: Funcionalidades por breakpoint
- **Lazy loading**: Elementos não críticos carregados depois

## 📱 **Funcionalidades Mobile**

### **Adaptações Específicas:**
- **Scroll horizontal**: Tabela desliza horizontalmente
- **Font reduzido**: Melhor aproveitamento do espaço
- **Touch friendly**: Áreas de toque adequadas
- **Tooltips**: Informações completas em hover/touch

### **UX Mobile:**
- **Gestos**: Scroll natural em duas direções
- **Feedback visual**: Estados de hover adaptados
- **Performance**: Animações otimizadas para touch

## 🎯 **Casos de Uso**

### **1. Visão Anual Completa:**
- Usuário seleciona ano desejado
- Visualiza comportamento financeiro mensal
- Identifica padrões e tendências

### **2. Análise por Conta:**
- Acompanha desempenho de conta específica
- Compara meses dentro do ano
- Identifica sazonalidades

### **3. Comparação de Períodos:**
- Troca entre anos para comparar
- Analisa evolução temporal
- Identifica crescimentos ou reduções

### **4. Planejamento Financeiro:**
- Usa dados históricos para projeções
- Identifica meses de maior/menor movimento
- Baselinhas para orçamentos futuros

## 🚀 **Sistema Completo!**

### **✅ Implementado:**
- **Seletor de ano** com todos os anos disponíveis
- **Tabela conta x mês** com dados unificados
- **Totais automáticos** por mês, conta e geral
- **Interface responsiva** para todos os dispositivos
- **Navegação integrada** com o sistema existente
- **Design consistente** com o padrão do sistema

### **✅ Funcionalidades:**
- **Filtro temporal** por ano
- **Formatação monetária** brasileira
- **Cores semânticas** por tipo de valor
- **Hover effects** e interações
- **Performance otimizada** para grandes volumes

### **✅ Próximos Passos:**
- Implementar outras views do sistema (movimentações, relatórios)
- Adicionar filtros extras (categoria, tipo)
- Exportação de dados da tabela
- Gráficos comparativos por período

**A tela de fluxo de caixa está completa e funcional! 🎉**