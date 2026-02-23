# 🔧 Guia de Variáveis de Ambiente - Fluxo de Caixa

## 📋 Visão Geral

Este projeto usa o pacote **dotenv** para gerenciar configurações através de arquivos `.env`. Isso permite configurações diferentes para desenvolvimento e produção de forma segura e organizada.

## 🏗️ Estrutura dos Arquivos

```
fluxo-de-caixa/
├── .env.development     # Configurações de desenvolvimento
├── .env.production      # Configurações de produção
├── .env.example         # Exemplo de configurações
├── .env                # Arquivo ativo (não commitado)
└── .gitignore          # .env* estão no gitignore
```

## 🚀 Como Usar

### **1. Configuração Inicial**

#### Para Desenvolvimento:
```bash
# Configurar automaticamente
npm run setup-dev

# OU manualmente
cp .env.development .env
```

#### Para Produção:
```bash
# Configurar automaticamente
npm run setup-prod

# OU manualmente
cp .env.production .env
# Depois EDITE o .env com suas configurações reais!
```

### **2. Comandos de Execução**

```bash
# Desenvolvimento (configura .env automaticamente)
npm run dev

# Produção (configura .env automaticamente)
npm run prod

# Desenvolvimento com watch (recarregamento automático)
npm run watch
```

## 📝 Variáveis Disponíveis

### **🔧 Configurações Básicas**

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `NODE_ENV` | development | production | Ambiente de execução |
| `PORT` | 3000 | 3000 | Porta do servidor |
| `DEBUG` | fluxo-caixa:* | false | Debug habilitado |
| `LOG_LEVEL` | debug | error | Nível de logs |

### **🔐 Configurações de Sessão**

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `SESSION_SECRET` | dev-key-simples | **DEVE SER ALTERADA** | Chave para criptografar sessões |
| `SESSION_SECURE` | false | true | Cookies seguros (HTTPS) |
| `SESSION_MAX_AGE` | 86400000 | 86400000 | Duração da sessão (24h) |

### **🌐 URLs Base**

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `BASE_URL` | http://localhost:3000 | https://seu-dominio.com | URL base do site |
| `API_BASE_URL` | http://localhost:3000/api | https://seu-dominio.com/api | URL base da API |

### **📤 Configurações de Upload**

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `UPLOAD_DIR` | public/uploads | public/uploads | Diretório de uploads |
| `MAX_FILE_SIZE` | 5242880 | 2097152 | Tamanho máximo (5MB dev, 2MB prod) |
| `ALLOWED_FILE_TYPES` | jpg,jpeg,png,gif | jpg,jpeg,png | Tipos permitidos |

### **💾 Cache e Performance**

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `CACHE_ENABLED` | false | true | Cache habilitado |
| `CACHE_TTL` | 300 | 3600 | Tempo de vida do cache |
| `COMPRESSION_ENABLED` | - | true | Compressão gzip |
| `RATE_LIMIT_ENABLED` | - | true | Limite de requisições |

### **📧 Email (Futuro)**

| Variável | Desenvolvimento | Produção | Descrição |
|----------|----------------|----------|-----------|
| `EMAIL_ENABLED` | false | true | Emails habilitados |
| `SMTP_HOST` | localhost | smtp.provedor.com | Servidor SMTP |
| `SMTP_PORT` | 1025 | 587 | Porta SMTP |

## ⚙️ Como Usar no Código

### **Acessar Variáveis:**
```javascript
// No código JavaScript
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;
```

### **Exemplo Prático:**
```javascript
// app.js
require('dotenv').config(); // Carrega as variáveis

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: process.env.SESSION_SECURE === 'true',
    maxAge: parseInt(process.env.SESSION_MAX_AGE)
  }
}));
```

## 🔒 Segurança

### **⚠️ IMPORTANTE - Produção:**

1. **SEMPRE altere `SESSION_SECRET` em produção:**
```bash
# Gerar chave forte
SESSION_SECRET=7f3b9e8c2a5d6f1e4b8c7a9d3f6e2b5c8a1d4e7f0b3c6e9f2a5d8c1e4b7f0a3d
```

2. **Configure HTTPS:**
```bash
SESSION_SECURE=true  # Apenas com HTTPS
```

3. **Nunca comite arquivos .env:**
```bash
# .gitignore já inclui
.env*
```

### **🛡️ Boas Práticas:**

- ✅ Use chaves fortes e únicas
- ✅ Diferentes configurações por ambiente
- ✅ Nunca exponha credenciais no código
- ✅ Validar variáveis obrigatórias
- ❌ Nunca comitar arquivos .env
- ❌ Não usar credenciais de dev em prod

## 🎯 Scripts Úteis

```bash
# Configurar desenvolvimento
npm run setup-dev

# Configurar produção
npm run setup-prod

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm run prod

# Preparar para deploy
npm run deploy-prepare
```

## 🐛 Troubleshooting

### **Erro: Cannot find module 'dotenv'**
```bash
npm install dotenv
```

### **Variáveis não carregam**
```bash
# Verifique se o arquivo .env existe
ls -la .env

# Reconfigure o ambiente
npm run setup-dev
```

### **Sessão não funciona**
```bash
# Verifique se SESSION_SECRET está definida
echo $SESSION_SECRET

# Ou no Windows
echo %SESSION_SECRET%
```

### **Deploy não funciona**
```bash
# Configure produção primeiro
npm run setup-prod

# Edite o .env com configurações reais
# Depois faça o deploy
```

## 📚 Exemplos de Configuração

### **Desenvolvimento Local:**
```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=dev-secret-123
SESSION_SECURE=false
DEBUG=fluxo-caixa:*
BASE_URL=http://localhost:3000
```

### **Produção (Heroku):**
```env
NODE_ENV=production
# PORT é definido pelo Heroku automaticamente
SESSION_SECRET=sua-chave-super-forte-unica
SESSION_SECURE=true
DEBUG=false
BASE_URL=https://seu-app.herokuapp.com
```

### **Produção (VPS):**
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=chave-forte-vps-123
SESSION_SECURE=true
BASE_URL=https://seu-dominio.com
CACHE_ENABLED=true
COMPRESSION_ENABLED=true
```

## 🔄 Migração do Sistema Antigo

Se você estava usando configurações hardcoded:

### **Antes:**
```javascript
// ❌ Antigo
app.use(session({
  secret: 'chave-fixa-no-codigo',
  cookie: { secure: false }
}));
```

### **Depois:**
```javascript
// ✅ Novo
require('dotenv').config();
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { secure: process.env.SESSION_SECURE === 'true' }
}));
```

## 🎉 Resumo

- ✅ **dotenv configurado** e funcionando
- ✅ **Dois ambientes** (dev/prod) configurados
- ✅ **Scripts automatizados** para facilitar uso
- ✅ **Segurança implementada** (gitignore, chaves separadas)
- ✅ **Documentação completa** disponível

**Comando rápido para começar:**
```bash
npm run setup-dev && npm run dev
```

Agora seu projeto está preparado para trabalhar com variáveis de ambiente de forma profissional! 🚀