import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, UserCog, Loader2 } from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showCredentials, setShowCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error("Usuário ou senha incorretos");
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      toast.error("Erro ao tentar fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pirangueiro Financeiro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Faça login para acessar o sistema
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
              <br />
              <span className="text-xs text-muted-foreground mt-1 block">
                🔄 Integrado com backend para autenticação
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Digite seu usuário"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite sua senha"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Precisa de ajuda?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => setShowCredentials(!showCredentials)}
              disabled={isLoading}
            >
              <UserCog className="w-4 h-4 mr-2" />
              {showCredentials ? 'Ocultar' : 'Mostrar'} Credenciais Padrão
            </Button>

            {showCredentials && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Credenciais Padrão:</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Usuário:</strong> adm</div>
                  <div><strong>Senha:</strong> 123</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Você pode alterar essas credenciais após fazer login.
                  <br />
                  <span className="text-green-600 dark:text-green-400">
                    ✨ Sistema criará automaticamente no backend se não existir
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 