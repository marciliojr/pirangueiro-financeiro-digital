import { UsuariosService } from '@/services/usuarios';

export const DiagnosticoUsuarios = {
  // Executa diagnóstico completo do sistema de usuários
  executarDiagnostico: async (): Promise<void> => {
    console.log("🩺 INICIANDO DIAGNÓSTICO DE USUÁRIOS");
    console.log("=====================================");
    
    try {
      // 1. Lista todos os usuários
      console.log("1️⃣ Listando usuários da base...");
      const usuarios = await UsuariosService.listar();
      console.log(`📊 Total de usuários: ${usuarios.length}`);
      
      if (usuarios.length === 0) {
        console.log("❌ PROBLEMA: Base de dados está vazia!");
        return;
      }
      
      // 2. Analisa cada usuário
      usuarios.forEach((user, index) => {
        console.log(`\n👤 Usuário ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: "${user.nome}"`);
        console.log(`   Senha: ${user.senha ? `"${user.senha}"` : '❌ UNDEFINED/NULL'}`);
        console.log(`   Tipo senha: ${typeof user.senha}`);
        console.log(`   Tem senha: ${!!user.senha}`);
        
        // Problemas comuns
        if (!user.senha) {
          console.log(`   ⚠️ PROBLEMA: Usuário "${user.nome}" não tem senha definida!`);
        }
        if (user.senha === '' || user.senha === null) {
          console.log(`   ⚠️ PROBLEMA: Usuário "${user.nome}" tem senha vazia!`);
        }
      });
      
      // 3. Testa autenticação do admin padrão
      console.log("\n2️⃣ Testando autenticação do admin padrão...");
      const adminResult = await UsuariosService.autenticar("adm", "123");
      if (adminResult) {
        console.log("✅ Admin padrão funciona!");
      } else {
        console.log("❌ PROBLEMA: Admin padrão não funciona!");
      }
      
      // 4. Testa cada usuário com senha padrão "123"
      console.log("\n3️⃣ Testando usuários com senha padrão '123'...");
      for (const user of usuarios) {
        if (user.nome !== "adm") {
          try {
            const result = await UsuariosService.autenticar(user.nome, "123");
            if (result) {
              console.log(`✅ ${user.nome}/123 funciona!`);
            } else {
              console.log(`❌ ${user.nome}/123 falha!`);
            }
          } catch (error) {
            console.log(`❌ ${user.nome}/123 erro:`, error);
          }
        }
      }
      
      // 5. Recomendações
      console.log("\n4️⃣ RECOMENDAÇÕES:");
      const usuariosSemSenha = usuarios.filter(u => !u.senha);
      if (usuariosSemSenha.length > 0) {
        console.log("🔧 Usuários sem senha precisam ser corrigidos:");
        usuariosSemSenha.forEach(u => {
          console.log(`   - ${u.nome} (ID: ${u.id})`);
        });
        console.log("💡 Solução: Use a função corrigirUsuariosSemSenha()");
      }
      
    } catch (error) {
      console.error("❌ Erro durante diagnóstico:", error);
    }
    
    console.log("\n🩺 DIAGNÓSTICO FINALIZADO");
    console.log("=====================================");
  },
  
  // Corrige usuários sem senha definindo senha padrão
  corrigirUsuariosSemSenha: async (): Promise<void> => {
    console.log("🔧 INICIANDO CORREÇÃO DE USUÁRIOS SEM SENHA...");
    console.log("==============================================");
    
    try {
      console.log("1️⃣ Listando usuários da base...");
      const usuarios = await UsuariosService.listar();
      console.log("📊 Usuários encontrados:", usuarios);
      
      const usuariosSemSenha = usuarios.filter(u => !u.senha);
      console.log("❌ Usuários SEM senha:", usuariosSemSenha);
      
      if (usuariosSemSenha.length === 0) {
        console.log("✅ Todos os usuários já têm senha definida!");
        return;
      }
      
      console.log(`🔧 Corrigindo ${usuariosSemSenha.length} usuários...`);
      
      for (const user of usuariosSemSenha) {
        console.log(`\n🔄 Processando usuário: ${user.nome} (ID: ${user.id})`);
        
        try {
          const usuarioAtualizado = {
            id: user.id,
            nome: user.nome,
            senha: "123" // Define senha padrão
          };
          
          console.log("📝 Dados a serem enviados:", usuarioAtualizado);
          
          const resultado = await UsuariosService.atualizar(user.id!, usuarioAtualizado);
          console.log(`✅ Usuário "${user.nome}" corrigido com sucesso!`);
          console.log("📄 Resultado da atualização:", resultado);
          
        } catch (error) {
          console.error(`❌ Erro ao corrigir usuário "${user.nome}":`, error);
          console.error("📄 Detalhes do erro:", error.response?.data || error.message);
        }
      }
      
      console.log("\n3️⃣ Verificando se a correção funcionou...");
      const usuariosAposCorrecao = await UsuariosService.listar();
      const aindaSemSenha = usuariosAposCorrecao.filter(u => !u.senha);
      
      if (aindaSemSenha.length === 0) {
        console.log("🎉 CORREÇÃO FINALIZADA COM SUCESSO!");
        console.log("✅ Todos os usuários agora têm senha definida!");
      } else {
        console.log("⚠️ Ainda há usuários sem senha:");
        aindaSemSenha.forEach(u => console.log(`   - ${u.nome} (ID: ${u.id})`));
      }
      
      console.log("\n🧪 Teste o login novamente: adm/123");
      
    } catch (error) {
      console.error("❌ ERRO CRÍTICO durante correção:", error);
      console.error("📄 Stack trace:", error.stack);
    }
    
    console.log("==============================================");
    console.log("🔧 CORREÇÃO FINALIZADA");
  },
  
  // Método alternativo: recria o usuário admin
  recriarUsuarioAdmin: async (): Promise<void> => {
    console.log("🔄 RECRIANDO USUÁRIO ADMIN...");
    console.log("=============================");
    
    try {
      // 1. Tenta excluir o usuário admin existente
      console.log("1️⃣ Tentando excluir usuário admin existente...");
      try {
        await UsuariosService.excluir(1); // ID 1 é normalmente o admin
        console.log("🗑️ Usuário admin antigo excluído");
      } catch (error) {
        console.log("ℹ️ Usuário admin não existia ou não pôde ser excluído:", error.message);
      }
      
      // 2. Cria um novo usuário admin
      console.log("2️⃣ Criando novo usuário admin...");
      const novoAdmin = {
        nome: "adm",
        senha: "123"
      };
      
      console.log("📝 Dados do novo admin:", novoAdmin);
      const resultado = await UsuariosService.criar(novoAdmin);
      console.log("✅ Novo usuário admin criado:", resultado);
      
      console.log("🎉 USUÁRIO ADMIN RECRIADO COM SUCESSO!");
      console.log("🧪 Teste o login: adm/123");
      
    } catch (error) {
      console.error("❌ Erro ao recriar usuário admin:", error);
      console.error("📄 Stack trace:", error.stack);
    }
    
    console.log("=============================");
  },
  
  // MODO DE EMERGÊNCIA: Ativa autenticação local para contornar bug do backend
  ativarModoEmergencia: async (): Promise<void> => {
    console.log("🚨 ATIVANDO MODO DE EMERGÊNCIA...");
    console.log("==================================");
    console.log("⚠️ PROBLEMA: Backend não salva senhas corretamente");
    console.log("🔧 SOLUÇÃO: Autenticação local temporária");
    
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
      console.log("💾 Usuário de emergência configurado:", usuarioEmergencia);
      
      // Força reload da página para aplicar mudanças
      console.log("🔄 Recarregando página para aplicar mudanças...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      console.log("✅ MODO DE EMERGÊNCIA ATIVADO!");
      console.log("🎯 Agora tente fazer login com: adm/123");
      
    } catch (error) {
      console.error("❌ Erro ao ativar modo de emergência:", error);
    }
    
    console.log("==================================");
  },
  
  // Diagnóstica se o backend tem o bug de senhas
  diagnosticarBugBackend: async (): Promise<void> => {
    console.log("🩺 DIAGNOSTICANDO BUG DO BACKEND...");
    console.log("===================================");
    
    try {
      // Cria usuário de teste
      console.log("1️⃣ Criando usuário de teste...");
      const usuarioTeste = {
        nome: "teste_senha_" + Date.now(),
        senha: "senha_teste_123"
      };
      
      console.log("📝 Dados enviados:", usuarioTeste);
      const resultado = await UsuariosService.criar(usuarioTeste);
      console.log("📄 Dados retornados:", resultado);
      
      // Verifica se a senha foi salva
      if (!resultado.senha || resultado.senha === null) {
        console.log("🚨 BUG CONFIRMADO!");
        console.log("❌ Backend não está salvando senhas");
        console.log("💡 Solução: Use DiagnosticoUsuarios.forcarAdminComInterceptacao()");
      } else {
        console.log("✅ Backend funcionando corretamente");
        console.log("🎯 Senha salva:", resultado.senha);
      }
      
      // Remove usuário de teste
      try {
        await UsuariosService.excluir(resultado.id!);
        console.log("🗑️ Usuário de teste removido");
      } catch (error) {
        console.log("⚠️ Não foi possível remover usuário de teste");
      }
      
    } catch (error) {
      console.error("❌ Erro no diagnóstico:", error);
    }
    
    console.log("===================================");
  },
  
  // Força admin funcional usando interceptação de senhas null
  forcarAdminComInterceptacao: async (): Promise<void> => {
    console.log("🚀 FORÇANDO ADMIN COM INTERCEPTAÇÃO...");
    console.log("=====================================");
    
    try {
      // Usa a nova função de recriação forçada
      const adminRecriado = await UsuariosService.forcarRecriaoAdmin();
      console.log("✅ Admin recriado:", adminRecriado);
      
      // Testa se a autenticação funciona agora
      console.log("🧪 Testando autenticação do admin...");
      const testeAuth = await UsuariosService.autenticar("adm", "123");
      
      if (testeAuth) {
        console.log("🎉 SUCESSO! Autenticação funcionando!");
        console.log("✅ Dados do usuário:", testeAuth);
        console.log("🎯 Agora tente fazer login com: adm/123");
      } else {
        console.log("⚠️ Autenticação ainda falha, mas interceptação está ativa");
        console.log("🎯 Tente fazer login mesmo assim: adm/123");
      }
      
    } catch (error) {
      console.error("❌ Erro na operação:", error);
    }
    
    console.log("=====================================");
  },
  
  // Testa autenticação de um usuário específico
  testarUsuario: async (nome: string, senha: string): Promise<boolean> => {
    console.log(`🧪 Testando autenticação: ${nome}/${senha}`);
    
    try {
      const resultado = await UsuariosService.autenticar(nome, senha);
      if (resultado) {
        console.log("✅ Autenticação bem-sucedida:", resultado);
        return true;
      } else {
        console.log("❌ Autenticação falhou");
        return false;
      }
    } catch (error) {
      console.error("❌ Erro no teste:", error);
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
window.DiagnosticoUsuarios = DiagnosticoUsuarios; 