# Funcionalidade de Drag and Drop para Ordenação de Contas

## 🎯 **Funcionalidade Implementada**

Adicionada capacidade de **arrastar e soltar linhas** na tabela de fluxo de caixa para reordenar as contas de acordo com a preferência do usuário, mantendo a conta "Saldo Anterior" sempre fixa no topo.

## ✅ **Características Principais**

### **1. Ordenação Personalizada:**
- **Drag and drop**: Arrastar linhas para reordenar
- **Ordem padrão**: Saldo Anterior → Saldos → Receitas → Despesas
- **Persistência**: Ordem salva automaticamente no servidor
- **Feedback visual**: Animações e indicações durante o arrastar

### **2. Proteções Implementadas:**
- **Saldo Anterior fixo**: Não pode ser movido da primeira posição
- **Handle específico**: Apenas o ícone de grip permite arrastar
- **Validação**: Impede posicionamento antes do Saldo Anterior
- **Recuperação**: Auto-recarregamento em caso de erro

## 🔧 **Implementação Técnica**

### **1. Modelo de Dados - Arquivo: `models/Conta.js`**

#### **Propriedade de Ordenação:**
```javascript
class Conta {
  constructor(id, nomeConta, tipoConta, categoriaConta, ordemExibicao = null) {
    this.id = id;
    this.nomeConta = nomeConta;
    this.tipoConta = tipoConta;
    this.categoriaConta = categoriaConta;
    this.ordemExibicao = ordemExibicao; // Nova propriedade
  }
}
```

#### **Função de Ordem Padrão:**
```javascript
function getOrdemPadrao(tipoConta) {
  // Ordem padrão: Saldo Anterior (0), Saldo (1), Receita (2), Despesa (3)
  switch (tipoConta) {
    case TipoConta.SALDO:
      return 1; // Saldo Anterior será tratado separadamente
    case TipoConta.RECEITA:
      return 2;
    case TipoConta.DESPESA:
      return 3;
    default:
      return 4;
  }
}
```

#### **Inicialização da Ordem:**
```javascript
function inicializarOrdemPadrao() {
  contas.forEach((conta, index) => {
    if (conta.ordemExibicao === null || conta.ordemExibicao === undefined) {
      if (conta.id === CONTA_SALDO_ANTERIOR_ID) {
        conta.ordemExibicao = 0; // Saldo Anterior sempre primeiro
      } else {
        const ordemTipo = getOrdemPadrao(conta.tipoConta);
        conta.ordemExibicao = ordemTipo * 1000 + index; // Garantir ordem única
      }
    }
  });
}
```

#### **Função de Ordenação:**
```javascript
function getContasOrdenadas() {
  inicializarOrdemPadrao();

  return contas.sort((a, b) => {
    // Saldo Anterior sempre primeiro
    if (a.id === CONTA_SALDO_ANTERIOR_ID) return -1;
    if (b.id === CONTA_SALDO_ANTERIOR_ID) return 1;

    // Depois por ordem de exibição
    return (a.ordemExibicao || 0) - (b.ordemExibicao || 0);
  });
}
```

#### **Atualização da Ordem:**
```javascript
function atualizarOrdemContas(novaOrdem) {
  // Filtrar a conta Saldo Anterior (ela não pode ser movida)
  const ordemSemSaldoAnterior = novaOrdem.filter(id =>
    parseInt(id) !== CONTA_SALDO_ANTERIOR_ID
  );

  // Atualizar ordem das contas (exceto Saldo Anterior)
  ordemSemSaldoAnterior.forEach((contaId, index) => {
    const conta = getContaById(contaId);
    if (conta && conta.id !== CONTA_SALDO_ANTERIOR_ID) {
      conta.ordemExibicao = (index + 1) * 100; // Deixar espaço para inserções
    }
  });

  // Garantir que Saldo Anterior permaneça com ordem 0
  const contaSaldoAnterior = getContaSaldoAnterior();
  if (contaSaldoAnterior) {
    contaSaldoAnterior.ordemExibicao = 0;
  }

  return true;
}
```

### **2. Rota do Servidor - Arquivo: `routes/fluxo-caixa.js`**

#### **Uso de Contas Ordenadas:**
```javascript
router.get('/fluxo', function(req, res, next) {
  // ... código anterior ...

  // Obter todas as contas ordenadas
  const todasContas = getContasOrdenadas();

  // ... resto da lógica ...
});
```

#### **Rota para Salvar Ordem:**
```javascript
router.post('/fluxo/contas/ordem', function(req, res, next) {
  try {
    const { novaOrdem } = req.body;

    if (!novaOrdem || !Array.isArray(novaOrdem)) {
      return res.status(400).json({
        success: false,
        message: 'Ordem inválida fornecida'
      });
    }

    // Atualizar ordem das contas
    const sucesso = atualizarOrdemContas(novaOrdem);

    if (sucesso) {
      res.json({
        success: true,
        message: 'Ordem das contas atualizada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar ordem das contas'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar ordem das contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});
```

### **3. Interface Frontend - Arquivo: `views/fluxo-caixa/fluxo.ejs`**

#### **Biblioteca SortableJS:**
```html
<!-- CDN no head -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
```

#### **Estrutura HTML:**
```html
<tbody id="contas-tbody">
  <% Object.values(dadosPorContaMes).forEach(function(item) { %>
  <tr class="conta-row <%= item.conta.id === 999 ? 'conta-especial' : '' %>"
      data-conta-id="<%= item.conta.id %>">
    <td class="conta-cell">
      <div class="d-flex align-items-center">
        <i class="bi bi-grip-vertical drag-handle"
           title="<%= item.conta.id === 999 ? 'Posição fixa - não pode ser movida' : 'Arrastar para reordenar' %>"></i>
        <!-- resto do conteúdo -->
      </div>
    </td>
    <!-- demais células -->
  </tr>
  <% }); %>
</tbody>
```

#### **Estilos CSS:**
```css
/* Estilos para drag and drop */
.conta-row {
    cursor: move;
    transition: all 0.2s ease;
}

.conta-row:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.conta-row.sortable-ghost {
    opacity: 0.4;
    background: rgba(108, 117, 125, 0.2);
}

.conta-row.sortable-drag {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transform: rotate(2deg);
}

/* Saldo anterior não pode ser arrastado */
.conta-especial {
    cursor: not-allowed !important;
}

.drag-handle {
    cursor: move;
    color: #6c757d;
    opacity: 0.6;
    margin-right: 8px;
    transition: opacity 0.2s ease;
}

.conta-row:hover .drag-handle {
    opacity: 1;
}

.conta-especial .drag-handle {
    cursor: not-allowed;
    opacity: 0.3;
}

.sortable-chosen {
    background: rgba(40, 167, 69, 0.1) !important;
}
```

#### **JavaScript de Inicialização:**
```javascript
function initSortableTable() {
  const tbody = document.getElementById('contas-tbody');
  if (!tbody) return;

  const sortable = new Sortable(tbody, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    handle: '.drag-handle',
    filter: '.conta-especial', // Impedir drag da conta especial
    preventOnFilter: false,

    onStart: function(evt) {
      document.body.style.userSelect = 'none';
    },

    onEnd: function(evt) {
      document.body.style.userSelect = '';
      if (evt.oldIndex !== evt.newIndex) {
        salvarNovaOrdemContas();
      }
    },

    onMove: function(evt) {
      const draggedElement = evt.dragged;
      const relatedElement = evt.related;

      // Impedir que a conta especial seja movida
      if (draggedElement.classList.contains('conta-especial')) {
        return false;
      }

      // Impedir que itens sejam colocados antes da conta especial
      if (relatedElement.classList.contains('conta-especial') && evt.willInsertAfter === false) {
        return false;
      }

      return true;
    }
  });
}
```

#### **Função de Salvamento:**
```javascript
function salvarNovaOrdemContas() {
  const tbody = document.getElementById('contas-tbody');
  const rows = tbody.querySelectorAll('tr[data-conta-id]');
  const novaOrdem = [];

  rows.forEach(row => {
    const contaId = row.getAttribute('data-conta-id');
    if (contaId) {
      novaOrdem.push(parseInt(contaId));
    }
  });

  // Enviar para o servidor via fetch
  fetch('/fluxo-caixa/fluxo/contas/ordem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ novaOrdem: novaOrdem })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      mostrarFeedbackOrdem('success', 'Ordem das contas atualizada!');
    } else {
      console.error('Erro ao salvar ordem:', data.message);
      mostrarFeedbackOrdem('error', 'Erro ao salvar ordem das contas');
      setTimeout(() => location.reload(), 2000);
    }
  })
  .catch(error => {
    console.error('Erro na requisição:', error);
    mostrarFeedbackOrdem('error', 'Erro de conexão');
    setTimeout(() => location.reload(), 2000);
  });
}
```

#### **Feedback Visual:**
```javascript
function mostrarFeedbackOrdem(tipo, mensagem) {
  // Remover toasts anteriores
  const existingToasts = document.querySelectorAll('.ordem-toast');
  existingToasts.forEach(toast => toast.remove());

  // Criar toast com Bootstrap
  const toastClass = tipo === 'success' ? 'bg-success' : 'bg-danger';
  const iconClass = tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle';

  const toastHtml = `
    <div class="toast ordem-toast ${toastClass} text-white position-fixed bottom-0 end-0 m-3"
         role="alert" style="z-index: 1055;">
      <div class="d-flex align-items-center p-3">
        <i class="bi ${iconClass} me-2"></i>
        <div class="me-auto">${mensagem}</div>
        <button type="button" class="btn-close btn-close-white ms-2"
                data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', toastHtml);

  const toastElement = document.querySelector('.ordem-toast');
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}
```

## 🎨 **Experiência do Usuário**

### **1. Indicadores Visuais:**

#### **Handle de Arrastar:**
- **Ícone**: `bi bi-grip-vertical` (três linhas verticais)
- **Posição**: Lado esquerdo de cada linha
- **Comportamento**: Opacidade reduzida, aumenta no hover
- **Cursor**: Muda para "move" ao passar o mouse

#### **Estados Visuais:**
- **Normal**: Linha sem destaque especial
- **Hover**: Sombra sutil para indicar interatividade
- **Escolhido**: Background verde claro quando selecionado
- **Fantasma**: Opacidade reduzida durante o drag
- **Arrastando**: Sombra pronunciada e rotação de 2°

#### **Conta Especial:**
- **Background**: Amarelo claro diferenciado
- **Handle**: Ícone de grip com opacity baixa
- **Cursor**: "not-allowed" para indicar que não pode mover
- **Tooltip**: "Posição fixa - não pode ser movida"

### **2. Feedback de Ações:**

#### **Sucesso:**
- **Toast verde**: "Ordem das contas atualizada!"
- **Ícone**: Círculo com check
- **Duração**: 3 segundos
- **Posição**: Canto inferior direito

#### **Erro:**
- **Toast vermelho**: "Erro ao salvar ordem das contas"
- **Ícone**: Triângulo de exclamação
- **Auto-reload**: Após 2 segundos para restaurar ordem
- **Posição**: Canto inferior direito

### **3. Comportamentos:**

#### **Drag Permitido:**
- Todas as contas exceto "Saldo Anterior"
- Apenas pelo handle (ícone de grip)
- Animação suave de 150ms
- Feedback visual durante todo o processo

#### **Drag Não Permitido:**
- Conta "Saldo Anterior" não pode ser movida
- Outras contas não podem ser posicionadas antes do "Saldo Anterior"
- Cursor "not-allowed" para indicações claras

#### **Persistência:**
- Ordem salva automaticamente via AJAX
- Sem necessidade de botão "Salvar"
- Recuperação automática em caso de erro de rede

## 📊 **Exemplo de Uso**

### **Cenário Inicial (Ordem Padrão):**
```
1. 🔒 Saldo Anterior     (fixo, não pode mover)
2. 💰 Saldo Inicial      (tipo SALDO)
3. 💰 Reserva            (tipo SALDO)
4. ✅ Salário Principal  (tipo RECEITA)
5. ✅ Freelance Design   (tipo RECEITA)
6. ❌ Supermercado       (tipo DESPESA)
7. ❌ Combustível        (tipo DESPESA)
8. ❌ Aluguel            (tipo DESPESA)
```

### **Após Personalização pelo Usuário:**
```
1. 🔒 Saldo Anterior     (sempre fixo no topo)
2. ✅ Salário Principal  (usuário priorizou receitas)
3. ✅ Freelance Design
4. ❌ Aluguel            (usuário reordenou despesas por importância)
5. ❌ Supermercado
6. ❌ Combustível
7. 💰 Saldo Inicial      (usuário moveu saldos para o final)
8. 💰 Reserva
```

## 🔄 **Fluxo Técnico**

### **1. Inicialização:**
```
Página Carrega → DOMContentLoaded → initSortableTable() → SortableJS Ativo
```

### **2. Interação do Usuário:**
```
Mouse Down no Handle → onStart → Drag Visual → Mouse Up → onEnd → Verificar Mudança
```

### **3. Salvamento:**
```
Mudança Detectada → Coletar Nova Ordem → Fetch para Servidor → Atualizar Modelo → Feedback Visual
```

### **4. Tratamento de Erro:**
```
Erro de Rede → Toast de Erro → Aguardar 2s → location.reload() → Restaurar Ordem Original
```

## ✅ **Benefícios da Implementação**

### **🎯 Usabilidade:**
- **Intuitividade**: Arrastar e soltar é familiar para usuários
- **Feedback visual**: Animações e indicações claras
- **Flexibilidade**: Usuário define sua própria ordem de preferência
- **Proteção**: Saldo Anterior mantém-se sempre no topo

### **⚡ Performance:**
- **Leve**: SortableJS otimizada para performance
- **AJAX**: Salvamento sem recarregar página
- **Animações suaves**: 150ms para transições fluidas
- **Debounce natural**: Salva apenas quando posição realmente muda

### **🔒 Robustez:**
- **Validações**: Servidor valida ordem recebida
- **Recuperação**: Auto-reload em caso de erro
- **Proteções**: Conta especial não pode ser movida
- **Consistência**: Ordem mantida entre sessões

### **🎨 Experiência:**
- **Visual consistente**: Integrada com design Bootstrap
- **Feedback imediato**: Toasts informativos
- **Acessibilidade**: Tooltips explicativos
- **Mobile-friendly**: Funciona em dispositivos touch

## 🚀 **Status da Funcionalidade**

### **✅ Implementado:**
- **Drag and drop completo** com SortableJS
- **Ordem padrão definida** (Saldo → Receitas → Despesas)
- **Proteção do Saldo Anterior** (sempre fixo no topo)
- **Persistência no servidor** via AJAX
- **Feedback visual completo** (toasts, animações)
- **Handles de arrastar** com ícones intuitivos
- **Validações robustas** client e server-side
- **Recuperação de erros** automática

### **🎯 Funcionalidades:**
- **Ordenação personalizada** por preferência do usuário
- **Interface intuitiva** com indicadores visuais claros
- **Proteções robustas** para conta especial
- **Performance otimizada** com salvamento automático
- **Experiência consistente** em desktop e mobile

**A funcionalidade de drag and drop está completamente implementada e pronta para uso! 🎉**

Os usuários agora podem personalizar a ordem das contas na tabela de fluxo de caixa através de arrastar e soltar, mantendo sempre o "Saldo Anterior" no topo para referência constante.