var express = require('express');
var router = express.Router();
var multer = require('multer');
var sharp = require('sharp');
var path = require('path');
var fs = require('fs');

// Configuração do Multer para upload de imagens
const storage = multer.memoryStorage(); // Armazena em memória para processamento
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  }
});

// Array temporário para armazenar usuários (simula banco de dados)
var users = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-09',
    foto: null
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 88888-8888',
    cpf: '458.446.810-96',
    foto: null
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro@email.com',
    telefone: '(11) 77777-7777',
    cpf: '659.413.770-02',
    foto: null
  }
];

// Contador para IDs únicos
var nextId = 4;

// Validação de CPF
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se o CPF tem 11 dígitos e se todos os dígitos são iguais (ex: 111.111.111-11)
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

// Função para formatar CPF
function formatarCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) {
    return cpf; // retorna sem formatar se não tiver 11 dígitos
  }
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para processar e salvar imagem
async function processarImagem(buffer, userId) {
  try {
    const filename = `user-${userId}-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '../public/uploads/users', filename);

    // Redimensiona e processa a imagem
    await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 90,
        progressive: true
      })
      .toFile(filepath);

    return filename;
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    throw error;
  }
}

/* GET users listing - Listar todos os usuários */
router.get('/', function(req, res, next) {
  res.render('users/index', {
    title: 'Lista de Usuários',
    users: users,
    message: req.query.message || null
  });
});

/* GET form para adicionar usuário */
router.get('/add', function(req, res, next) {
  res.render('users/add', {
    title: 'Adicionar Usuário',
    errors: null
  });
});

/* POST - Adicionar novo usuário */
router.post('/add', upload.single('foto'), async function(req, res, next) {
  try {
    const { nome, email, telefone, cpf } = req.body;

    // Validação simples
    const errors = [];
    if (!nome || nome.trim() === '') errors.push('Nome é obrigatório');
    if (!email || email.trim() === '') errors.push('Email é obrigatório');
    if (!telefone || telefone.trim() === '') errors.push('Telefone é obrigatório');
    if (!cpf || cpf.trim() === '') errors.push('CPF é obrigatório');

    // Validação específica do CPF
    if (cpf && !validarCPF(cpf)) {
      errors.push('CPF inválido');
    }

    // Verifica se CPF já existe
    if (cpf) {
      const cpfFormatado = formatarCPF(cpf);
      if (users.some(u => u.cpf === cpfFormatado)) {
        errors.push('CPF já cadastrado');
      }
    }

    // Verifica se email já existe
    if (email && users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      errors.push('Email já cadastrado');
    }

    // Se há erros, mostra o formulário novamente
    if (errors.length > 0) {
      return res.render('users/add', {
        title: 'Adicionar Usuário',
        errors: errors,
        formData: { nome, email, telefone, cpf }
      });
    }

    // Cria novo usuário
    const newUser = {
      id: nextId++,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      cpf: formatarCPF(cpf.trim()),
      foto: null
    };

    // Processa a foto se foi enviada
    if (req.file) {
      try {
        newUser.foto = await processarImagem(req.file.buffer, newUser.id);
      } catch (error) {
        console.error('Erro ao processar foto:', error);
        errors.push('Erro ao processar a foto. Tente novamente.');
        return res.render('users/add', {
          title: 'Adicionar Usuário',
          errors: errors,
          formData: { nome, email, telefone, cpf }
        });
      }
    }

    // Adiciona à lista
    users.push(newUser);

    // Redireciona para lista com mensagem de sucesso
    res.redirect('/users?message=' + encodeURIComponent('Usuário adicionado com sucesso!'));
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    res.render('users/add', {
      title: 'Adicionar Usuário',
      errors: ['Erro interno do servidor. Tente novamente.'],
      formData: req.body
    });
  }
});

/* GET - Visualizar detalhes de um usuário */
router.get('/:id', function(req, res, next) {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).render('error', {
      message: 'Usuário não encontrado',
      error: { status: 404 }
    });
  }

  res.render('users/view', {
    title: 'Detalhes do Usuário',
    user: user
  });
});

/* GET - Formulário para editar usuário */
router.get('/:id/edit', function(req, res, next) {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).render('error', {
      message: 'Usuário não encontrado',
      error: { status: 404 }
    });
  }

  res.render('users/edit', {
    title: 'Editar Usuário',
    user: user,
    errors: null
  });
});

/* POST - Atualizar usuário */
router.post('/:id/edit', upload.single('foto'), async function(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).render('error', {
        message: 'Usuário não encontrado',
        error: { status: 404 }
      });
    }

    const { nome, email, telefone, cpf } = req.body;
    const currentUser = users[userIndex];

    // Validação
    const errors = [];
    if (!nome || nome.trim() === '') errors.push('Nome é obrigatório');
    if (!email || email.trim() === '') errors.push('Email é obrigatório');
    if (!telefone || telefone.trim() === '') errors.push('Telefone é obrigatório');
    if (!cpf || cpf.trim() === '') errors.push('CPF é obrigatório');

    if (cpf && !validarCPF(cpf)) {
      errors.push('CPF inválido');
    }

    // Verifica se CPF já existe (exceto o próprio usuário)
    if (cpf) {
      const cpfFormatado = formatarCPF(cpf);
      if (users.some(u => u.id !== userId && u.cpf === cpfFormatado)) {
        errors.push('CPF já cadastrado');
      }
    }

    // Verifica se email já existe (exceto o próprio usuário)
    if (email && users.some(u => u.id !== userId && u.email.toLowerCase() === email.toLowerCase())) {
      errors.push('Email já cadastrado');
    }

    if (errors.length > 0) {
      return res.render('users/edit', {
        title: 'Editar Usuário',
        user: currentUser,
        errors: errors
      });
    }

    // Atualiza dados do usuário
    users[userIndex].nome = nome.trim();
    users[userIndex].email = email.trim();
    users[userIndex].telefone = telefone.trim();
    users[userIndex].cpf = formatarCPF(cpf.trim());

    // Processa nova foto se foi enviada
    if (req.file) {
      try {
        // Remove foto antiga se existe
        if (currentUser.foto) {
          const oldPhotoPath = path.join(__dirname, '../public/uploads/users', currentUser.foto);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }

        users[userIndex].foto = await processarImagem(req.file.buffer, userId);
      } catch (error) {
        console.error('Erro ao processar nova foto:', error);
        errors.push('Erro ao processar a nova foto. Dados salvos, mas foto não foi atualizada.');
      }
    }

    res.redirect('/users?message=' + encodeURIComponent('Usuário atualizado com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).render('error', {
      message: 'Erro interno do servidor',
      error: { status: 500 }
    });
  }
});

/* DELETE - Remover usuário */
router.post('/:id/delete', function(req, res, next) {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.redirect('/users?message=' + encodeURIComponent('Usuário não encontrado!'));
  }

  // Remove foto se existe
  const user = users[userIndex];
  if (user.foto) {
    const photoPath = path.join(__dirname, '../public/uploads/users', user.foto);
    if (fs.existsSync(photoPath)) {
      try {
        fs.unlinkSync(photoPath);
      } catch (error) {
        console.error('Erro ao remover foto:', error);
      }
    }
  }

  users.splice(userIndex, 1);
  res.redirect('/users?message=' + encodeURIComponent('Usuário removido com sucesso!'));
});

module.exports = router;