import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange }) => {
  const { login, updateUser, isAuthenticated, logout, currentUser } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [updateForm, setUpdateForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔐 MODAL: Tentativa de login iniciada");
    console.log("👤 MODAL: Usuário:", loginForm.username);
    console.log("🔐 MODAL: Senha:", loginForm.password);
    
    if (!loginForm.username || !loginForm.password) {
      console.log("❌ MODAL: Campos vazios");
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoginLoading(true);
    console.log("⏳ MODAL: Iniciando loading...");

    try {
      console.log("🔄 MODAL: Chamando função login do context...");
      const success = await login(loginForm.username, loginForm.password);
      
      console.log("🔍 MODAL: Resultado do login:", success);
      
      if (success) {
        console.log("✅ MODAL: Login bem-sucedido!");
        toast.success("Login realizado com sucesso!");
        onOpenChange(false);
        setLoginForm({ username: '', password: '' });
      } else {
        console.log("❌ MODAL: Login falhou");
        toast.error("Usuário ou senha incorretos");
      }
    } catch (error) {
      console.error("❌ MODAL: Erro durante login:", error);
      console.error("❌ MODAL: Stack trace:", error.stack);
      toast.error("Erro ao tentar fazer login. Tente novamente.");
    } finally {
      console.log("🏁 MODAL: Finalizando loading...");
      setIsLoginLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateForm.username || !updateForm.password || !updateForm.confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (updateForm.password !== updateForm.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (updateForm.password.length < 3) {
      toast.error("A senha deve ter pelo menos 3 caracteres");
      return;
    }

    setIsUpdateLoading(true);

    try {
      await updateUser(updateForm.username, updateForm.password);
      toast.success("Usuário atualizado com sucesso!");
      onOpenChange(false);
      setUpdateForm({ username: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sistema de Autenticação</DialogTitle>
        </DialogHeader>
        
        {isAuthenticated ? (
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Minha Conta</TabsTrigger>
              <TabsTrigger value="update">Alterar Dados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="font-semibold">Bem-vindo!</h3>
                  <p className="text-sm text-muted-foreground">
                    Usuário atual: <strong>{currentUser?.username}</strong>
                  </p>
                  {currentUser?.id && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✅ Sincronizado com backend (ID: {currentUser.id})
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleLogout} variant="outline" className="flex-1">
                    Fazer Logout
                  </Button>
                  <Button onClick={() => onOpenChange(false)} className="flex-1">
                    Fechar
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="update" className="space-y-4">
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Atualize suas credenciais de acesso:
                  <br />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    🔄 Alterações serão sincronizadas com o backend
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="update-username">Novo Usuário</Label>
                  <Input
                    id="update-username"
                    type="text"
                    value={updateForm.username}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite o novo usuário"
                    disabled={isUpdateLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-password">Nova Senha</Label>
                  <Input
                    id="update-password"
                    type="password"
                    value={updateForm.password}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite a nova senha"
                    disabled={isUpdateLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={updateForm.confirmPassword}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    disabled={isUpdateLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isUpdateLoading}>
                  {isUpdateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar Credenciais"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="update">Cadastrar Usuário</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Usuário</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite seu usuário"
                    disabled={isLoginLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite sua senha"
                    disabled={isLoginLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoginLoading}>
                  {isLoginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
              <div className="text-xs text-muted-foreground text-center">
                Usuário padrão: <strong>adm</strong> | Senha: <strong>123</strong>
                <br />
                <span className="text-green-600 dark:text-green-400">
                  🔄 Validação via backend
                </span>
              </div>
            </TabsContent>
            
            <TabsContent value="update" className="space-y-4">
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Defina novas credenciais de acesso:
                  <br />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ✨ Novo usuário será criado no backend
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-username">Usuário</Label>
                  <Input
                    id="new-username"
                    type="text"
                    value={updateForm.username}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite o usuário"
                    disabled={isUpdateLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={updateForm.password}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite a senha"
                    disabled={isUpdateLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-confirm-password">Confirmar Senha</Label>
                  <Input
                    id="new-confirm-password"
                    type="password"
                    value={updateForm.confirmPassword}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a senha"
                    disabled={isUpdateLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isUpdateLoading}>
                  {isUpdateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Usuário"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}; 