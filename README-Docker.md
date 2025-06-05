# Docker Setup - Pirangueiro Financeiro Digital

Este documento explica como configurar e executar o frontend do Pirangueiro Financeiro Digital usando Docker.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Backend do Pirangueiro rodando na porta 8080 (se usando configuração externa)

## 🏗️ Arquivos Criados

- `Dockerfile` - Configuração principal com multi-stage build
- `docker-compose.yml` - Orquestração com backend incluído
- `docker-compose.external-backend.yml` - Para usar backend externo
- `.dockerignore` - Otimização do contexto de build
- `docker-scripts.ps1` - Scripts de gerenciamento (Windows)
- `docker-scripts.sh` - Scripts de gerenciamento (Linux/Mac)

## 🚀 Como Usar

### Opção 1: Com Backend Incluído

Se você quiser que o Docker gerencie tanto frontend quanto backend:

```bash
# Construir a imagem
docker-compose build

# Iniciar em produção
docker-compose up -d frontend

# Iniciar em desenvolvimento
docker-compose --profile dev up frontend-dev
```

### Opção 2: Com Backend Externo

Se você já tem um backend rodando externamente:

```bash
# Produção
docker-compose -f docker-compose.external-backend.yml up -d frontend

# Desenvolvimento
docker-compose -f docker-compose.external-backend.yml --profile dev up frontend-dev
```

## 🛠️ Usando os Scripts (Recomendado)

### Windows (PowerShell)
```powershell
# Construir
.\docker-scripts.ps1 build

# Iniciar produção
.\docker-scripts.ps1 up

# Iniciar desenvolvimento
.\docker-scripts.ps1 dev

# Backend externo - produção
.\docker-scripts.ps1 external

# Backend externo - desenvolvimento
.\docker-scripts.ps1 external-dev

# Ver logs
.\docker-scripts.ps1 logs

# Parar containers
.\docker-scripts.ps1 down
```

### Linux/Mac (Bash)
```bash
# Construir
./docker-scripts.sh build

# Iniciar produção
./docker-scripts.sh up

# Iniciar desenvolvimento
./docker-scripts.sh dev

# Backend externo - produção
./docker-scripts.sh external

# Backend externo - desenvolvimento
./docker-scripts.sh external-dev
```

## 🌐 URLs de Acesso

- **Produção**: http://localhost:3000
- **Desenvolvimento**: http://localhost:8082
- **Backend (se incluído)**: http://localhost:8080

## 🔧 Configurações Importantes

### Proxy para API
O nginx está configurado para fazer proxy das chamadas `/api/*` para o backend:
- Em produção: proxy para `backend:8080`
- Com backend externo: proxy para `host-gateway:8080`

### Variáveis de Ambiente
Você pode ajustar as seguintes variáveis no docker-compose:

```yaml
environment:
  - NODE_ENV=production
  - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8082
```

### Volumes de Desenvolvimento
No modo desenvolvimento, o código é montado como volume para hot reload:
```yaml
volumes:
  - .:/app
  - /app/node_modules
```

## 🔄 Builds Otimizados

O Dockerfile usa multi-stage build:
1. **base** - Configuração base com Node.js
2. **dev** - Ambiente de desenvolvimento
3. **build** - Build da aplicação
4. **production** - Nginx servindo arquivos estáticos

## 🚨 Troubleshooting

### Backend não conecta
1. Verifique se o backend está rodando na porta 8080
2. Confirme se o CORS está configurado no backend para aceitar `localhost:3000` e `localhost:8082`
3. Use o comando `docker-scripts.ps1 logs` para ver os logs

### Build falha
1. Limpe o cache: `docker-scripts.ps1 clean`
2. Rebuild: `docker-scripts.ps1 rebuild`

### Porta já em uso
Mude as portas no docker-compose.yml:
```yaml
ports:
  - "3001:80"  # Frontend produção
  - "8083:8082"  # Frontend desenvolvimento
```

## 📝 Comandos Úteis

```bash
# Ver containers rodando
docker ps

# Ver logs específicos
docker logs pirangueiro-frontend

# Acessar container
docker exec -it pirangueiro-frontend sh

# Verificar saúde da aplicação
curl http://localhost:3000

# Parar todos os containers
docker-compose down

# Limpar tudo
docker system prune -a
```

## 🔒 Configurações de Segurança

O nginx está configurado com headers de segurança:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Cache otimizado para assets estáticos

## 📊 Monitoramento

Para produção, considere adicionar:
- Health checks
- Logging centralizado
- Métricas de performance
- Backup automático

## 🤝 Integração com Backend

Se você tem um backend Spring Boot, certifique-se de que:

1. O CORS está configurado para aceitar as origens do frontend
2. A porta 8080 está exposta
3. Os endpoints estão em `/api/*`

Exemplo de configuração CORS no Spring:
```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8082"})
``` 