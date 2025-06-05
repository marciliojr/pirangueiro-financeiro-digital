#!/bin/bash

# Scripts para gerenciar o Docker do Pirangueiro Financeiro Digital

case "$1" in
    "build")
        echo "🏗️  Construindo a imagem do frontend..."
        docker-compose build
        ;;
    "up")
        echo "🚀 Iniciando o frontend em produção..."
        docker-compose up -d frontend
        echo "✅ Frontend disponível em: http://localhost:3000"
        ;;
    "dev")
        echo "🛠️  Iniciando o frontend em modo desenvolvimento..."
        docker-compose --profile dev up frontend-dev
        echo "✅ Frontend dev disponível em: http://localhost:8082"
        ;;
    "down")
        echo "🛑 Parando todos os containers..."
        docker-compose down
        ;;
    "logs")
        echo "📋 Exibindo logs do frontend..."
        docker-compose logs -f frontend
        ;;
    "logs-dev")
        echo "📋 Exibindo logs do frontend dev..."
        docker-compose logs -f frontend-dev
        ;;
    "restart")
        echo "🔄 Reiniciando o frontend..."
        docker-compose restart frontend
        ;;
    "rebuild")
        echo "🏗️  Reconstruindo e iniciando..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d frontend
        echo "✅ Frontend reconstruído e disponível em: http://localhost:3000"
        ;;
    "external")
        echo "🚀 Iniciando com backend externo..."
        docker-compose -f docker-compose.external-backend.yml up -d frontend
        echo "✅ Frontend disponível em: http://localhost:3000"
        echo "⚠️  Certifique-se de que o backend está rodando em localhost:8080"
        ;;
    "external-dev")
        echo "🛠️  Iniciando dev com backend externo..."
        docker-compose -f docker-compose.external-backend.yml --profile dev up frontend-dev
        echo "✅ Frontend dev disponível em: http://localhost:8082"
        echo "⚠️  Certifique-se de que o backend está rodando em localhost:8080"
        ;;
    "clean")
        echo "🧹 Limpando containers e imagens não utilizadas..."
        docker-compose down
        docker system prune -f
        ;;
    *)
        echo "📖 Uso: $0 {build|up|dev|down|logs|logs-dev|restart|rebuild|external|external-dev|clean}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  build        - Constrói a imagem do frontend"
        echo "  up           - Inicia o frontend em produção"
        echo "  dev          - Inicia o frontend em modo desenvolvimento"
        echo "  down         - Para todos os containers"
        echo "  logs         - Exibe logs do frontend produção"
        echo "  logs-dev     - Exibe logs do frontend desenvolvimento"
        echo "  restart      - Reinicia o frontend"
        echo "  rebuild      - Reconstrói e inicia (sem cache)"
        echo "  external     - Inicia com backend externo (produção)"
        echo "  external-dev - Inicia com backend externo (desenvolvimento)"
        echo "  clean        - Limpa containers e imagens não utilizadas"
        ;;
esac 