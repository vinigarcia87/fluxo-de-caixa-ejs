# EJS (Embedded JavaScript) - Guia Completo

O **EJS (Embedded JavaScript)** é um template engine simples e poderoso para Node.js que permite incorporar código JavaScript dentro de HTML. É uma das opções mais populares para gerar páginas web dinâmicas.

## 🎯 **O que é EJS**

EJS significa **"Embedded JavaScript"** - JavaScript incorporado. É um sistema de templates que permite:
- Misturar HTML com JavaScript
- Gerar HTML dinamicamente no servidor
- Passar dados do servidor para as views
- Criar páginas web interativas

## 📝 **Sintaxe Básica**

### **Tags Principais:**
```ejs
<% código_javascript %>        <!-- Executa JavaScript (não exibe nada) -->
<%= variável %>                <!-- Exibe valor da variável (escapado) -->
<%- variável %>                <!-- Exibe valor da variável (não escapado/raw HTML) -->
<%# comentário %>              <!-- Comentário (não aparece no HTML final) -->
```

### **Exemplos Práticos:**

**1. Variáveis simples:**
```ejs
<h1>Bem-vindo, <%= nome %>!</h1>
<p>Você tem <%= idade %> anos</p>
```

**2. Condicionais:**
```ejs
<% if (logado) { %>
  <p>Usuário logado!</p>
<% } else { %>
  <p>Faça login</p>
<% } %>
```

**3. Loops:**
```ejs
<ul>
<% produtos.forEach(function(produto) { %>
  <li><%= produto.nome %> - R$ <%= produto.preco %></li>
<% }); %>
</ul>
```

## 🔍 **Como Funciona no Projeto Express**

**1. Configuração (app.js):**
```javascript
app.set('views', path.join(__dirname, 'views'));  // Pasta dos templates
app.set('view engine', 'ejs');                    // Define EJS como engine
```

**2. Rota (routes/index.js):**
```javascript
res.render('index', { title: 'Express' });
```
- `'index'` = nome do arquivo (index.ejs)
- `{ title: 'Express' }` = dados passados para o template

**3. Template (views/index.ejs):**
```ejs
<title><%= title %></title>    <!-- Recebe "Express" -->
<h1><%= title %></h1>          <!-- Exibe "Express" -->
<p>Welcome to <%= title %></p>  <!-- Exibe "Welcome to Express" -->
```

## 🚀 **Principais Vantagens do EJS**

### ✅ **Vantagens:**
- **Simples**: Sintaxe fácil de aprender
- **Flexível**: JavaScript completo disponível
- **Rápido**: Performance boa
- **Familiar**: HTML + JS que você já conhece
- **Debugging**: Mensagens de erro claras

### ❌ **Desvantagens:**
- **Mistura lógica**: HTML e código juntos
- **Sem componentes**: Não tem sistema de componentes avançado
- **Menos recursos**: Comparado ao React/Vue

## 🎨 **Exemplo Prático para Fluxo de Caixa**

```ejs
<!DOCTYPE html>
<html>
<head>
    <title>Fluxo de Caixa - <%= mes %></title>
</head>
<body>
    <h1>Fluxo de Caixa - <%= mes %></h1>

    <h2>Receitas</h2>
    <ul>
    <% receitas.forEach(function(receita) { %>
        <li>
            <%= receita.descricao %> -
            <span style="color: green;">R$ <%= receita.valor.toFixed(2) %></span>
        </li>
    <% }); %>
    </ul>

    <h2>Despesas</h2>
    <ul>
    <% despesas.forEach(function(despesa) { %>
        <li>
            <%= despesa.descricao %> -
            <span style="color: red;">R$ <%= despesa.valor.toFixed(2) %></span>
        </li>
    <% }); %>
    </ul>

    <h3>Saldo:
        <% var saldo = totalReceitas - totalDespesas; %>
        <span style="color: <%= saldo >= 0 ? 'green' : 'red' %>">
            R$ <%= saldo.toFixed(2) %>
        </span>
    </h3>
</body>
</html>
```

## 📖 **Recursos Avançados**

### **Includes (Incluir outros templates)**
```ejs
<%- include('header') %>
<main>
    <!-- conteúdo da página -->
</main>
<%- include('footer') %>
```

### **Partials (Componentes reutilizáveis)**
```ejs
<!-- views/partials/user-card.ejs -->
<div class="user-card">
    <h3><%= user.name %></h3>
    <p><%= user.email %></p>
</div>

<!-- Usar o partial -->
<% users.forEach(function(user) { %>
    <%- include('partials/user-card', { user: user }) %>
<% }); %>
```

### **Filtros e Helpers**
```ejs
<!-- Formatação de datas -->
<p>Data: <%= new Date(data).toLocaleDateString('pt-BR') %></p>

<!-- Formatação de moeda -->
<p>Valor: R$ <%= valor.toFixed(2).replace('.', ',') %></p>
```

## 🛠️ **Configurações Úteis**

```javascript
// app.js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurações opcionais do EJS
app.set('view options', {
    delimiter: '?',        // Muda <% para <?
    openDelimiter: '[',    // Muda <% para [%
    closeDelimiter: ']'    // Muda %> para %]
});
```

## 📚 **Alternativas Populares**

- **Pug** (mais conciso, sem HTML tradicional)
- **Handlebars** (menos lógica, mais templates)
- **React/Vue** (SPAs, mais moderno)
- **Mustache** (logic-less templates)
- **Nunjucks** (similar ao Jinja2 do Python)

## 🎯 **Melhores Práticas**

1. **Separe lógica complexa**: Use helpers ou middlewares
2. **Use includes**: Para headers, footers e componentes
3. **Escape dados**: Use `<%= %>` para segurança
4. **Organize views**: Crie subpastas por funcionalidade
5. **Cache templates**: Em produção para performance

## 📦 **Comandos Úteis**

```bash
# Instalar EJS separadamente
npm install ejs

# Renderizar EJS via CLI
npx ejs template.ejs -o output.html

# Com dados
npx ejs template.ejs -f data.json -o output.html
```

**EJS é perfeito para projetos como o seu fluxo de caixa**: simples, direto e permite criar páginas dinâmicas rapidamente!