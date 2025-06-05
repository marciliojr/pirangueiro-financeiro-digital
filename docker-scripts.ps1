param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

# Scripts para gerenciar o Docker do Pirangueiro Financeiro Digital

switch ($Command) {
    "build" {
        Write-Host "🏗️  Construindo a imagem do frontend..." -ForegroundColor Cyan
        docker-compose build
    }
    "up" {
        Write-Host "🚀 Iniciando o frontend em produção..." -ForegroundColor Green
        docker-compose up -d frontend
        Write-Host "✅ Frontend disponível em: http://localhost:3000" -ForegroundColor Green
    }
    "dev" {
        Write-Host "🛠️  Iniciando o frontend em modo desenvolvimento..." -ForegroundColor Yellow
        docker-compose --profile dev up frontend-dev
        Write-Host "✅ Frontend dev disponível em: http://localhost:8082" -ForegroundColor Green
    }
    "down" {
        Write-Host "🛑 Parando todos os containers..." -ForegroundColor Red
        docker-compose down
    }
    "logs" {
        Write-Host "📋 Exibindo logs do frontend..." -ForegroundColor Cyan
        docker-compose logs -f frontend
    }
    "logs-dev" {
        Write-Host "📋 Exibindo logs do frontend dev..." -ForegroundColor Cyan
        docker-compose logs -f frontend-dev
    }
    "restart" {
        Write-Host "🔄 Reiniciando o frontend..." -ForegroundColor Yellow
        docker-compose restart frontend
    }
    "rebuild" {
        Write-Host "🏗️  Reconstruindo e iniciando..." -ForegroundColor Cyan
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d frontend
        Write-Host "✅ Frontend reconstruído e disponível em: http://localhost:3000" -ForegroundColor Green
    }
    "external" {
        Write-Host "🚀 Iniciando com backend externo..." -ForegroundColor Green
        docker-compose -f docker-compose.external-backend.yml up -d frontend
        Write-Host "✅ Frontend disponível em: http://localhost:3000" -ForegroundColor Green
        Write-Host "⚠️  Certifique-se de que o backend está rodando em localhost:8080" -ForegroundColor Yellow
    }
    "external-dev" {
        Write-Host "🛠️  Iniciando dev com backend externo..." -ForegroundColor Yellow
        docker-compose -f docker-compose.external-backend.yml --profile dev up frontend-dev
        Write-Host "✅ Frontend dev disponível em: http://localhost:8082" -ForegroundColor Green
        Write-Host "⚠️  Certifique-se de que o backend está rodando em localhost:8080" -ForegroundColor Yellow
    }
    "clean" {
        Write-Host "🧹 Limpando containers e imagens não utilizadas..." -ForegroundColor Magenta
        docker-compose down
        docker system prune -f
    }
    default {
        Write-Host "📖 Uso: .\docker-scripts.ps1 <comando>" -ForegroundColor White
        Write-Host ""
        Write-Host "Comandos disponíveis:" -ForegroundColor White
        Write-Host "  build        - Constrói a imagem do frontend" -ForegroundColor Gray
        Write-Host "  up           - Inicia o frontend em produção" -ForegroundColor Gray
        Write-Host "  dev          - Inicia o frontend em modo desenvolvimento" -ForegroundColor Gray
        Write-Host "  down         - Para todos os containers" -ForegroundColor Gray
        Write-Host "  logs         - Exibe logs do frontend produção" -ForegroundColor Gray
        Write-Host "  logs-dev     - Exibe logs do frontend desenvolvimento" -ForegroundColor Gray
        Write-Host "  restart      - Reinicia o frontend" -ForegroundColor Gray
        Write-Host "  rebuild      - Reconstrói e inicia (sem cache)" -ForegroundColor Gray
        Write-Host "  external     - Inicia com backend externo (produção)" -ForegroundColor Gray
        Write-Host "  external-dev - Inicia com backend externo (desenvolvimento)" -ForegroundColor Gray
        Write-Host "  clean        - Limpa containers e imagens não utilizadas" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor White
        Write-Host "  .\docker-scripts.ps1 build" -ForegroundColor Cyan
        Write-Host "  .\docker-scripts.ps1 up" -ForegroundColor Cyan
        Write-Host "  .\docker-scripts.ps1 dev" -ForegroundColor Cyan
    }
} 