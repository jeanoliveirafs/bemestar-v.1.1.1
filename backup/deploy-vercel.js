#!/usr/bin/env node

/**
 * Script automatizado para deploy no Vercel
 * Executa build, testes básicos e deploy em produção
 * 
 * Uso: npm run deploy:auto
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy automatizado para Vercel...');

// Função para executar comandos com log
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro em: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Função para verificar arquivos essenciais
function checkEssentialFiles() {
  console.log('\n🔍 Verificando arquivos essenciais...');
  
  const essentialFiles = [
    'package.json',
    'vercel.json',
    'src/main.tsx',
    'src/App.tsx',
    'index.html'
  ];
  
  for (const file of essentialFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      console.error(`❌ Arquivo essencial não encontrado: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ Todos os arquivos essenciais estão presentes!');
}

// Função para verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log('\n🔧 Verificando configuração do Vercel...');
  
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (!vercelConfig.env || !vercelConfig.env.VITE_SUPABASE_URL) {
    console.error('❌ Variáveis de ambiente não configuradas no vercel.json');
    process.exit(1);
  }
  
  console.log('✅ Configuração do Vercel está correta!');
}

// Função principal
function main() {
  try {
    // Verificações pré-deploy
    checkEssentialFiles();
    checkEnvironmentVariables();
    
    // Limpeza e instalação
    runCommand('npm ci', 'Instalando dependências');
    
    // Verificação de tipos
    runCommand('npm run type-check', 'Verificando tipos TypeScript');
    
    // Build da aplicação
    runCommand('npm run build', 'Construindo aplicação para produção');
    
    // Deploy no Vercel
    console.log('\n🌐 Fazendo deploy no Vercel...');
    console.log('📝 Nota: Se for o primeiro deploy, você precisará fazer login no Vercel CLI');
    
    runCommand('npx vercel --prod', 'Deploy no Vercel');
    
    console.log('\n🎉 Deploy concluído com sucesso!');
    console.log('🔗 Sua aplicação está disponível em: https://appbemestarnovo.vercel.app');
    console.log('📊 Monitore o status em: https://vercel.com/dashboard');
    
  } catch (error) {
    console.error('\n❌ Erro durante o deploy:', error.message);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { main, runCommand, checkEssentialFiles, checkEnvironmentVariables };