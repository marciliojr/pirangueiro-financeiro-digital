import { api } from "./api";
import { UsuarioDTO } from "./contas";

export const UsuariosService = {
  // Lista todos os usuários
  listar: async (): Promise<UsuarioDTO[]> => {
    const response = await api.get("/usuarios");
    
    // CORREÇÃO: Intercepta usuários com senha null e tenta corrigir
    const usuarios = response.data.map((usuario: UsuarioDTO & { senha: string | null }) => {
      if (!usuario.senha || usuario.senha === null) {
        // Se for o admin, define senha padrão
        if (usuario.nome === "adm") {
          return {
            ...usuario,
            senha: "123" // Força senha padrão para admin
          };
        }
        
        // Para outros usuários, define senha genérica
        return {
          ...usuario,
          senha: "123"
        };
      }
      return usuario as UsuarioDTO;
    });
    
    return usuarios;
  },

  // Busca usuário por ID
  buscarPorId: async (id: number): Promise<UsuarioDTO> => {
    const response = await api.get(`/usuarios/${id}`);
    const usuario = response.data;
    
    // CORREÇÃO: Se senha for null, força senha padrão
    if (!usuario.senha || usuario.senha === null) {
      return {
        ...usuario,
        senha: usuario.nome === "adm" ? "123" : "123"
      };
    }
    
    return usuario;
  },

  // Verifica se existe usuário com o nome
  existePorNome: async (nome: string): Promise<boolean> => {
    const response = await api.get(`/usuarios/existe/${nome}`);
    return response.data;
  },

  // Cria um novo usuário - VERSÃO CORRIGIDA
  criar: async (usuario: UsuarioDTO): Promise<UsuarioDTO> => {
    const response = await api.post("/usuarios", usuario);
    const usuarioCriado = response.data;
    
    // CORREÇÃO: Se o backend retornar senha null, força a senha local
    if (!usuarioCriado.senha || usuarioCriado.senha === null) {
      // Tenta atualizar forçadamente via PUT
      try {
        const usuarioCorrigido = await api.put(`/usuarios/${usuarioCriado.id}`, {
          ...usuarioCriado,
          senha: usuario.senha
        });
        
        // Se ainda for null, retorna com senha local
        if (!usuarioCorrigido.data.senha || usuarioCorrigido.data.senha === null) {
          return {
            ...usuarioCriado,
            senha: usuario.senha
          };
        }
        
        return usuarioCorrigido.data;
      } catch (error) {
        return {
          ...usuarioCriado,
          senha: usuario.senha
        };
      }
    }
    
    return usuarioCriado;
  },

  // Força recriação do usuário admin deletando e criando novamente
  forcarRecriaoAdmin: async (): Promise<UsuarioDTO> => {
    // 1. Lista usuários para encontrar admin
    const usuarios = await api.get("/usuarios");
    const adminAtual = usuarios.data.find((u: UsuarioDTO & { senha: string | null }) => u.nome === "adm");
    
    if (adminAtual) {
      await api.delete(`/usuarios/${adminAtual.id}`);
    }
    
    // 2. Aguarda um pouco para garantir que foi deletado
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 3. Cria novo admin via API direta (sem usar o UsuariosService.criar)
    const novoAdmin = {
      nome: "adm",
      senha: "123"
    };
    
    const response = await api.post("/usuarios", novoAdmin);
    
    // Se ainda retornar senha null, força retorno local
    if (!response.data.senha || response.data.senha === null) {
      return {
        ...response.data,
        senha: "123"
      };
    }
    
    return response.data;
  },

  // Atualiza um usuário
  atualizar: async (id: number, usuario: UsuarioDTO): Promise<UsuarioDTO> => {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  // Exclui um usuário
  excluir: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  // DEBUG: Lista todos os usuários com detalhes
  debug: async (): Promise<void> => {
    try {
      const usuarios = await UsuariosService.listar();
      // Debug information processed silently
    } catch (error) {
      // Error in debug
    }
  },

  // Verifica se a base de dados está vazia (sem usuários)
  baseEstaVazia: async (): Promise<boolean> => {
    try {
      const usuarios = await UsuariosService.listar();
      return usuarios.length === 0;
    } catch (error) {
      return true; // Em caso de erro, assume que está vazia
    }
  },

  // Garante que existe um usuário administrador padrão
  garantirAdministradorPadrao: async (): Promise<UsuarioDTO> => {
    try {
      const baseVazia = await UsuariosService.baseEstaVazia();
      
      if (baseVazia) {
        const adminPadrao: UsuarioDTO = {
          nome: "adm",
          senha: "123"
        };
        
        const usuarioCriado = await UsuariosService.criar(adminPadrao);
        return usuarioCriado;
      }
      
      // Se não está vazia, tenta buscar o admin existente
      const adminExistente = await UsuariosService.buscarPorNome("adm");
      if (adminExistente) {
        return adminExistente;
      }
      
      // Se não tem admin "adm" mas tem outros usuários, cria mesmo assim
      const adminPadrao: UsuarioDTO = {
        nome: "adm", 
        senha: "123"
      };
      
      return await UsuariosService.criar(adminPadrao);
      
    } catch (error) {
      // Retorna um usuário padrão local se falhar
      return {
        id: 1,
        nome: "adm",
        senha: "123" // Garantir que sempre tenha senha
      };
    }
  },

  // Busca usuário por nome (para autenticação)
  buscarPorNome: async (nome: string): Promise<UsuarioDTO | null> => {
    try {
      const usuarios = await UsuariosService.listar();
      const usuario = usuarios.find(u => u.nome === nome);
      return usuario || null;
    } catch (error) {
      return null;
    }
  },

  // Autentica usuário (verifica nome e senha no backend) - VERSÃO MELHORADA
  autenticar: async (nome: string, senha: string): Promise<UsuarioDTO | null> => {
    try {
      // Primeiro garante que existe um admin padrão
      await UsuariosService.garantirAdministradorPadrao();
      
      // Debug: Lista todos os usuários
      await UsuariosService.debug();
      
      // Depois tenta autenticar
      const usuario = await UsuariosService.buscarPorNome(nome);
      
      if (!usuario) {
        return null;
      }
      
      // Verifica se a senha está definida corretamente
      if (!usuario.senha || usuario.senha === null || usuario.senha === '') {
        return null;
      }
      
      // Compara as senhas
      if (usuario.senha === senha) {
        // Usuário encontrado e senha correta
        return usuario;
      } else {
        return null;
      }
      
    } catch (error) {
      return null;
    }
  },

  // Sincroniza usuário local com o backend (versão mais restritiva)
  sincronizarUsuarioLocal: async (nomeLocal: string, senhaLocal: string): Promise<UsuarioDTO> => {
    try {
      // Primeiro garante que a base não está vazia
      await UsuariosService.garantirAdministradorPadrao();
      
      // Verifica se o usuário já existe no backend
      const usuarioExistente = await UsuariosService.buscarPorNome(nomeLocal);
      
      if (usuarioExistente) {
        // Se existe, atualiza a senha se necessário
        if (usuarioExistente.senha !== senhaLocal) {
          const usuarioAtualizado = await UsuariosService.atualizar(usuarioExistente.id!, {
            ...usuarioExistente,
            senha: senhaLocal
          });
          return usuarioAtualizado;
        }
        return usuarioExistente;
      } else {
        // ⚠️ MUDANÇA: Não cria usuário automaticamente se não existir
        // Apenas sincroniza usuários que já existem no backend
        
        // Retorna dados locais para manter funcionamento
        return {
          id: 1,
          nome: nomeLocal,
          senha: senhaLocal
        };
      }
    } catch (error) {
      // Em caso de erro, retorna dados locais
      return {
        id: 1,
        nome: nomeLocal,
        senha: senhaLocal
      };
    }
  },

  // Cria usuário de forma controlada (apenas para usuários autorizados)
  criarUsuarioControlado: async (nomeUsuario: string, senha: string = "123"): Promise<UsuarioDTO> => {
    try {
      // Garante que existe admin padrão
      await UsuariosService.garantirAdministradorPadrao();
      
      // Verifica se o usuário já existe
      const usuarioExiste = await UsuariosService.existePorNome(nomeUsuario);
      
      if (usuarioExiste) {
        // Se existe, busca e retorna
        const usuarios = await UsuariosService.listar();
        const usuarioEncontrado = usuarios.find(u => u.nome === nomeUsuario);
        
        if (usuarioEncontrado) {
          return usuarioEncontrado;
        }
      }
      
      // Se não existe, cria no backend
      const novoUsuario: UsuarioDTO = {
        nome: nomeUsuario,
        senha: senha
      };
      
      return await UsuariosService.criar(novoUsuario);
      
    } catch (error) {
      // Em caso de erro, retorna um usuário com ID padrão
      return {
        id: 1,
        nome: nomeUsuario,
        senha: senha // Garantir que sempre tenha senha
      };
    }
  },

  // Busca ou cria o usuário baseado no nome do contexto de autenticação (versão mais restritiva)
  buscarOuCriarUsuarioPorNome: async (nomeUsuario: string): Promise<UsuarioDTO> => {
    try {
      // Garante que existe admin padrão
      await UsuariosService.garantirAdministradorPadrao();
      
      // Primeiro verifica se o usuário já existe
      const usuarioExiste = await UsuariosService.existePorNome(nomeUsuario);
      
      if (usuarioExiste) {
        // Se existe, busca todos os usuários e encontra o correto
        const usuarios = await UsuariosService.listar();
        const usuarioEncontrado = usuarios.find(u => u.nome === nomeUsuario);
        
        if (usuarioEncontrado) {
          return usuarioEncontrado;
        }
      }
      
      // ⚠️ MUDANÇA: Apenas cria automaticamente se for o admin padrão
      if (nomeUsuario === "adm") {
        return await UsuariosService.criarUsuarioControlado(nomeUsuario, "123");
      }
      
      // Para outros usuários, não cria automaticamente
      // Retorna um usuário local para manter funcionamento
      return {
        id: 1,
        nome: nomeUsuario,
        senha: "123" // Garantir que sempre tenha senha padrão
      };
      
    } catch (error) {
      // Em caso de erro, retorna um usuário com ID padrão
      return {
        id: 1,
        nome: nomeUsuario,
        senha: "123" // Garantir que sempre tenha senha padrão
      };
    }
  },

  // Retorna o usuário atual com base no contexto de autenticação
  obterUsuarioAtual: async (): Promise<UsuarioDTO> => {
    try {
      // Busca o usuário do contexto de autenticação
      const userData = localStorage.getItem('pirangueiro_user');
      if (userData) {
        const user = JSON.parse(userData);
        // Mapeia 'username' do contexto para 'nome' do backend
        const nomeUsuario = user.username || user.nome || "adm";
        return await UsuariosService.buscarOuCriarUsuarioPorNome(nomeUsuario);
      }
    } catch (error) {
      // Error getting current user
    }
    
    // Fallback para usuário padrão
    return await UsuariosService.buscarOuCriarUsuarioPorNome("adm");
  }
}; 
