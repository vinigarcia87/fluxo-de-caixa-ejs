# Sistema de Logs Melhorado - Aplicação

## 📋 Visão Geral

O sistema de logs foi completamente reformulado para fornecer informações detalhadas sobre todas as operações da aplicação, incluindo URLs, parâmetros, validações e operações de negócio.

## 🚀 Funcionalidades Implementadas

### ✅ **Logging de Requisições HTTP**
- **URL Completa**: Inclui path + query parameters
- **Métodos**: GET, POST, PUT, DELETE
- **Status Codes**: Com indicadores visuais
- **Duração**: Tempo de processamento em ms
- **Tamanho da Resposta**: Em bytes
- **IP do Cliente**: Para auditoria
- **User-Agent**: Identificação do cliente

### ✅ **Logging de Validações**
- **Parâmetros de Rota**: Validação de `:id`
- **Express-validator**: Erros detalhados de validação
- **Upload de Arquivos**: Validação de tipo e tamanho
- **Dados Sensíveis**: Mascaramento automático

### ✅ **Logging de Operações de Negócio**
- **Operações de Usuário**: CREATE, UPDATE, DELETE
- **Processamento de Arquivos**: Upload e redimensionamento
- **Busca**: Termos e resultados
- **Performance**: Operações lentas detectadas

## 🎨 Formato dos Logs

### **Indicadores Visuais**
```
✅ Operação bem-sucedida
❌ Erro ou falha
⚠️ Aviso ou validação falhada
🔍 Validação em progresso
📷 Upload de arquivo
👤 Operação de usuário
💰 Operação financeira
🗄️ Query de banco de dados
📤 Upload de arquivo
```

### **Estrutura dos Logs**
```
[TIPO] TIMESTAMP ÍCONE Mensagem
{
  "dados": "estruturados",
  "em": "JSON",
  "para": "análise"
}
```

## 📊 Exemplos de Logs

### **1. Requisição HTTP com Parâmetros**
```
[DEBUG] 2026-02-23T21:36:29.724Z → Incoming Request
{
  "method": "GET",
  "url": "/users?page=1&limit=10",
  "query": { "page": "1", "limit": "10" },
  "ip": "::1"
}

[INFO] 2026-02-23T21:36:29.724Z ✅ HTTP GET /users?page=1&limit=10
{
  "status": 200,
  "duration": "25ms",
  "responseSize": "2048 bytes"
}
```

### **2. Validação de Parâmetros**
```
[VALIDATION] 2026-02-23T21:37:12.973Z 🔍 Validando parâmetro ID
{
  "url": "/users/1",
  "method": "GET",
  "id": "1",
  "isValid": true
}

[VALIDATION] 2026-02-23T21:37:12.973Z ✅ Parâmetro ID válido
{
  "url": "/users/1",
  "id": "1"
}
```

### **3. Erro de Validação**
```
[VALIDATION] 2026-02-23T21:37:45.066Z ❌ ID inválido rejeitado
{
  "url": "/users/abc",
  "id": "abc",
  "reason": "not-a-number"
}
```

### **4. Erros de Validação Express-Validator**
```
[VALIDATION] 2026-02-23T21:37:56.753Z ⚠️ Erros de validação encontrados
{
  "url": "/users/add",
  "method": "POST",
  "errorCount": 7,
  "errors": [
    {
      "field": "nome",
      "value": "",
      "message": "Nome é obrigatório",
      "location": "body"
    },
    {
      "field": "email",
      "value": "invalid",
      "message": "Email deve ter um formato válido",
      "location": "body"
    }
  ],
  "ip": "::1",
  "userAgent": "curl/8.12.1"
}
```

### **5. Upload de Arquivos**
```
[VALIDATION] 2026-02-23T21:38:15.123Z 📷 Validando upload de foto
{
  "url": "/users/add",
  "hasFile": true,
  "fileInfo": {
    "originalName": "profile.jpg",
    "mimetype": "image/jpeg",
    "size": "524288 bytes",
    "sizeFormatted": "0.50 MB"
  }
}

[SERVICE] 2026-02-23T21:38:15.234Z 📸 Foto processada e salva
{
  "filename": "user-4-1708722295234.jpg",
  "originalSize": "524288 bytes",
  "processedSize": "300x300px",
  "quality": "90%",
  "userId": "4"
}
```

### **6. Operações de Usuário**
```
[USER] 2026-02-23T21:38:20.456Z 👤 CREATE
{
  "userId": 4,
  "email": "novo@email.com",
  "nome": "Novo Usuário",
  "hasPhoto": true,
  "source": "web-form"
}
```

### **7. Busca de Usuários**
```
[SERVICE] 2026-02-23T21:38:25.678Z 🔍 Busca de usuários realizada
{
  "searchTerm": "João",
  "totalResults": 1,
  "totalUsers": 4,
  "searchFields": ["nome", "email", "cpf", "telefone"]
}
```

### **8. Requisição Lenta**
```
[WARN] 2026-02-23T21:38:30.123Z ⏳ Slow Request Detected
{
  "method": "POST",
  "url": "/users/add",
  "duration": "1250ms",
  "slowRequestThreshold": "1000ms"
}
```

## ⚙️ Configuração de Níveis

### **DEBUG** (`LOG_LEVEL=debug`)
- Todas as requisições de entrada
- Body das requisições POST/PUT/PATCH
- Queries de banco de dados
- Validações detalhadas

### **INFO** (padrão)
- Requisições HTTP completas
- Operações de negócio
- Uploads de arquivos
- Estatísticas de busca

### **WARN**
- Validações falhadas
- Arquivos rejeitados
- Requisições lentas

### **ERROR**
- Erros de aplicação
- Falhas de validação críticas
- Status HTTP 4xx/5xx

## 🔒 Segurança dos Logs

### **Dados Mascarados Automaticamente**
```javascript
// Campos sensíveis são automaticamente ocultados
if (bodyData.password) bodyData.password = '[HIDDEN]';
if (bodyData.token) bodyData.token = '[HIDDEN]';
if (bodyData.secret) bodyData.secret = '[HIDDEN]';
```

### **Truncamento de Valores Longos**
```javascript
// Valores longos são truncados para evitar logs extensos
value: value.length > 50
  ? value.substring(0, 50) + '...'
  : value
```

## 📁 Estrutura de Arquivos de Log

### **Desenvolvimento**
- Console colorizado com todos os níveis
- Logs estruturados em JSON
- Debug habilitado por padrão

### **Produção**
- Arquivos de log rotativos
- Apenas INFO, WARN, ERROR
- Logs de exceções separados

## 🔧 Funções Utilitárias

### **Logger Específicos Disponíveis**
- `logger.userOperation(operation, userId, data)`
- `logger.fileUpload(filename, size, mimetype, userId)`
- `logger.validationError(field, value, rule, req)`
- `logger.authEvent(event, user, req, data)`
- `logger.databaseQuery(query, params, duration)`

## 📈 Benefícios

### **Para Desenvolvimento**
- Debug facilitado com informações completas
- Rastreamento de fluxo de requisições
- Identificação rápida de problemas

### **Para Produção**
- Monitoramento de performance
- Auditoria de operações
- Detecção de tentativas de ataque

### **Para Manutenção**
- Logs estruturados para análise
- Timestamps precisos
- Contexto completo das operações

## 🎯 Próximas Melhorias

### **Possíveis Implementações**
- Integração com Elasticsearch/Kibana
- Alertas para operações críticas
- Dashboard de monitoramento
- Métricas de performance automáticas

---

**Data da Implementação**: 23/02/2026
**Status**: ✅ Implementado e Funcional