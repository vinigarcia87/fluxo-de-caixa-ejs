# Sistema de Gestão de Usuários

## 📋 **O que foi implementado**

### 🛠️ **Arquivos Criados/Modificados:**

1. **routes/users.js** - Rotas para gerenciamento de usuários
2. **views/users/index.ejs** - Página de listagem de usuários
3. **views/users/add.ejs** - Formulário para adicionar usuários
4. **views/users/view.ejs** - Página de detalhes do usuário
5. **views/index.ejs** - Página inicial atualizada com navegação
6. **app.js** - Adicionada rota de usuários

## 🚀 **Funcionalidades Implementadas**

### ✅ **Listagem de Usuários**
- **URL:** `GET /users`
- Exibe todos os usuários em uma tabela organizada
- Mostra ID, Nome, Email, Telefone e Ações
- Links para visualizar detalhes e remover usuários
- Mensagens de feedback para operações

### ✅ **Adicionar Usuário**
- **URL:** `GET /users/add` (formulário)
- **URL:** `POST /users/add` (processar dados)
- Formulário com validação de campos obrigatórios
- Formatação automática de telefone
- Preserva dados em caso de erro
- Validação server-side

### ✅ **Visualizar Detalhes**
- **URL:** `GET /users/:id`
- Exibe informações detalhadas do usuário
- Links para email e telefone funcionais
- Interface limpa e organizada

### ✅ **Remover Usuário**
- **URL:** `POST /users/:id/delete`
- Confirmação antes de remover
- Feedback de sucesso/erro
- Redirecionamento para lista

## 💾 **Estrutura de Dados**

### **Usuário:**
```javascript
{
  id: number,      // ID único auto-incrementado
  nome: string,    // Nome completo (obrigatório)
  email: string,   // Email válido (obrigatório)
  telefone: string // Telefone formatado (obrigatório)
}
```

### **Usuários de Exemplo:**
```javascript
[
  { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999' },
  { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888' },
  { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '(11) 77777-7777' }
]
```

## 🎨 **Interface do Usuário**

### **Design:**
- Cards responsivos com sombras
- Cores organizadas (azul para ações principais, verde para sucesso, vermelho para remoção)
- Formulários com validação visual
- Tabelas com hover effects
- Layout centralizado e limpo

### **Navegação:**
- Página inicial com módulos do sistema
- Links de voltar em todas as páginas
- Breadcrumb implícito via títulos
- Ações contextuais em cada página

## 📱 **URLs Disponíveis**

```bash
GET  /            # Página inicial do sistema
GET  /users       # Lista todos os usuários
GET  /users/add   # Formulário para adicionar usuário
POST /users/add   # Processa adição de usuário
GET  /users/:id   # Detalhes de um usuário específico
POST /users/:id/delete  # Remove um usuário
```

## 🔧 **Como Usar**

### **1. Iniciar o servidor:**
```bash
cd fluxo-de-caixa
npm start
```

### **2. Acessar o sistema:**
- Página inicial: `http://localhost:3000`
- Gestão de usuários: `http://localhost:3000/users`

### **3. Operações disponíveis:**
- **Ver todos os usuários**: Clique em "Usuários" na página inicial
- **Adicionar usuário**: Botão "+ Adicionar Usuário" na lista
- **Ver detalhes**: Botão "Ver" na tabela de usuários
- **Remover usuário**: Botão "Remover" (com confirmação)

## 🛡️ **Validações Implementadas**

### **Server-side:**
- Nome obrigatório e não vazio
- Email obrigatório e não vazio
- Telefone obrigatório e não vazio
- Preservação de dados em caso de erro

### **Client-side:**
- Formatação automática de telefone
- Campos obrigatórios no HTML
- Confirmação antes de remover

## 📚 **Tecnologias Utilizadas**

- **Express.js**: Framework web
- **EJS**: Template engine
- **CSS3**: Estilização moderna
- **JavaScript**: Funcionalidades client-side
- **Array em memória**: Armazenamento temporário (simulando banco)

## 🚧 **Próximas Melhorias**

- [ ] Integração com banco de dados
- [ ] Editar usuário existente
- [ ] Paginação para muitos usuários
- [ ] Busca e filtros
- [ ] Upload de foto do usuário
- [ ] Validação de email único
- [ ] Logs de auditoria
- [ ] Exportar lista (CSV/PDF)

## 🔍 **Debugging**

### **Logs importantes:**
- Servidor inicia na porta 3000
- Requests são logados via Morgan
- Erros aparecem no console

### **Problemas comuns:**
- Porta 3000 já em uso: parar outros processos node
- Views não encontradas: verificar estrutura de pastas
- Dados perdidos: implementar persistência em banco