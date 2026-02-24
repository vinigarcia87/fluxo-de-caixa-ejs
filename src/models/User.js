/**
 * Modelo de Usuário
 * Gerencia dados e operações relacionadas aos usuários do sistema
 */

// Array temporário para armazenar usuários (simula banco de dados)
let users = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-09',
    foto: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 88888-8888',
    cpf: '458.446.810-96',
    foto: null,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro@email.com',
    telefone: '(11) 77777-7777',
    cpf: '659.413.770-02',
    foto: null,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

// Contador para IDs únicos
let nextId = 4;

/**
 * Classe User para representar um usuário
 */
class User {
  constructor(data) {
    this.id = data.id || null;
    this.nome = data.nome;
    this.email = data.email;
    this.telefone = data.telefone;
    this.cpf = data.cpf;
    this.foto = data.foto || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Criar usuário a partir de dados do formulário
   */
  static fromFormData(formData) {
    return new User({
      nome: formData.nome?.trim(),
      email: formData.email?.trim(),
      telefone: formData.telefone?.trim(),
      cpf: formData.cpf?.trim(),
      foto: formData.foto || null
    });
  }

  /**
   * Validar dados do usuário
   */
  validate() {
    const errors = [];

    if (!this.nome || this.nome.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (!this.email || this.email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (!this.telefone || this.telefone.trim() === '') {
      errors.push('Telefone é obrigatório');
    }

    if (!this.cpf || this.cpf.trim() === '') {
      errors.push('CPF é obrigatório');
    } else if (!this.isValidCPF(this.cpf)) {
      errors.push('CPF inválido');
    }

    return errors;
  }

  /**
   * Validar formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar CPF
   */
  isValidCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se o CPF tem 11 dígitos e se todos os dígitos são iguais
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    // Cálculo do primeiro dígito verificador
    let soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    let resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    // Verifica o primeiro dígito verificador
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    // Cálculo do segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    // Verifica o segundo dígito verificador
    return resto === parseInt(cpf.substring(10, 11));
  }

  /**
   * Formatar CPF para exibição
   */
  static formatCPF(cpf) {
    if (!cpf || typeof cpf !== 'string') {
      return '';
    }

    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) {
      return cpf; // retorna sem formatar se não tiver 11 dígitos
    }
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

/**
 * Funções de acesso aos dados (Data Access Layer)
 */

/**
 * Obter todos os usuários
 */
function getAllUsers() {
  return users.map(userData => new User(userData));
}

/**
 * Obter usuário por ID
 */
function getUserById(id) {
  const userData = users.find(u => u.id === parseInt(id));
  return userData ? new User(userData) : null;
}

/**
 * Verificar se email já existe
 */
function emailExists(email, excludeId = null) {
  return users.some(u =>
    u.email.toLowerCase() === email.toLowerCase() &&
    u.id !== excludeId
  );
}

/**
 * Verificar se CPF já existe
 */
function cpfExists(cpf, excludeId = null) {
  const formattedCPF = User.formatCPF(cpf);
  return users.some(u =>
    u.cpf === formattedCPF &&
    u.id !== excludeId
  );
}

/**
 * Adicionar novo usuário
 */
function addUser(userData) {
  const user = new User({
    ...userData,
    id: nextId++,
    cpf: User.formatCPF(userData.cpf),
    createdAt: new Date(),
    updatedAt: new Date()
  });

  users.push(user);
  return user;
}

/**
 * Atualizar usuário existente
 */
function updateUser(id, userData) {
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    return null;
  }

  const updatedUser = new User({
    ...users[userIndex],
    ...userData,
    id: parseInt(id),
    cpf: User.formatCPF(userData.cpf),
    updatedAt: new Date()
  });

  users[userIndex] = updatedUser;
  return updatedUser;
}

/**
 * Remover usuário
 */
function deleteUser(id) {
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    return null;
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);
  return deletedUser;
}

/**
 * Obter estatísticas dos usuários
 */
function getUserStats() {
  return {
    total: users.length,
    withPhotos: users.filter(u => u.foto).length,
    withoutPhotos: users.filter(u => !u.foto).length,
    recentUsers: users.filter(u => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(u.createdAt) > oneWeekAgo;
    }).length
  };
}

// Exportações ES modules
export {
  User,
  getAllUsers,
  getUserById,
  emailExists,
  cpfExists,
  addUser,
  updateUser,
  deleteUser,
  getUserStats
};

export default User;