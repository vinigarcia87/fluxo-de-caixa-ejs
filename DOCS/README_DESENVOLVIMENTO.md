# 🚀 Sistema Fluxo de Caixa - Guia de Desenvolvimento

## 📋 **Visão Geral**

Este projeto é um sistema completo de gestão de fluxo de caixa desenvolvido com **Express.js**, **EJS** e **Bootstrap 5**, configurado com **Nodemon** para desenvolvimento eficiente.

## 🛠️ **Stack Tecnológica**

- **Backend**: Node.js + Express.js
- **Frontend**: EJS Templates + Bootstrap 5
- **Icons**: Bootstrap Icons
- **Dev Tool**: Nodemon (Hot Reload)
- **Package Manager**: NPM

## 🚀 **Iniciando o Desenvolvimento**

### **Comandos Principais:**

```bash
# Desenvolvimento com hot reload (RECOMENDADO)
npm run dev

# Produção
npm start

# Watch com paths específicos
npm run watch
```

### **Primeira execução:**
```bash
cd fluxo-de-caixa
npm install           # Instalar dependências
npm run dev          # Iniciar servidor de desenvolvimento
```

Acesse: `http://localhost:3000`

## 📁 **Estrutura do Projeto**

```
fluxo-de-caixa/
├── app.js                     # Aplicação principal Express
├── package.json               # Dependências e scripts
├── nodemon.json              # Configuração do nodemon
├── bin/
│   └── www                   # Script de inicialização
├── routes/
│   ├── index.js              # Rota da página inicial
│   └── users.js              # Rotas de usuários
├── views/
│   ├── index.ejs             # Página inicial
│   ├── error.ejs             # Página de erro
│   └── users/
│       ├── index.ejs         # Lista de usuários
│       ├── add.ejs           # Adicionar usuário
│       └── view.ejs          # Detalhes do usuário
├── public/
│   └── stylesheets/
│       └── style.css         # Estilos customizados
└── node_modules/             # Dependências instaladas
```

## ⚡ **Hot Reload com Nodemon**

### **Arquivos Monitorados:**
- ✅ **JavaScript** (.js) - Rotas e lógica
- ✅ **EJS Templates** (.ejs) - Views
- ✅ **CSS** (.css) - Estilos
- ✅ **JSON** (.json) - Configurações

### **Funcionalidades:**
- 🔄 **Restart automático** em mudanças
- ⚡ **Delay de 1 segundo** para evitar restarts excessivos
- 📝 **Logs detalhados** para debugging
- 🎯 **Watch inteligente** de pastas específicas

## 🎨 **Bootstrap 5 Integrado**

### **Recursos Utilizados:**
- **Grid System**: Layout responsivo
- **Components**: Cards, Tables, Forms, Buttons, Alerts
- **Utilities**: Spacing, Colors, Typography
- **Icons**: Bootstrap Icons completo
- **Animations**: Hover effects e transitions

### **Design System:**
- **Primary Color**: `#667eea` (Azul/Roxo)
- **Gradients**: Backgrounds modernos
- **Shadows**: Efeitos de profundidade
- **Border Radius**: 15-20px para suavidade
- **Typography**: Sistema responsivo

## 🧑‍💻 **Sistema de Usuários**

### **Funcionalidades Implementadas:**
- ✅ **Listar usuários** com tabela responsiva
- ✅ **Adicionar usuário** com validação
- ✅ **Visualizar detalhes** individual
- ✅ **Remover usuário** com confirmação
- ✅ **Validação** client-side e server-side
- ✅ **Feedback** com mensagens de sucesso/erro

### **URLs Disponíveis:**
```
GET  /              # Página inicial
GET  /users         # Lista de usuários
GET  /users/add     # Formulário de adição
POST /users/add     # Processar adição
GET  /users/:id     # Detalhes do usuário
POST /users/:id/delete # Remover usuário
```

## 📱 **Responsividade**

### **Breakpoints:**
- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 992px
- **Large**: > 992px

### **Testado em:**
- 📱 Smartphones (Portrait/Landscape)
- 📱 Tablets (Portrait/Landscape)
- 💻 Laptops e Desktops
- 🖥️ Monitores widescreen

## 🔧 **Desenvolvimento**

### **Workflow Recomendado:**
1. `npm run dev` (uma única vez)
2. Abra o projeto no seu editor favorito
3. Faça alterações em qualquer arquivo
4. O nodemon reinicia automaticamente
5. Teste no navegador instantaneamente

### **Debugging:**
- **Logs do Express**: Automaticamente no terminal
- **Debug Mode**: `DEBUG=* npm run dev`
- **Network Tab**: Para requisições HTTP
- **Console**: Para JavaScript client-side

### **Arquivos de Configuração:**
- `package.json` - Scripts e dependências
- `nodemon.json` - Configuração do hot reload
- `app.js` - Configuração do Express
- `bin/www` - Servidor HTTP

## 📚 **Documentação Incluída**

### **Guias Disponíveis:**
- 📖 `EXPRESS_GENERATOR_GUIDE.md` - Sobre Express Generator
- 📖 `EJS_GUIDE.md` - Template engine EJS
- 📖 `BOOTSTRAP_INTEGRATION.md` - Bootstrap 5 integrado
- 📖 `NODEMON_SETUP.md` - Hot reload configurado
- 📖 `USUARIOS_SISTEMA.md` - Sistema de usuários
- 📖 `README_DESENVOLVIMENTO.md` - Este guia

## 🚧 **Próximas Funcionalidades**

### **Sistema de Fluxo de Caixa:**
- [ ] Adicionar receitas
- [ ] Adicionar despesas
- [ ] Calcular saldo
- [ ] Relatórios mensais
- [ ] Gráficos de análise
- [ ] Exportar para PDF/Excel

### **Melhorias do Sistema:**
- [ ] Autenticação de usuários
- [ ] Perfis de acesso
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Banco de dados (MongoDB/PostgreSQL)

## 🎯 **Melhores Práticas**

### **Código:**
- ✅ Indentação consistente (2 espaços)
- ✅ Nomes descritivos para variáveis/funções
- ✅ Comentários em pontos críticos
- ✅ Validação de dados sempre

### **Git (para futuro):**
- `git add .` - Adicionar mudanças
- `git commit -m "feat: nova funcionalidade"` - Commit
- `git push` - Enviar para repositório

### **Performance:**
- ✅ Bootstrap via CDN (cache)
- ✅ Minificação automática
- ✅ Imagens otimizadas
- ✅ Lazy loading quando possível

## 💡 **Dicas de Produtividade**

1. **Use `npm run dev`** sempre para desenvolvimento
2. **Mantenha o navegador aberto** para ver mudanças instantaneamente
3. **Use Bootstrap classes** antes de CSS customizado
4. **Teste responsividade** com DevTools (F12)
5. **Valide formulários** no frontend e backend
6. **Use console.log** para debugging rápido

## 🆘 **Troubleshooting**

### **Porta já em uso:**
```bash
# Encontrar processo na porta 3000
netstat -ano | findstr :3000

# Matar processo (Windows)
taskkill /PID <process_id> /F
```

### **Nodemon não reinicia:**
```bash
# Verificar se está assistindo arquivos corretos
npx nodemon --watch routes --watch views ./bin/www
```

### **Bootstrap não carrega:**
- Verificar conexão com internet
- Usar versão local se necessário

## 📞 **Suporte**

- 📧 **Documentação**: Arquivos .md no projeto
- 🌐 **Express.js**: https://expressjs.com/
- 🎨 **Bootstrap**: https://getbootstrap.com/
- 🔄 **Nodemon**: https://nodemon.io/

---

## 🎉 **Sistema Pronto para Desenvolvimento!**

```bash
cd fluxo-de-caixa
npm run dev
# Abra http://localhost:3000
# Comece a desenvolver! 🚀
```

**Ambiente configurado com:**
- ✅ Express.js funcionando
- ✅ Bootstrap 5 integrado
- ✅ Nodemon configurado
- ✅ Sistema de usuários completo
- ✅ Design responsivo
- ✅ Hot reload ativo

**Happy coding! 👨‍💻✨**