# 🚀 Guia de Deploy - Sistema Fluxo de Caixa

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de que tem:
- Node.js 14+ instalado no servidor de produção
- Acesso SSH ao servidor (se deploy em VPS/servidor próprio)
- Conta em plataforma de hosting (Heroku, Vercel, Railway, etc.)

## 🔧 Comandos para Preparar Deploy

### 1. **Preparação Local**

```bash
# 1. Navegar para o diretório do projeto
cd "C:\Projetos\nodejs-fluxo-de-caixa\fluxo-de-caixa"

# 2. Instalar dependências (caso não estejam instaladas)
npm install

# 3. Validar EJS templates
npm run ejs-lint

# 4. Testar aplicação localmente
npm start
```

### 2. **Limpeza para Produção**

```bash
# Remover arquivos desnecessários
rm -rf node_modules
rm -rf DOCS
rm test-*.js 2>/dev/null || true

# Reinstalar apenas dependências de produção
npm install --production
```

### 3. **Configurações de Produção**

Você precisa ajustar algumas configurações antes do deploy:

#### A. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```bash
# Criar arquivo .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
SESSION_SECRET=sua-chave-secreta-super-forte-aqui
SESSION_SECURE=false
EOF
```

#### B. Atualizar app.js para usar variáveis de ambiente:
```javascript
// Substituir no app.js:
secret: process.env.SESSION_SECRET || 'fluxo-de-caixa-secret-key',
cookie: {
  secure: process.env.SESSION_SECURE === 'true',
  maxAge: 24 * 60 * 60 * 1000
}
```

### 4. **Scripts de Deploy no package.json**

Adicione estes scripts ao seu package.json:

```json
{
  "scripts": {
    "start": "node ./bin/www",
    "build": "npm install --production",
    "prestart": "npm run ejs-lint",
    "deploy-prepare": "npm run build && npm run ejs-lint",
    "heroku-postbuild": "npm run build"
  }
}
```

## 🌐 Deploy em Diferentes Plataformas

### **Opção 1: Heroku** (Recomendado para iniciantes)

```bash
# 1. Instalar Heroku CLI
# Baixe de: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login no Heroku
heroku login

# 3. Criar aplicação
heroku create nome-do-seu-app

# 4. Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=sua-chave-secreta-super-forte

# 5. Deploy
git add .
git commit -m "Deploy para produção"
git push heroku main
```

### **Opção 2: Railway**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar projeto
railway init

# 4. Deploy
railway up
```

### **Opção 3: Vercel**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### **Opção 4: VPS/Servidor Próprio**

```bash
# 1. Criar pacote para upload
npm run deploy-prepare
tar -czf fluxo-caixa.tar.gz --exclude=node_modules .

# 2. Upload para servidor (exemplo com scp)
scp fluxo-caixa.tar.gz user@seu-servidor.com:/var/www/

# 3. No servidor:
ssh user@seu-servidor.com
cd /var/www/
tar -xzf fluxo-caixa.tar.gz
npm install --production
npm start

# 4. Configurar PM2 (recomendado)
npm install -g pm2
pm2 start bin/www --name "fluxo-caixa"
pm2 startup
pm2 save
```

## ⚙️ Configurações de Produção Obrigatórias

### 1. **Variáveis de Ambiente**
```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=uma-chave-muito-forte-e-unica
SESSION_SECURE=true  # apenas se usar HTTPS
```

### 2. **Segurança**
- Use HTTPS em produção
- Configure SESSION_SECURE=true
- Use uma SESSION_SECRET forte e única
- Configure firewall adequadamente

### 3. **Performance**
- Use PM2 ou similar para gerenciamento de processos
- Configure proxy reverso (Nginx)
- Ative compressão gzip

## 📂 Estrutura Final para Deploy

```
fluxo-de-caixa/
├── app.js              ✅ Essencial
├── package.json        ✅ Essencial
├── package-lock.json   ✅ Essencial
├── .env               ✅ Produção
├── bin/               ✅ Essencial
├── routes/            ✅ Essencial
├── views/             ✅ Essencial
├── models/            ✅ Essencial
├── public/            ✅ Essencial
├── node_modules/      ⚠️  Será criado no servidor
└── DOCS/              ❌ Remover para produção
```

## ✅ Checklist de Deploy

- [ ] Dependências instaladas
- [ ] Templates EJS validados
- [ ] Configurações de produção aplicadas
- [ ] Variáveis de ambiente configuradas
- [ ] Teste local realizado
- [ ] Arquivo .env criado (não commitar no git!)
- [ ] Deploy realizado
- [ ] Teste de produção realizado

## 🆘 Comandos de Emergência

```bash
# Reverter deploy no Heroku
heroku rollback

# Verificar logs
heroku logs --tail

# Reiniciar aplicação
heroku restart

# No VPS com PM2
pm2 restart fluxo-caixa
pm2 logs fluxo-caixa
```

---

## 🎯 Comando Rápido para Deploy

**Para deploy no Heroku (mais simples):**
```bash
# Preparação única
npm run deploy-prepare
git add .
git commit -m "Preparação para deploy"

# Deploy
heroku create seu-app-nome
heroku config:set SESSION_SECRET=sua-chave-secreta
git push heroku main
```

**Para outros serviços:**
```bash
npm run deploy-prepare
# Seguir instruções específicas da plataforma escolhida
```