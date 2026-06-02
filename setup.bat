@echo off
echo ================================
echo   LOJA MVP - Setup Automatico
echo ================================
echo.

echo [1/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 goto erro

echo [2/4] Gerando cliente do banco...
call npx prisma generate
if %errorlevel% neq 0 goto erro

echo [3/4] Criando tabelas...
call npx prisma db push
if %errorlevel% neq 0 goto erro

echo [4/4] Populando com produtos...
call npx tsx prisma/seed.ts
if %errorlevel% neq 0 goto erro

echo.
echo ================================
echo   PRONTO! Rode: npm run dev
echo   Acesse: http://localhost:3000
echo   Admin: admin@lojamvp.com
echo   Senha: Admin@123
echo ================================
goto fim

:erro
echo.
echo ERRO no passo acima. Me mande um print.

:fim
