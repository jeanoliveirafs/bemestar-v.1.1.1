#!/usr/bin/env node

/**
 * Script automatizado para Git commits em cada atualização
 * Facilita o versionamento contínuo do projeto
 * 
 * Uso: npm run git:auto "mensagem do commit"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para executar comandos Git com log
function runGitCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const output = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ ${description} concluído!`);
    if (output.trim()) {
      console.log(`📄 Output: ${output.trim()}`);
    }
    return output;
  } catch (error) {
    console.error(`❌ Erro em: ${description}`);
    console.error(error.message);
    return null;
  }
}

// Função para verificar se é um repositório Git
function checkGitRepo() {
  if (!fs.existsSync('.git')) {
    console.log('\n🔧 Inicializando repositório Git...');
    runGitCommand('git init', 'Inicializar repositório Git');
    
    // Configurar remote se não existir
    const remoteUrl = 'https://github.com/jeanoliveirafs/bemestar-v.1.1.1.git';
    runGitCommand(`git remote add origin ${remoteUrl}`, 'Adicionar remote origin');
  }
}

// Função para verificar configuração do Git
function checkGitConfig() {
  console.log('\n🔍 Verificando configuração do Git...');
  
  try {
    const userName = execSync('git config user.name', { stdio: 'pipe', encoding: 'utf8' }).trim();
    const userEmail = execSync('git config user.email', { stdio: 'pipe', encoding: 'utf8' }).trim();
    
    if (!userName || !userEmail) {
      console.log('⚠️  Configuração do Git incompleta. Configure com:');
      console.log('git config --global user.name "Seu Nome"');
      console.log('git config --global user.email "seu@email.com"');
    } else {
      console.log(`✅ Git configurado para: ${userName} <${userEmail}>`);
    }
  } catch (error) {
    console.log('⚠️  Configure o Git primeiro:');
    console.log('git config --global user.name "Seu Nome"');
    console.log('git config --global user.email "seu@email.com"');
  }
}

// Função para gerar mensagem de commit automática
function generateCommitMessage(customMessage) {
  if (customMessage) {
    return customMessage;
  }
  
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  return `🚀 Atualização automática - ${timestamp}`;
}

// Função para verificar arquivos modificados
function checkModifiedFiles() {
  console.log('\n📁 Verificando arquivos modificados...');
  
  const status = runGitCommand('git status --porcelain', 'Verificar status do repositório');
  
  if (!status || status.trim() === '') {
    console.log('ℹ️  Nenhuma alteração detectada.');
    return false;
  }
  
  console.log('📝 Arquivos modificados:');
  status.split('\n').forEach(line => {
    if (line.trim()) {
      console.log(`   ${line}`);
    }
  });
  
  return true;
}

// Função principal para commit automático
function autoCommit(commitMessage) {
  console.log('🔄 Iniciando commit automático...');
  
  // Verificações iniciais
  checkGitRepo();
  checkGitConfig();
  
  // Verificar se há alterações
  if (!checkModifiedFiles()) {
    console.log('✨ Repositório já está atualizado!');
    return;
  }
  
  // Gerar mensagem de commit
  const message = generateCommitMessage(commitMessage);
  console.log(`\n💬 Mensagem do commit: "${message}"`);
  
  // Adicionar todos os arquivos
  runGitCommand('git add .', 'Adicionar arquivos ao staging');
  
  // Fazer commit
  runGitCommand(`git commit -m "${message}"`, 'Criar commit');
  
  // Push para o repositório remoto
  console.log('\n🌐 Enviando para o repositório remoto...');
  const pushResult = runGitCommand('git push origin main', 'Push para origin/main');
  
  if (pushResult === null) {
    console.log('\n🔄 Tentando push para master...');
    runGitCommand('git push origin master', 'Push para origin/master');
  }
  
  console.log('\n🎉 Commit automático concluído com sucesso!');
  console.log('📊 Verifique o repositório: https://github.com/jeanoliveirafs/bemestar-v.1.1.1');
}

// Função para commit + deploy
function commitAndDeploy(commitMessage) {
  console.log('🚀 Iniciando commit + deploy automático...');
  
  // Fazer commit primeiro
  autoCommit(commitMessage);
  
  // Aguardar um pouco
  console.log('\n⏳ Aguardando 3 segundos antes do deploy...');
  setTimeout(() => {
    console.log('\n🌐 Iniciando deploy no Vercel...');
    try {
      execSync('npm run deploy:quick', { stdio: 'inherit' });
      console.log('\n🎉 Commit + Deploy concluído!');
      console.log('🔗 App: https://appbemestarnovo.vercel.app');
      console.log('📊 Repo: https://github.com/jeanoliveirafs/bemestar-v.1.1.1');
    } catch (error) {
      console.error('❌ Erro no deploy:', error.message);
    }
  }, 3000);
}

// Executar script
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const message = args.slice(1).join(' ');
  
  switch (command) {
    case 'commit':
      autoCommit(message);
      break;
    case 'deploy':
      commitAndDeploy(message);
      break;
    default:
      autoCommit(args.join(' '));
      break;
  }
}

module.exports = { autoCommit, commitAndDeploy, checkGitRepo, checkGitConfig };