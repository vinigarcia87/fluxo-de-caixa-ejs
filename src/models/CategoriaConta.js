// Classe CategoriaConta
class CategoriaConta {
  constructor(id, categoria) {
    this.id = id;
    this.categoria = categoria;
  }

  // Método para validar se a categoria está preenchida
  isValid() {
    return this.categoria && this.categoria.trim() !== '';
  }

  // Método toString para facilitar exibição
  toString() {
    return this.categoria;
  }

  // Método para criar uma nova instância a partir de dados do formulário
  static fromFormData(formData) {
    return new CategoriaConta(
      formData.id || null,
      formData.categoria || ''
    );
  }

  // Método para converter para objeto simples (para JSON)
  toJSON() {
    return {
      id: this.id,
      categoria: this.categoria
    };
  }
}

// Array temporário para armazenar categorias (simula banco de dados)
let categorias = [
  new CategoriaConta(1, 'Alimentação'),
  new CategoriaConta(2, 'Transporte'),
  new CategoriaConta(3, 'Saúde'),
  new CategoriaConta(4, 'Educação'),
  new CategoriaConta(5, 'Entretenimento'),
  new CategoriaConta(6, 'Moradia'),
  new CategoriaConta(7, 'Salário'),
  new CategoriaConta(8, 'Freelances'),
  new CategoriaConta(9, 'Investimentos'),
  new CategoriaConta(10, 'Outros'),
  new CategoriaConta(11, 'Saldo') // Categoria especial para conta de saldo
];

// Contador para IDs únicos
let nextCategoriaId = 12;

// Funções para manipulação das categorias
function getAllCategorias() {
  return categorias;
}

function getCategoriaById(id) {
  return categorias.find(c => c.id === parseInt(id));
}

function addCategoria(categoria) {
  if (categoria instanceof CategoriaConta) {
    categoria.id = nextCategoriaId++;
    categorias.push(categoria);
    return categoria;
  }
  throw new Error('Objeto deve ser uma instância de CategoriaConta');
}

function updateCategoria(id, novaCategoria) {
  const index = categorias.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    categorias[index].categoria = novaCategoria.categoria;
    return categorias[index];
  }
  return null;
}

function deleteCategoria(id) {
  const index = categorias.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    return categorias.splice(index, 1)[0];
  }
  return null;
}

function categoriaExists(categoria, excludeId = null) {
  return categorias.some(c =>
    c.categoria.toLowerCase() === categoria.toLowerCase() &&
    c.id !== excludeId
  );
}

// Exportações ES modules
export {
  CategoriaConta,
  getAllCategorias,
  getCategoriaById,
  addCategoria,
  updateCategoria,
  deleteCategoria,
  categoriaExists
};

export default CategoriaConta;