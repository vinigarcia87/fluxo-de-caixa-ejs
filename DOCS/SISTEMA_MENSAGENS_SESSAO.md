# Sistema de Mensagens via Sessão

## Visão Geral
Sistema implementado para substituir o método de envio de mensagens via parâmetros da URL por um sistema mais elegante usando sessões.

## Alterações Implementadas

### 1. Instalação e Configuração
- **Pacote instalado**: `express-session`
- **Configuração no app.js**: Middleware de sessão e mensagens flash

### 2. Middleware de Sessão
```javascript
app.use(session({
  secret: 'fluxo-de-caixa-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
```

### 3. Middleware de Mensagens Flash
```javascript
app.use(function(req, res, next) {
  res.locals.message = req.session.message;
  res.locals.error = req.session.error;
  delete req.session.message;
  delete req.session.error;
  next();
});
```

### 4. Helper Functions
```javascript
function setSuccessMessage(req, message) {
  req.session.message = message;
}

function setErrorMessage(req, message) {
  req.session.error = message;
}
```

## Como Usar

### Antes (com URLs):
```javascript
res.redirect('/pagina?message=' + encodeURIComponent('Sucesso!'));
res.redirect('/pagina?error=' + encodeURIComponent('Erro!'));
```

### Depois (com sessões):
```javascript
setSuccessMessage(req, 'Sucesso!');
res.redirect('/pagina');

setErrorMessage(req, 'Erro!');
res.redirect('/pagina');
```

## Vantagens

1. **URLs Limpas**: Não há mais parâmetros de mensagem nas URLs
2. **Segurança**: Mensagens não ficam expostas na URL
3. **Melhor UX**: Usuário pode recarregar a página sem re-exibir mensagens
4. **Histórico**: URLs ficam limpas no histórico do navegador
5. **Compatibilidade**: Views existentes continuam funcionando

## Rotas Atualizadas

Todas as rotas do módulo `fluxo-caixa.js` foram atualizadas:

### Movimentações:
- POST `/fluxo-caixa/movimentacoes/add`
- POST `/fluxo-caixa/movimentacoes/edit/:id`
- POST `/fluxo-caixa/movimentacoes/delete/:id`

### Contas:
- POST `/fluxo-caixa/contas/add`
- POST `/fluxo-caixa/contas/delete/:id`

### Fluxo Principal:
- POST `/fluxo-caixa/fluxo/conta/add`
- POST `/fluxo-caixa/fluxo/movimentacao/add`

## Views Compatíveis

As views já estavam usando as variáveis corretas:
```ejs
<% if (message) { %>
  <div class="alert alert-success">
    <%= message %>
  </div>
<% } %>

<% if (error) { %>
  <div class="alert alert-danger">
    <%= error %>
  </div>
<% } %>
```

## Resultado

- ✅ URLs mais limpas e profissionais
- ✅ Melhor experiência do usuário
- ✅ Maior segurança
- ✅ Sistema compatível com views existentes
- ✅ Fácil manutenção e extensão

## Status
🟢 **IMPLEMENTADO** - Sistema funcionando em todas as rotas do fluxo de caixa