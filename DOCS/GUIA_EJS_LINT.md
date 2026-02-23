# Guia de Uso do EJS-Lint

## 📋 **O que é o EJS-Lint**

O **EJS-Lint** é uma ferramenta que analisa templates EJS em busca de erros de sintaxe antes da execução, ajudando a identificar problemas como:
- Tags EJS malformadas (`<% %>`, `<%= %>`, `<%- %>`)
- Estruturas condicionais incorretas (`if/else/elseif`)
- Loops com sintaxe inválida
- Variáveis não definidas
- Aninhamento incorreto de blocos

## 🛠️ **Scripts Disponíveis**

### **1. Verificar Todos os Arquivos EJS**
```bash
npm run ejs-lint
```
- **Função**: Analisa todos os arquivos `.ejs` na pasta `views/` e subpastas
- **Uso**: Para verificação completa do projeto
- **Padrão**: `views/**/*.ejs`

### **2. Verificar Arquivo Específico**
```bash
npm run ejs-lint-single nome-do-arquivo.ejs
```
- **Função**: Analisa apenas um arquivo específico
- **Exemplo**: `npm run ejs-lint-single views/fluxo-caixa/fluxo.ejs`
- **Uso**: Para verificação pontual

### **3. Verificação Automática (Watch Mode)**
```bash
npm run ejs-lint-watch
```
- **Função**: Monitora mudanças em arquivos `.ejs` e executa lint automaticamente
- **Uso**: Durante desenvolvimento ativo
- **Vantagem**: Detecta erros em tempo real

## 🚀 **Como Usar no Dia a Dia**

### **Fluxo Recomendado:**

#### **1. Antes de Commitar Código:**
```bash
npm run ejs-lint
```
Garante que todos os templates estão corretos antes de salvar no repositório.

#### **2. Durante Desenvolvimento:**
```bash
npm run ejs-lint-watch
```
Em um terminal separado, deixe rodando para detectar erros conforme você edita.

#### **3. Debugando Erro Específico:**
```bash
npm run ejs-lint-single views/caminho/arquivo.ejs
```
Foca na análise do arquivo problemático.

## 📊 **Interpretando a Saída**

### **✅ Sem Erros:**
```
📁 Analisando: views/users/index.ejs ✓
📁 Analisando: views/users/add.ejs ✓
📁 Analisando: views/fluxo-caixa/fluxo.ejs ✓

✅ Todos os arquivos EJS estão corretos!
```

### **❌ Com Erros:**
```
📁 Analisando: views/fluxo-caixa/fluxo.ejs
❌ ERRO em views/fluxo-caixa/fluxo.ejs na linha 470:
   Unexpected token 'else'

Contexto:
468: <% } else { %>
469: title="Saldo calculado automaticamente"
470: <% } else if (valor === 0) { %>
     ^^^^^^^^^ Problema aqui

Explicação:
- Não é possível usar 'else if' após um bloco 'else'
- Reestruture a lógica condicional
```

## 🔧 **Tipos de Erros Comuns**

### **1. Tags EJS Malformadas:**
```ejs
❌ Errado:
<% if (condicao) { %> <% } %>
<%= variavel %> %> (tag de fechamento extra)

✅ Correto:
<% if (condicao) { %>
  <!-- conteúdo -->
<% } %>
<%= variavel %>
```

### **2. Estruturas Condicionais:**
```ejs
❌ Errado:
<% if (a) { %>
<% } else { %>
<% } else if (b) { %> // else if após else!

✅ Correto:
<% if (a) { %>
<% } else if (b) { %>
<% } else { %>
<% } %>
```

### **3. Loops Incorretos:**
```ejs
❌ Errado:
<% for (item in items) { %> // usar 'of' para arrays

✅ Correto:
<% for (const item of items) { %>
<% } %>
```

### **4. Variáveis Não Definidas:**
```ejs
❌ Errado:
<%= usuarioNome %> // se variável não existe

✅ Correto:
<%= typeof usuarioNome !== 'undefined' ? usuarioNome : 'N/A' %>
```

## 🎯 **Dicas de Boas Práticas**

### **1. Sempre Validar Variáveis:**
```ejs
<% if (typeof usuarios !== 'undefined' && usuarios.length > 0) { %>
  <% usuarios.forEach(usuario => { %>
    <div><%= usuario.nome %></div>
  <% }); %>
<% } %>
```

### **2. Separar Lógica Complexa:**
```ejs
❌ Evitar:
<% if (condicao1 && (condicao2 || condicao3) && !condicao4) { %>

✅ Melhor:
<%
const mostrarElemento = condicao1 &&
                       (condicao2 || condicao3) &&
                       !condicao4;
if (mostrarElemento) {
%>
```

### **3. Comentários Explicativos:**
```ejs
<%# Comentário EJS que não aparece no HTML final %>
<!-- Comentário HTML que aparece no código-fonte -->

<%# Verificar se usuário está logado antes de exibir dados %>
<% if (typeof usuario !== 'undefined') { %>
```

## ⚡ **Integração com Workflow**

### **1. Desenvolvimento com Watch:**
```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: EJS-Lint Watch
npm run ejs-lint-watch
```

### **2. Antes de Commit (Git Hooks):**
Adicione ao script `pre-commit`:
```bash
npm run ejs-lint && echo "✅ EJS templates OK"
```

### **3. CI/CD Pipeline:**
```yaml
# .github/workflows/test.yml
- name: Lint EJS Templates
  run: npm run ejs-lint
```

## 🔍 **Resolução de Problemas**

### **Erro: "Template não encontrado"**
- Verifique o caminho do arquivo
- Certifique-se que está na pasta `views/`

### **Erro: "Unexpected token"**
- Verifique balanceamento de tags `<% %>`
- Procure por `else if` após `else`
- Confirme fechamento de blocos `if/for/while`

### **Performance Lenta:**
- Use `ejs-lint-single` para arquivos específicos
- Ignore arquivos temporários com `.ejslintignore`

## 📝 **Arquivo de Configuração (.ejslintrc)**

Crie `.ejslintrc` na raiz para personalizar:
```json
{
  "delimiter": "%",
  "openDelimiter": "<",
  "closeDelimiter": ">"
}
```

## 🎉 **Benefícios do EJS-Lint**

### **✅ Desenvolvimento:**
- **Detecção precoce**: Erros encontrados antes da execução
- **Produtividade**: Menos debugging de templates
- **Qualidade**: Código EJS mais limpo e consistente

### **✅ Equipe:**
- **Padronização**: Todos seguem mesmas regras
- **Onboarding**: Novos desenvolvedores cometem menos erros
- **Code Review**: Foco em lógica, não sintaxe

### **✅ Produção:**
- **Confiabilidade**: Menos erros em runtime
- **Performance**: Templates válidos compilam mais rápido
- **Manutenibilidade**: Código mais legível

## 📚 **Comandos de Referência Rápida**

```bash
# Análise completa
npm run ejs-lint

# Arquivo específico
npm run ejs-lint-single views/exemplo.ejs

# Modo watch (desenvolvimento)
npm run ejs-lint-watch

# Verificar apenas mudanças recentes
git diff --name-only | grep '.ejs$' | xargs npx ejs-lint
```

## ✅ **Checklist de Uso**

- [ ] Executar `npm run ejs-lint` antes de cada commit
- [ ] Usar `npm run ejs-lint-watch` durante desenvolvimento ativo
- [ ] Corrigir todos os erros reportados antes de fazer deploy
- [ ] Revisar templates complexos com `ejs-lint-single`
- [ ] Manter documentação de padrões EJS da equipe

**O EJS-Lint está configurado e pronto para uso! Use-o regularmente para manter a qualidade dos seus templates EJS. 🚀**