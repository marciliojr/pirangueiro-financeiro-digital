import { UsuariosService } from '@/services/usuarios';

export const DiagnosticoUsuarios = {
  // Executa diagnóstico completo do sistema de usuários
  executarDiagnostico: async (): Promise<void> => {
    try {
      // 1. Lista todos os usuários
      const usuarios = await UsuariosService.listar();
      
      if (usuarios.length === 0) {
        return;
      }
      
      // 2. Analisa cada usuário
      usuarios.forEach((user, index) => {
        // Problemas comuns
        if (!user.senha) {
          // Usuário sem senha definida
        }
        if (user.senha === '' || user.senha === null) {
          // Usuário com senha vazia
        }
      });
      
      // 3. Testa autenticação do admin padrão
      const adminResult = await UsuariosService.autenticar("adm", "123");
      
      // 4. Testa cada usuário com senha padrão "123"
      for (const user of usuarios) {
        if (user.nome !== "adm") {
          try {
            const result = await UsuariosService.autenticar(user.nome, "123");
          } catch (error) {
            // Error testing user
          }
        }
      }
      
      // 5. Recomendações
      const usuariosSemSenha = usuarios.filter(u => !u.senha);
      if (usuariosSemSenha.length > 0) {
        // Usuários sem senha precisam ser corrigidos
      }
      
    } catch (error) {
      // Error during diagnosis
    }
  },
  
  // Corrige usuários sem senha definindo senha padrão
  corrigirUsuariosSemSenha: async (): Promise<void> => {
    try {
      const usuarios = await UsuariosService.listar();
      
      const usuariosSemSenha = usuarios.filter(u => !u.senha);
      
      if (usuariosSemSenha.length === 0) {
        return;
      }
      
      for (const user of usuariosSemSenha) {
        try {
          const usuarioAtualizado = {
            id: user.id,
            nome: user.nome,
            senha: "123" // Define senha padrão
          };
          
          const resultado = await UsuariosService.atualizar(user.id!, usuarioAtualizado);
          
        } catch (error) {
          // Error updating user
        }
      }
      
      const usuariosAposCorrecao = await UsuariosService.listar();
      const aindaSemSenha = usuariosAposCorrecao.filter(u => !u.senha);
      
    } catch (error) {
      // Critical error during correction
    }
  },
  
  // Método alternativo: recria o usuário admin
  recriarUsuarioAdmin: async (): Promise<void> => {
    try {
      // 1. Tenta excluir o usuário admin existente
      try {
        await UsuariosService.excluir(1); // ID 1 é normalmente o admin
      } catch (error) {
        // Admin user didn't exist or couldn't be deleted
      }
      
      // 2. Cria um novo usuário admin
      const novoAdmin = {
        nome: "adm",
        senha: "123"
      };
      
      const resultado = await UsuariosService.criar(novoAdmin);
      
    } catch (error) {
      // Error recreating admin user
    }
  },
  
  // MODO DE EMERGÊNCIA: Ativa autenticação local para contornar bug do backend
  ativarModoEmergencia: async (): Promise<void> => {
    try {
      // Limpa dados locais
      localStorage.removeItem('pirangueiro_user');
      localStorage.removeItem('pirangueiro_session');
      
      // Define usuário local com bypass de backend
      const usuarioEmergencia = {
        username: "adm",
        password: "123",
        id: 1,
        modoEmergencia: true
      };
      
      localStorage.setItem('pirangueiro_user', JSON.stringify(usuarioEmergencia));
      
      // Força reload da página para aplicar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      // Error activating emergency mode
    }
  },
  
  // Diagnóstica se o backend tem o bug de senhas
  diagnosticarBugBackend: async (): Promise<void> => {
    try {
      // Cria usuário de teste
      const usuarioTeste = {
        nome: "teste_senha_" + Date.now(),
        senha: "senha_teste_123"
      };
      
      const resultado = await UsuariosService.criar(usuarioTeste);
      
      // Verifica se a senha foi salva
      if (!resultado.senha || resultado.senha === null) {
        // Bug confirmed - backend not saving passwords
      } else {
        // Backend working correctly
      }
      
      // Remove usuário de teste
      try {
        await UsuariosService.excluir(resultado.id!);
      } catch (error) {
        // Couldn't remove test user
      }
      
    } catch (error) {
      // Error in diagnosis
    }
  },
  
  // Força admin funcional usando interceptação de senhas null
  forcarAdminComInterceptacao: async (): Promise<void> => {
    try {
      // Usa a nova função de recriação forçada
      const adminRecriado = await UsuariosService.forcarRecriaoAdmin();
      
      // Testa se a autenticação funciona agora
      const testeAuth = await UsuariosService.autenticar("adm", "123");
      
    } catch (error) {
      // Error in operation
    }
  },
  
  // Testa autenticação de um usuário específico
  testarUsuario: async (nome: string, senha: string): Promise<boolean> => {
    try {
      const resultado = await UsuariosService.autenticar(nome, senha);
      if (resultado) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
};

// Disponibiliza no objeto global para uso no console do navegador
declare global {
  interface Window {
    DiagnosticoUsuarios: typeof DiagnosticoUsuarios;
  }
}

window.DiagnosticoUsuarios = DiagnosticoUsuarios; 
