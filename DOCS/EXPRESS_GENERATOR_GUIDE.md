# Express Generator - Guia Completo

O **Express Generator** é uma ferramenta oficial de scaffolding (geração de estrutura) para projetos Node.js com Express. Ele cria rapidamente a estrutura básica de uma aplicação web Express com uma organização de pastas e arquivos padronizada.

## O que faz o Express Generator:

### 🏗️ **Scaffolding Automático**
- Cria toda a estrutura de pastas e arquivos de um projeto Express
- Gera código boilerplate (código padrão inicial)
- Configura dependências básicas no `package.json`

### 📁 **Estrutura Padrão Criada**
```
meu-projeto/
├── app.js              # Aplicação principal
├── package.json        # Dependências e scripts
├── bin/
│   └── www            # Script de inicialização do servidor
├── public/            # Arquivos estáticos
│   ├── images/
│   ├── javascripts/
│   └── stylesheets/
│       └── style.css
├── routes/            # Definição das rotas
│   ├── index.js
│   └── users.js
└── views/             # Templates de visualização
    ├── error.ejs
    └── index.ejs
```

### 🎨 **Opções de Template Engine**
```bash
express --view=ejs meu-projeto     # EJS (como usamos)
express --view=pug meu-projeto     # Pug
express --view=hbs meu-projeto     # Handlebars
express --no-view meu-projeto      # Sem template engine
```

### 🚀 **Principais Vantagens**

1. **Rapidez**: Cria projeto completo em segundos
2. **Padronização**: Estrutura organizada e consistente
3. **Best Practices**: Segue convenções da comunidade Express
4. **Pronto para usar**: Servidor funcional imediatamente

### 🔧 **Dependências Incluídas por Padrão**
- `express` - Framework web
- `morgan` - Logger HTTP
- `cookie-parser` - Parse de cookies
- `debug` - Debugging
- `http-errors` - Tratamento de erros HTTP
- Template engine escolhido (EJS no nosso caso)

### 💡 **Alternativa Manual**
Sem o Express Generator, você teria que:
```bash
mkdir meu-projeto
cd meu-projeto
npm init -y
npm install express ejs morgan cookie-parser debug http-errors
mkdir routes views public bin
# Criar cada arquivo manualmente...
```

### 🎯 **Quando Usar**
- ✅ Projetos novos do zero
- ✅ Prototipagem rápida
- ✅ Aprendizado de Express
- ✅ Estrutura padrão desejada

### 🚫 **Quando NÃO Usar**
- ❌ Projetos com estrutura muito específica
- ❌ Microserviços minimalistas
- ❌ APIs simples sem views

## Instalação

```bash
# Instalar globalmente
npm install -g express-generator

# Criar projeto
express --view=ejs nome-do-projeto

# Instalar dependências
cd nome-do-projeto
npm install

# Iniciar servidor
npm start
```

## Comandos Úteis

```bash
# Ver todas as opções
express --help

# Criar com diferentes templates
express --view=pug meu-app-pug
express --view=hbs meu-app-handlebars
express --no-view minha-api

# Criar na pasta atual
express --view=ejs .
```

**Em resumo**: O Express Generator é como um "assistente de criação de projeto" que te poupa tempo configurando tudo que você precisa para começar a desenvolver com Express imediatamente!