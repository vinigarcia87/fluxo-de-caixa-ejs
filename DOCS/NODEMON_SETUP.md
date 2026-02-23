# Nodemon - Desenvolvimento com Hot Reload

## 🔄 **O que é o Nodemon**

O **Nodemon** é uma ferramenta que monitora mudanças nos arquivos do seu projeto Node.js e reinicia automaticamente o servidor quando detecta alterações. Isso elimina a necessidade de parar e reiniciar manualmente o servidor durante o desenvolvimento.

## 📦 **O que foi configurado**

### ✅ **Instalação**
```bash
npm install --save-dev nodemon
```

### ✅ **Scripts no package.json**
```json
{
  "scripts": {
    "start": "node ./bin/www",           // Produção
    "dev": "nodemon ./bin/www",          // Desenvolvimento
    "watch": "nodemon ./bin/www --watch routes --watch views --watch app.js"
  }
}
```

### ✅ **Arquivo de configuração (nodemon.json)**
```json
{
  "watch": [
    "app.js",        // Arquivo principal
    "routes/",       // Rotas do Express
    "views/",        // Templates EJS
    "public/",       // Arquivos estáticos
    "bin/"          // Scripts de inicialização
  ],
  "ext": "js,ejs,css,json",              // Extensões monitoradas
  "ignore": [
    "node_modules/",                      // Ignorar node_modules
    "*.md",                               // Ignorar arquivos markdown
    "*.log",                              // Ignorar logs
    ".git/",                              // Ignorar git
    "*.tmp"                               // Ignorar temporários
  ],
  "delay": 1000,                          // Delay de 1s para restart
  "env": {
    "NODE_ENV": "development",            // Ambiente de desenvolvimento
    "DEBUG": "fluxo-de-caixa:*"          // Debug habilitado
  },
  "verbose": true                         // Logs detalhados
}
```

## 🚀 **Como usar**

### **Comando principal de desenvolvimento:**
```bash
npm run dev
```

### **Comando com watch específico:**
```bash
npm run watch
```

### **Comando de produção (sem nodemon):**
```bash
npm start
```

## 🎯 **Recursos Configurados**

### **📂 Arquivos Monitorados:**
- ✅ **JavaScript** (.js) - Lógica do servidor
- ✅ **EJS Templates** (.ejs) - Views do frontend
- ✅ **CSS** (.css) - Estilos
- ✅ **JSON** (.json) - Configurações
- ✅ **Rotas** (routes/) - Todas as rotas Express
- ✅ **Views** (views/) - Todos os templates
- ✅ **Public** (public/) - Arquivos estáticos

### **🚫 Arquivos Ignorados:**
- ❌ node_modules/
- ❌ .git/
- ❌ *.log
- ❌ *.md
- ❌ *.tmp

### **⚙️ Configurações Especiais:**
- **Delay**: 1 segundo antes do restart
- **Debug**: Habilitado para desenvolvimento
- **Verbose**: Logs detalhados
- **Environment**: NODE_ENV=development

## 💡 **Benefícios**

### **Antes (sem nodemon):**
```bash
1. Faz alteração no código
2. Ctrl+C para parar servidor
3. npm start para reiniciar
4. Testa mudanças
5. Repete o processo...
```

### **Depois (com nodemon):**
```bash
1. npm run dev (uma única vez)
2. Faz alterações no código
3. Nodemon reinicia automaticamente
4. Testa mudanças instantaneamente
5. Continue desenvolvendo!
```

### **🚀 Vantagens:**
- ✅ **Produtividade**: Sem reinicializações manuais
- ✅ **Rapidez**: Desenvolvimento mais fluido
- ✅ **Foco**: Concentre-se no código, não no servidor
- ✅ **Detecção**: Monitora múltiplos tipos de arquivo
- ✅ **Configurável**: Personalizável para suas necessidades

## 📊 **Monitoramento em Tempo Real**

### **O nodemon detecta mudanças em:**
- Modificações em arquivos JavaScript
- Alterações em templates EJS
- Mudanças em arquivos CSS
- Adição/remoção de arquivos
- Alterações em configurações JSON

### **Logs do nodemon:**
```bash
[nodemon] starting `node ./bin/www`
[nodemon] watching path(s): routes/ views/ app.js bin/ public/
[nodemon] watching extensions: js,ejs,css,json
[nodemon] starting `node ./bin/www`

# Quando há mudanças:
[nodemon] restarting due to changes...
[nodemon] starting `node ./bin/www`
```

## 🔧 **Comandos Úteis**

### **Desenvolvimento normal:**
```bash
npm run dev
```

### **Watch com paths específicos:**
```bash
npm run watch
```

### **Nodemon com debug:**
```bash
DEBUG=* npm run dev
```

### **Nodemon ignorando arquivos específicos:**
```bash
npx nodemon --ignore "*.test.js" ./bin/www
```

### **Nodemon apenas para arquivos JS:**
```bash
npx nodemon --ext js ./bin/www
```

## 🛠️ **Configurações Avançadas**

### **Personalizar delay:**
```json
{
  "delay": 2000  // 2 segundos
}
```

### **Executar scripts antes/depois:**
```json
{
  "events": {
    "start": "echo 'Servidor iniciando...'",
    "restart": "echo 'Reiniciando servidor...'",
    "crash": "echo 'Servidor travou!'"
  }
}
```

### **Diferentes ambientes:**
```json
{
  "env": {
    "NODE_ENV": "development",
    "PORT": 3001,
    "DEBUG": "*"
  }
}
```

## 📋 **Troubleshooting**

### **Problema: Nodemon não detecta mudanças**
```bash
# Solução: Verificar se está assistindo os paths corretos
npx nodemon --watch routes --watch views ./bin/www
```

### **Problema: Muitos restarts**
```bash
# Solução: Aumentar delay
{
  "delay": 2000
}
```

### **Problema: Quer ignorar certos arquivos**
```bash
# Solução: Adicionar ao ignore
{
  "ignore": ["*.test.js", "temp/"]
}
```

## 🎉 **Status Atual**

✅ **Nodemon instalado e configurado**
✅ **Scripts de desenvolvimento criados**
✅ **Configuração personalizada aplicada**
✅ **Hot reload funcionando perfeitamente**
✅ **Monitoramento de arquivos JS, EJS, CSS**
✅ **Testado e validado**

**Agora você pode desenvolver sem interrupções! 🚀**

### **Para começar:**
```bash
cd fluxo-de-caixa
npm run dev
```

**Faça suas alterações e o servidor reiniciará automaticamente!**