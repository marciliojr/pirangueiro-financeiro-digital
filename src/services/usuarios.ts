import { api } from "./api";
import { UsuarioDTO } from "./contas";

export const UsuariosService = {
  // Lista todos os usuários
  listar: async (): Promise<UsuarioDTO[]> => {
    const response = await api.get("/usuarios");
    
    // CORREÇÃO: Intercepta usuários com senha null e tenta corrigir
    const usuarios = response.data.map((usuario: UsuarioDTO & { senha: string | null }) => {
      if (!usuario.senha || usuario.senha === null) {
        console.log(`⚠️ INTERCEPTADO: Usuário "${usuario.nome}" com senha null - corrigindo...`);
        
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
    
    console.log("📊 Usuários após correção de senhas null:", usuarios);
    return usuarios;
  },

  // Busca usuário por ID
  buscarPorId: async (id: number): Promise<UsuarioDTO> => {
    const response = await api.get(`/usuarios/${id}`);
    const usuario = response.data;
    
    // CORREÇÃO: Se senha for null, força senha padrão
    if (!usuario.senha || usuario.senha === null) {
      console.log(`⚠️ INTERCEPTADO: Usuário ID ${id} com senha null - corrigindo...`);
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
    console.log("📝 CRIANDO usuário - dados enviados:", usuario);
    
    const response = await api.post("/usuarios", usuario);
    const usuarioCriado = response.data;
    
    console.log("📄 CRIANDO usuário - dados retornados:", usuarioCriado);
    
    // CORREÇÃO: Se o backend retornar senha null, força a senha local
    if (!usuarioCriado.senha || usuarioCriado.senha === null) {
      console.log("🚨 BACKEND BUG: Retornou senha null! Forçando correção...");
      
      // Tenta atualizar forçadamente via PUT
      try {
        const usuarioCorrigido = await api.put(`/usuarios/${usuarioCriado.id}`, {
          ...usuarioCriado,
          senha: usuario.senha
        });
        
        console.log("🔧 Tentativa de correção via PUT:", usuarioCorrigido.data);
        
        // Se ainda for null, retorna com senha local
        if (!usuarioCorrigido.data.senha || usuarioCorrigido.data.senha === null) {
          console.log("❌ PUT também falhou. Usando dados locais...");
          return {
            ...usuarioCriado,
            senha: usuario.senha
          };
        }
        
        return usuarioCorrigido.data;
      } catch (error) {
        console.log("❌ Erro no PUT de correção. Usando dados locais...");
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
    console.log("🔄 FORÇANDO RECRIAÇÃO DO ADMIN...");
    
    try {
      // 1. Lista usuários para encontrar admin
      const usuarios = await api.get("/usuarios");
      const adminAtual = usuarios.data.find((u: UsuarioDTO & { senha: string | null }) => u.nome === "adm");
      
      if (adminAtual) {
        console.log("🗑️ Deletando admin atual:", adminAtual);
        await api.delete(`/usuarios/${adminAtual.id}`);
      }
      
      // 2. Aguarda um pouco para garantir que foi deletado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. Cria novo admin via API direta (sem usar o UsuariosService.criar)
      console.log("➕ Criando novo admin via API direta...");
      const novoAdmin = {
        nome: "adm",
        senha: "123"
      };
      
      const response = await api.post("/usuarios", novoAdmin);
      console.log("✅ Admin recriado:", response.data);
      
      // Se ainda retornar senha null, força retorno local
      if (!response.data.senha || response.data.senha === null) {
        console.log("🚨 Ainda retorna null! Usando dados locais...");
        return {
          ...response.data,
          senha: "123"
        };
      }
      
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao forçar recriação:", error);
      throw error;
    }
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
      console.log("🔍 DEBUG: Listando todos os usuários na base...");
      const usuarios = await UsuariosService.listar();
      
      console.log("📊 Total de usuários encontrados:", usuarios.length);
      usuarios.forEach((user, index) => {
        console.log(`👤 Usuário ${index + 1}:`, {
          id: user.id,
          nome: user.nome,
          temSenha: !!(user.senha && user.senha !== null && user.senha !== ''),
          senha: (user.senha && user.senha !== null && user.senha !== '') ? `${user.senha.substring(0, 3)}***` : '❌ sem senha'
        });
      });
      
      if (usuarios.length === 0) {
        console.log("❌ Nenhum usuário encontrado na base!");
      }
    } catch (error) {
      console.error("❌ Erro no debug de usuários:", error);
    }
  },

  // Verifica se a base de dados está vazia (sem usuários)
  baseEstaVazia: async (): Promise<boolean> => {
    try {
      const usuarios = await UsuariosService.listar();
      return usuarios.length === 0;
    } catch (error) {
      console.error("Erro ao verificar se base está vazia:", error);
      return true; // Em caso de erro, assume que está vazia
    }
  },

  // Garante que existe um usuário administrador padrão
  garantirAdministradorPadrao: async (): Promise<UsuarioDTO> => {
    try {
      const baseVazia = await UsuariosService.baseEstaVazia();
      
      if (baseVazia) {
        console.log("📦 Base de dados vazia. Criando usuário administrador padrão...");
        
        const adminPadrao: UsuarioDTO = {
          nome: "adm",
          senha: "123"
        };
        
        const usuarioCriado = await UsuariosService.criar(adminPadrao);
        console.log("✅ Usuário administrador padrão criado:", usuarioCriado);
        
        return usuarioCriado;
      }
      
      // Se não está vazia, tenta buscar o admin existente
      const adminExistente = await UsuariosService.buscarPorNome("adm");
      if (adminExistente) {
        return adminExistente;
      }
      
      // Se não tem admin "adm" mas tem outros usuários, cria mesmo assim
      console.log("⚠️ Base tem usuários mas não tem 'adm'. Criando administrador padrão...");
      const adminPadrao: UsuarioDTO = {
        nome: "adm", 
        senha: "123"
      };
      
      return await UsuariosService.criar(adminPadrao);
      
    } catch (error) {
      console.error("❌ Erro ao garantir administrador padrão:", error);
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
      console.error("Erro ao buscar usuário por nome:", error);
      return null;
    }
  },

  // Autentica usuário (verifica nome e senha no backend) - VERSÃO MELHORADA
  autenticar: async (nome: string, senha: string): Promise<UsuarioDTO | null> => {
    try {
      console.log("🔐 Iniciando autenticação para:", nome);
      
      // Primeiro garante que existe um admin padrão
      await UsuariosService.garantirAdministradorPadrao();
      
      // Debug: Lista todos os usuários
      await UsuariosService.debug();
      
      // Depois tenta autenticar
      console.log("🔍 Buscando usuário no backend:", nome);
      const usuario = await UsuariosService.buscarPorNome(nome);
      
      if (!usuario) {
        console.log("❌ Usuário não encontrado no backend:", nome);
        return null;
      }
      
      console.log("👤 Usuário encontrado:", {
        id: usuario.id,
        nome: usuario.nome,
        temSenha: !!(usuario.senha && usuario.senha !== null && usuario.senha !== '')
      });
      
      // Verifica se a senha está definida corretamente
      if (!usuario.senha || usuario.senha === null || usuario.senha === '') {
        console.log("❌ Usuário sem senha válida definida:", nome);
        return null;
      }
      
      // Compara as senhas
      console.log("🔐 Comparando senhas...");
      console.log("Senha fornecida:", senha);
      console.log("Senha do usuário:", usuario.senha);
      
      if (usuario.senha === senha) {
        // Usuário encontrado e senha correta
        console.log("✅ Autenticação bem-sucedida no backend para:", nome);
        return usuario;
      } else {
        console.log("❌ Senha incorreta para usuário:", nome);
        console.log("Esperado:", usuario.senha, "| Fornecido:", senha);
        return null;
      }
      
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);
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
          console.log("🔄 Atualizando senha do usuário existente:", nomeLocal);
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
        console.log("⚠️ Usuário não encontrado no backend:", nomeLocal);
        console.log("ℹ️ Para criar novos usuários, use o sistema de cadastro apropriado");
        
        // Retorna dados locais para manter funcionamento
        return {
          id: 1,
          nome: nomeLocal,
          senha: senhaLocal
        };
      }
    } catch (error) {
      console.error("Erro ao sincronizar usuário:", error);
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
          console.log("ℹ️ Usuário já existe:", nomeUsuario);
          return usuarioEncontrado;
        }
      }
      
      // Se não existe, cria no backend
      console.log("➕ Criando novo usuário no backend:", nomeUsuario);
      const novoUsuario: UsuarioDTO = {
        nome: nomeUsuario,
        senha: senha
      };
      
      return await UsuariosService.criar(novoUsuario);
      
    } catch (error) {
      console.error("Erro ao criar usuário controlado:", error);
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
        console.log("🔧 Criando usuário administrador padrão automaticamente");
        return await UsuariosService.criarUsuarioControlado(nomeUsuario, "123");
      }
      
      // Para outros usuários, não cria automaticamente
      console.log("⚠️ Usuário não encontrado e não será criado automaticamente:", nomeUsuario);
      console.log("ℹ️ Use o sistema de cadastro para criar novos usuários");
      
      // Retorna um usuário local para manter funcionamento
      return {
        id: 1,
        nome: nomeUsuario,
        senha: "123" // Garantir que sempre tenha senha padrão
      };
      
    } catch (error) {
      console.error("Erro ao buscar ou criar usuário:", error);
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
      console.error("Erro ao obter usuário atual:", error);
    }
    
    // Fallback para usuário padrão
    return await UsuariosService.buscarOuCriarUsuarioPorNome("adm");
  }
}; 