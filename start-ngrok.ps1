# Script para iniciar ngrok
Write-Host "🚀 Iniciando ngrok..." -ForegroundColor Green

# Verificar se o ngrok está instalado
try {
    ngrok version
    Write-Host "✅ ngrok encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok não encontrado. Instalando..." -ForegroundColor Red
    npm install -g ngrok
}

# Iniciar ngrok
Write-Host "🌐 Expondo localhost:3000..." -ForegroundColor Yellow
ngrok http 3000
