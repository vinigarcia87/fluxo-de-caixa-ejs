# 🏦 Fluxo de Caixa - Versão Refatorada

Sistema de controle de fluxo de caixa desenvolvido em Node.js com EJS, aplicando as melhores práticas de mercado.

## 📋 Índice

- [Características](#características)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Segurança](#segurança)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## ✨ Características

### 🔄 Funcionalidades Principais
- ✅ Dashboard com resumo financeiro
- ✅ Controle de movimentações (receitas e despesas)
- ✅ Gestão de contas e categorias
- ✅ Fluxo de caixa anual com visualização mensal
- ✅ Relatórios financeiros com filtros
- ✅ Sistema de sessões seguro
- ✅ Interface responsiva

### 🏗️ Melhorias da Refatoração
- ✅ **Arquitetura em camadas** (Controllers, Services, Models)
- ✅ **Validação robusta** com express-validator
- ✅ **Tratamento de erros centralizado** com classes customizadas
- ✅ **Sistema de logging** estruturado com Winston
- ✅ **Segurança aprimorada** com Helmet, rate limiting e validação
- ✅ **Configuração de ambiente** centralizada e validada
- ✅ **Testes automatizados** com Jest
- ✅ **Linting** com ESLint e regras de segurança
- ✅ **Documentação** completa e organizada
- ✅ **Performance** otimizada com compressão e cache

## 🏛️ Arquitetura

```
src/
├── controllers/     # Lógica de controle das rotas
├── services/        # Lógica de negócio
├── middleware/      # Middlewares customizados
├── utils/           # Utilitários (logger, error handler)
├── validations/     # Validações de entrada
├── config/          # Configurações da aplicação
└── routes/          # Definição de rotas
```

### 📱 Padrões Aplicados

- **MVC Pattern**: Separação clara de responsabilidades
- **Service Layer**: Lógica de negócio isolada
- **Dependency Injection**: Baixo acoplamento entre módulos
- **Error Handling**: Tratamento consistente de erros
- **Input Validation**: Validação em todas as entradas
- **Logging**: Rastreabilidade completa
- **Security First**: Segurança por padrão

## 🚀 Instalação

### Pré-requisitos
- Node.js >= 16.0.0
- npm >= 8.0.0

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/fluxo-de-caixa.git
   cd fluxo-de-caixa
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o ambiente**
   ```bash
   # Para desenvolvimento
   npm run setup-dev

   # Para produção
   npm run setup-prod
   ```

4. **Configure as variáveis de ambiente**
   - Edite `.env` com suas configurações
   - Para desenvolvimento, use valores do `.env.development.new`
   - Para produção, use valores do `.env.production.new`

5. **Inicie o servidor**
   ```bash
   # Desenvolvimento
   npm run dev:new

   # Produção
   npm start
   ```

## 🎯 Uso

### Desenvolvimento
```bash
# Servidor com auto-reload
npm run dev:new

# Servidor com watch nos arquivos
npm run watch:new
```

### Produção
```bash
# Preparar para deploy
npm run deploy-prepare

# Iniciar servidor
npm start
```

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev:new` | Inicia servidor de desenvolvimento (nova arquitetura) |
| `npm run watch:new` | Desenvolvimento com watch em arquivos |
| `npm run lint` | Verificar código com ESLint |
| `npm run lint:fix` | Corrigir problemas automaticamente |
| `npm run test` | Executar testes |
| `npm run test:watch` | Executar testes com watch |
| `npm run test:coverage` | Executar testes com cobertura |
| `npm run security:audit` | Auditoria de segurança |
| `npm run deploy-prepare` | Preparar para deploy |

## 📁 Estrutura do Projeto

```
fluxo-de-caixa/
├── src/                     # Código fonte refatorado
│   ├── controllers/         # Controllers da aplicação
│   │   └── FluxoCaixaController.js
│   ├── services/            # Camada de serviços
│   │   ├── FluxoCaixaService.js
│   │   └── ContaService.js
│   ├── middleware/          # Middlewares customizados
│   │   ├── security.js      # Segurança e rate limiting
│   │   └── session.js       # Configuração de sessões
│   ├── utils/               # Utilitários
│   │   ├── errorHandler.js  # Tratamento de erros
│   │   └── logger.js        # Sistema de logging
│   ├── validations/         # Validações de entrada
│   │   ├── contaValidation.js
│   │   └── movimentacaoValidation.js
│   ├── config/              # Configurações
│   │   └── environment.js   # Configuração de ambiente
│   └── routes/              # Rotas refatoradas
│       └── fluxo-caixa.js
├── tests/                   # Testes automatizados
│   ├── services/            # Testes de serviços
│   ├── setup.js             # Configuração dos testes
│   └── env.js               # Ambiente de teste
├── models/                  # Modelos (legado)
├── views/                   # Templates EJS
├── public/                  # Arquivos estáticos
├── config/                  # Configurações (legado)
├── bin/                     # Executáveis
│   ├── www                  # Servidor original
│   └── www-new              # Servidor refatorado
├── logs/                    # Arquivos de log
├── .env.*                   # Arquivos de ambiente
├── .eslintrc.js             # Configuração ESLint
├── jest.config.js           # Configuração Jest
└── package.json             # Dependências e scripts
```

## 🛠️ Tecnologias

### Core
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **EJS**: Template engine

### Segurança
- **Helmet**: Headers de segurança
- **express-rate-limit**: Rate limiting
- **express-validator**: Validação de entrada

### Qualidade de Código
- **ESLint**: Linting e padronização
- **Jest**: Framework de testes
- **Winston**: Sistema de logging

### Produtividade
- **Nodemon**: Auto-reload em desenvolvimento
- **Compression**: Compressão GZIP
- **Morgan**: Logging HTTP

## 🔒 Segurança

### Medidas Implementadas

- ✅ **Headers de segurança** (Helmet)
- ✅ **Rate limiting** configurável
- ✅ **Validação de entrada** robusta
- ✅ **Sanitização de dados**
- ✅ **Sessões seguras** com configuração apropriada
- ✅ **Prevenção de ataques** (XSS, CSRF, etc.)
- ✅ **Logging de atividades suspeitas**
- ✅ **Configuração de CORS** apropriada

### Configuração de Segurança

```javascript
// Exemplo de configuração em produção
{
  "helmet": "habilitado",
  "rateLimiting": "100 req/15min",
  "sessionSecurity": "strict",
  "httpsOnly": true
}
```

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Cobertura de Código
- **Mínimo**: 70% em todas as métricas
- **Relatórios**: HTML, LCOV, JSON
- **CI/CD**: Integrado aos workflows

### Estrutura de Testes
```
tests/
├── services/           # Testes de serviços
├── controllers/        # Testes de controllers
├── middleware/         # Testes de middleware
├── utils/              # Testes de utilitários
├── setup.js            # Configuração global
└── __mocks__/          # Mocks para testes
```

## 🚢 Deploy

### Preparação
```bash
# Verificar tudo antes do deploy
npm run deploy-prepare
```

### Variáveis de Ambiente Obrigatórias

```env
NODE_ENV=production
SESSION_SECRET=sua-chave-super-secreta
ALLOWED_ORIGINS=https://seu-dominio.com
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] SESSION_SECRET alterado para produção
- [ ] Domínios corretos em ALLOWED_ORIGINS
- [ ] SSL/HTTPS configurado
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Backup configurado (se usando BD)

### Plataformas Suportadas

- **Heroku**: Configurado com heroku-postbuild
- **Railway**: Compatível
- **DigitalOcean**: App Platform
- **AWS**: EC2, Elastic Beanstalk
- **VPS**: Qualquer servidor Linux

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- Usar **ESLint** para padronização
- **Testes** obrigatórios para novas features
- **Documentação** para APIs públicas
- **Commits** seguindo padrão [Conventional Commits](https://conventionalcommits.org/)

### Guidelines

- Seguir arquitetura em camadas
- Implementar tratamento de erro adequado
- Adicionar logs apropriados
- Manter cobertura de testes acima de 70%
- Validar todas as entradas
- Documentar configurações

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/fluxo-de-caixa/issues)
- **Documentação**: Este README
- **Changelog**: Veja releases no GitHub

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🚀 Próximos Passos

### Funcionalidades Planejadas
- [ ] Sistema de autenticação
- [ ] Upload de comprovantes
- [ ] Exportação para Excel/PDF
- [ ] API RESTful
- [ ] Dashboard com gráficos avançados
- [ ] Notificações por email
- [ ] Backup automático
- [ ] Múltiplos usuários

### Melhorias Técnicas
- [ ] Banco de dados real (PostgreSQL/MongoDB)
- [ ] Cache Redis
- [ ] Containerização (Docker)
- [ ] CI/CD com GitHub Actions
- [ ] Monitoring com Prometheus
- [ ] Load balancing
- [ ] Microserviços (futuro)

---

**Desenvolvido com ❤️ usando as melhores práticas de mercado**

---

## 📚 **Documentação Completa**

**Toda a documentação do projeto está organizada no diretório [`DOCS/`](./DOCS/)**

### 🔥 **Documentação Mais Importante:**

- **[📋 Índice Completo](./DOCS/INDEX.md)** - Navegação de toda documentação
- **[🔄 Guia de Migração](./DOCS/MIGRATION-GUIDE.md)** - Como usar a nova arquitetura
- **[🛡️ Atualização de Segurança](./DOCS/SECURITY-UPDATE.md)** - 48 vulnerabilidades corrigidas
- **[📦 Pacotes Corrigidos](./DOCS/PACKAGES-FIXED.md)** - Dependências atualizadas
- **[🐛 Correção do Logger](./DOCS/BUGFIX-LOGGER.md)** - Bug resolvido

### 🚀 **Para Começar Rápido:**

```bash
# 1. Ver toda documentação
ls DOCS/

# 2. Ler guia principal
cat DOCS/INDEX.md

# 3. Migração para nova arquitetura
cat DOCS/MIGRATION-GUIDE.md
```

**📖 [Ver Índice Completo da Documentação →](./DOCS/INDEX.md)**