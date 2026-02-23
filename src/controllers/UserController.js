/**
 * Controller de Usuários
 * Gerencia todas as operações relacionadas aos usuários do sistema
 */

const UserService = require('../services/UserService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

// Logger melhorado para operações de usuário
const logger = {
  info: (message, meta) => console.log(`[INFO] ${new Date().toISOString()} ${message}`, meta ? JSON.stringify(meta, null, 2) : ''),
  error: (message, error) => console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error || ''),
  warn: (message, meta) => console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta || ''),
  debug: (message, meta) => console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, meta || ''),
  userOperation: (operation, userId, data = {}) => {
    console.log(`[USER] ${new Date().toISOString()} 👤 ${operation}`, { userId, ...data });
  },
  validationError: (field, value, rule, url) => {
    console.warn(`[VALIDATION] ${new Date().toISOString()} ⚠️ ${field} failed ${rule}`, { value, url });
  },
  fileUpload: (filename, size, mimetype, userId) => {
    console.log(`[UPLOAD] ${new Date().toISOString()} 📤 File uploaded`, { filename, size, mimetype, userId });
  }
};

class UserController {
  /**
   * Listar todos os usuários
   */
  async getUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      const stats = await UserService.getUserStats();

      res.render('users/index', {
        title: 'Lista de Usuários',
        users,
        stats,
        message: req.query.message || null,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      logger.error('Erro ao listar usuários', error);
      next(error);
    }
  }

  /**
   * Exibir formulário para novo usuário
   */
  async getCreateUserForm(req, res, next) {
    try {
      res.render('users/add', {
        title: 'Adicionar Usuário',
        errors: null,
        formData: null,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(req, res, next) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('users/add', {
          title: 'Adicionar Usuário',
          errors: errors.array(),
          formData: req.body,
          success: null,
          error: null
        });
      }

      // Criar usuário
      const newUser = await UserService.createUser(req.body, req.file);

      logger.userOperation('CREATE', newUser.id, {
        email: newUser.email,
        nome: newUser.nome,
        hasPhoto: !!newUser.foto,
        source: 'web-form'
      });
      req.flash('success', 'Usuário adicionado com sucesso!');
      res.redirect('/users');
    } catch (error) {
      if (error instanceof AppError) {
        return res.render('users/add', {
          title: 'Adicionar Usuário',
          errors: [{ msg: error.message }],
          formData: req.body,
          success: null,
          error: null
        });
      }
      next(error);
    }
  }

  /**
   * Visualizar detalhes de um usuário
   */
  async getUserDetails(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);

      res.render('users/view', {
        title: 'Detalhes do Usuário',
        user,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        return res.status(404).render('error', {
          message: 'Usuário não encontrado',
          error: { status: 404 }
        });
      }
      next(error);
    }
  }

  /**
   * Exibir formulário para editar usuário
   */
  async getEditUserForm(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);

      res.render('users/edit', {
        title: 'Editar Usuário',
        user,
        errors: null,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        return res.status(404).render('error', {
          message: 'Usuário não encontrado',
          error: { status: 404 }
        });
      }
      next(error);
    }
  }

  /**
   * Atualizar usuário existente
   */
  async updateUser(req, res, next) {
    try {
      const userId = req.params.id;
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const user = await UserService.getUserById(userId);
        return res.render('users/edit', {
          title: 'Editar Usuário',
          user,
          errors: errors.array(),
          success: null,
          error: null
        });
      }

      // Atualizar usuário
      await UserService.updateUser(userId, req.body, req.file);

      logger.userOperation('UPDATE', userId, {
        fields: Object.keys(req.body),
        hasNewPhoto: !!req.file,
        source: 'web-form'
      });
      req.flash('success', 'Usuário atualizado com sucesso!');

      res.redirect('/users');
    } catch (error) {
      if (error instanceof AppError) {

        try {
          const user = await UserService.getUserById(req.params.id);
          return res.render('users/edit', {
            title: 'Editar Usuário',
            user,
            errors: [{ msg: error.message }],
            success: null,
            error: null
          });
        } catch {
          req.flash('error', error.message);
          return res.redirect('/users');
        }
      }
      next(error);
    }
  }

  /**
   * Remover usuário
   */
  async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await UserService.deleteUser(userId);

      logger.userOperation('DELETE', userId, {
        email: user.email,
        nome: user.nome,
        hadPhoto: !!user.foto,
        source: 'web-form'
      });
      req.flash('success', 'Usuário removido com sucesso!');
      res.redirect('/users');
    } catch (error) {
      if (error instanceof AppError) {
        req.flash('error', error.message);
        return res.redirect('/users');
      }
      next(error);
    }
  }

  /**
   * Buscar usuários
   */
  async searchUsers(req, res, next) {
    try {
      const { search } = req.query;

      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', 'Termo de busca inválido');
        return res.redirect('/users');
      }

      const users = await UserService.searchUsers(search);
      const stats = await UserService.getUserStats();

      res.render('users/index', {
        title: search ? `Resultados para: "${search}"` : 'Lista de Usuários',
        users,
        stats,
        searchTerm: search || '',
        message: users.length === 0 ? 'Nenhum usuário encontrado' : null,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      logger.error('💥 Erro na busca de usuários', {
        searchTerm: req.query.search,
        error: error.message,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      next(error);
    }
  }

  /**
   * Obter estatísticas dos usuários (API endpoint)
   */
  async getUserStatsAPI(req, res, next) {
    try {
      const stats = await UserService.getUserStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verificar se usuário existe (API endpoint)
   */
  async checkUserExists(req, res, next) {
    try {
      const userId = req.params.id;
      const exists = await UserService.userExists(userId);

      res.json({
        success: true,
        exists
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar usuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Listar usuários (API endpoint)
   */
  async getUsersAPI(req, res, next) {
    try {
      const { search, limit = 50, offset = 0 } = req.query;

      let users;
      if (search) {
        users = await UserService.searchUsers(search);
      } else {
        users = await UserService.getAllUsers();
      }

      // Aplicar paginação
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = users.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedUsers,
        total: users.length,
        offset: parseInt(offset),
        limit: parseInt(limit)
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UserController();