import {
  Conta,
  getAllContas,
  getContaById,
  getContasByTipo,
  addConta,
  updateConta,
  deleteConta,
  contaExists,
  getContasEditaveis,
  getContasParaModal,
  getContasOrdenadas,
  atualizarOrdemContas,
  reorganizarContasPorCategoria,
  definirOrdemPorCategoria,
  isContaSaldoAnterior,
  CONTA_SALDO_ANTERIOR_ID
} from '../models/Conta.js';

import {
  CategoriaConta,
  getAllCategorias,
  getCategoriaById,
  addCategoria,
  updateCategoria,
  deleteCategoria,
  categoriaExists
} from '../models/CategoriaConta.js';

import {
  TipoConta,
  getTiposContaArray,
  getDescricaoTipoConta,
  getCorTipoConta,
  getIconeTipoConta
} from '../models/TipoConta.js';

import { getContaValoresByConta } from '../models/ContaValor.js';

import { AppError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

class ContaService {
  /**
   * Obter todas as contas
   */
  async getAllContas() {
    try {
      return getAllContas();
    } catch (error) {
      logger.error('Erro ao obter todas as contas', error);
      throw new AppError('Erro ao carregar contas', 500);
    }
  }

  /**
   * Obter conta por ID
   */
  async getContaById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new AppError('ID da conta inválido', 400);
      }

      const conta = getContaById(id);
      if (!conta) {
        throw new AppError('Conta não encontrada', 404);
      }

      return conta;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao obter conta por ID', error);
      throw new AppError('Erro ao carregar conta', 500);
    }
  }

  /**
   * Obter contas por tipo
   */
  async getContasByTipo(tipo) {
    try {
      if (!getTiposContaArray().includes(tipo)) {
        throw new AppError('Tipo de conta inválido', 400);
      }

      return getContasByTipo(tipo);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao obter contas por tipo', error);
      throw new AppError('Erro ao filtrar contas', 500);
    }
  }

  /**
   * Criar nova conta
   */
  async criarConta(dados) {
    try {
      this._validarDadosConta(dados);

      // Verificar se conta já existe
      if (contaExists(dados.nomeConta.trim())) {
        throw new AppError('Já existe uma conta com este nome', 409);
      }

      // Verificar se categoria existe
      const categoria = getCategoriaById(dados.categoriaId);
      if (!categoria) {
        throw new AppError('Categoria não encontrada', 404);
      }

      const novaConta = Conta.fromFormData(dados);
      const contaSalva = addConta(novaConta);

      logger.info(`Conta criada: ${contaSalva.nomeConta} (ID: ${contaSalva.id})`);
      return contaSalva;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao criar conta', error);
      throw new AppError('Erro ao criar conta', 500);
    }
  }

  /**
   * Atualizar conta
   */
  async atualizarConta(id, dados) {
    try {
      const contaExistente = await this.getContaById(id);
      this._validarDadosConta(dados);

      // Verificar se nome já existe (exceto a própria conta)
      if (dados.nomeConta.trim() !== contaExistente.nomeConta &&
          contaExists(dados.nomeConta.trim())) {
        throw new AppError('Já existe uma conta com este nome', 409);
      }

      const categoria = getCategoriaById(dados.categoriaId);
      if (!categoria) {
        throw new AppError('Categoria não encontrada', 404);
      }

      const contaAtualizada = Conta.fromFormData({ ...dados, id });
      const resultado = updateConta(id, contaAtualizada);

      if (!resultado) {
        throw new AppError('Erro ao atualizar conta', 500);
      }

      logger.info(`Conta atualizada: ${contaAtualizada.nomeConta} (ID: ${id})`);
      return resultado;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao atualizar conta', error);
      throw new AppError('Erro ao atualizar conta', 500);
    }
  }

  /**
   * Deletar conta
   */
  async deletarConta(id) {
    try {
      const conta = await this.getContaById(id);

      // Impedir exclusão da conta especial
      if (isContaSaldoAnterior(id)) {
        throw new AppError('Não é possível remover a conta especial de Saldo Anterior', 400);
      }

      // Verificar se existem movimentações para esta conta
      const movimentacoes = getContaValoresByConta(id);
      if (movimentacoes.length > 0) {
        throw new AppError('Não é possível remover conta com movimentações', 400);
      }

      const resultado = deleteConta(id);
      if (!resultado) {
        throw new AppError('Erro ao remover conta', 500);
      }

      logger.info(`Conta removida: ${conta.nomeConta} (ID: ${id})`);
      return resultado;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao deletar conta', error);
      throw new AppError('Erro ao remover conta', 500);
    }
  }

  /**
   * Obter contas editáveis
   */
  async getContasEditaveis() {
    try {
      return getContasEditaveis();
    } catch (error) {
      logger.error('Erro ao obter contas editáveis', error);
      throw new AppError('Erro ao carregar contas editáveis', 500);
    }
  }

  /**
   * Obter contas ordenadas
   */
  async getContasOrdenadas() {
    try {
      return getContasOrdenadas();
    } catch (error) {
      logger.error('Erro ao obter contas ordenadas', error);
      throw new AppError('Erro ao carregar contas ordenadas', 500);
    }
  }

  /**
   * Reorganizar contas por categoria
   */
  async reorganizarContasPorCategoria() {
    try {
      return reorganizarContasPorCategoria();
    } catch (error) {
      logger.error('Erro ao reorganizar contas', error);
      throw new AppError('Erro ao reorganizar contas', 500);
    }
  }

  /**
   * Atualizar ordem das contas
   */
  async atualizarOrdemContas(novaOrdem) {
    try {
      if (!Array.isArray(novaOrdem) || novaOrdem.length === 0) {
        throw new AppError('Nova ordem deve ser um array não vazio', 400);
      }

      const sucesso = atualizarOrdemContas(novaOrdem);
      if (!sucesso) {
        throw new AppError('Erro ao atualizar ordem das contas', 500);
      }

      logger.info('Ordem das contas atualizada');
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao atualizar ordem das contas', error);
      throw new AppError('Erro ao atualizar ordem das contas', 500);
    }
  }

  /**
   * Verificar se é conta de saldo anterior
   */
  isContaSaldoAnterior(contaId) {
    return isContaSaldoAnterior(contaId);
  }

  /**
   * Obter todas as categorias
   */
  async getAllCategorias() {
    try {
      return getAllCategorias();
    } catch (error) {
      logger.error('Erro ao obter categorias', error);
      throw new AppError('Erro ao carregar categorias', 500);
    }
  }

  /**
   * Criar nova categoria
   */
  async criarCategoria(dados) {
    try {
      if (!dados.categoria || dados.categoria.trim().length < 2) {
        throw new AppError('Nome da categoria deve ter pelo menos 2 caracteres', 400);
      }

      if (categoriaExists(dados.categoria.trim())) {
        throw new AppError('Já existe uma categoria com este nome', 409);
      }

      const novaCategoria = new CategoriaConta(null, dados.categoria.trim());
      const categoriaSalva = addCategoria(novaCategoria);

      logger.info(`Categoria criada: ${categoriaSalva.categoria} (ID: ${categoriaSalva.id})`);
      return categoriaSalva;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erro ao criar categoria', error);
      throw new AppError('Erro ao criar categoria', 500);
    }
  }

  /**
   * Obter tipos de conta disponíveis
   */
  getTiposContaArray() {
    return getTiposContaArray();
  }

  /**
   * Obter descrição do tipo de conta
   */
  getDescricaoTipoConta(tipo) {
    return getDescricaoTipoConta(tipo);
  }

  /**
   * Obter cor do tipo de conta
   */
  getCorTipoConta(tipo) {
    return getCorTipoConta(tipo);
  }

  /**
   * Obter ícone do tipo de conta
   */
  getIconeTipoConta(tipo) {
    return getIconeTipoConta(tipo);
  }

  /**
   * Validar dados da conta
   * @private
   */
  _validarDadosConta(dados) {
    const erros = [];

    if (!dados.nomeConta || dados.nomeConta.trim() === '') {
      erros.push('Nome da conta é obrigatório');
    }

    if (!dados.tipoConta || !getTiposContaArray().includes(dados.tipoConta)) {
      erros.push('Tipo de conta inválido');
    }

    if (!dados.categoriaId) {
      erros.push('Categoria é obrigatória');
    }

    if (erros.length > 0) {
      throw new AppError(erros.join(', '), 400);
    }
  }
}

// Exportação ES modules
const contaService = new ContaService();
export default contaService;