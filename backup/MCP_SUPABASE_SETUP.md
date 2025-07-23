# Configuração do Supabase MCP Server

## O que é MCP?

O Model Context Protocol (MCP) é um protocolo padrão que permite que modelos de linguagem (LLMs) interajam com recursos externos como o Supabase. Isso permite que assistentes de IA executem tarefas diretamente no seu banco de dados.

## Instalação

O pacote foi instalado globalmente:

```bash
npm install -g @supabase/mcp-server-supabase
```

## 📋 Configuração

### 1. Personal Access Token

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** → **Access Tokens**
3. Clique em **"Generate new token"**
4. Dê o nome "MCP Server"
5. Copie o token gerado

### 2. Configuração por IDE

#### Para Trae AI ✅ (CONFIGURADO)

Arquivo `.trae/mcp.json` já criado:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=yeizisgimwwwvestmhnj"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_4b696215d1f9ac55d5efb2d63974b3ffbc0cd192"
      }
    }
  }
}
```

#### Para Cursor

Crie o arquivo `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=yeizisgimwwwvestmhnj"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<seu-personal-access-token>"
      }
    }
  }
}
```

**IMPORTANTE**: Substitua `<seu-personal-access-token>` pelo token que você criou no passo 1.

### 3. Configuração em Outros IDEs

#### VS Code (Copilot)
Crie `.vscode/mcp.json`:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "supabase-access-token",
      "description": "Supabase personal access token",
      "password": true
    }
  ],
  "servers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only", "--project-ref=yeizisgimwwwvestmhnj"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${input:supabase-access-token}"
      }
    }
  }
}
```

#### Claude Desktop
Adicione ao arquivo de configuração do Claude:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=yeizisgimwwwvestmhnj"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<seu-personal-access-token>"
      }
    }
  }
}
```

## Funcionalidades Disponíveis

Com o MCP Server configurado, você poderá:

### 🗄️ Gerenciamento de Banco de Dados
- Listar tabelas e esquemas
- Executar consultas SQL
- Aplicar migrações
- Gerar tipos TypeScript

### 🚀 Gerenciamento de Projetos
- Criar novos projetos Supabase
- Buscar configurações do projeto
- Pausar e restaurar projetos

### 🔧 Desenvolvimento
- Criar branches de desenvolvimento
- Fazer merge de branches
- Reset de branches
- Rebase de branches

### 📊 Monitoramento
- Buscar logs do projeto
- Verificar advisors de segurança e performance
- Listar Edge Functions
- Deploy de Edge Functions

## Flags de Segurança

### --read-only
Restringe o servidor a operações apenas de leitura no banco de dados. **Recomendado por padrão**.

### --project-ref
Limita o acesso a um projeto específico. **Recomendado por padrão**.

## Exemplo de Uso

Após configurar, você pode pedir ao seu assistente de IA:

- "Liste todas as tabelas do meu projeto Supabase"
- "Execute uma consulta para buscar os últimos 10 usuários"
- "Crie uma migração para adicionar uma nova coluna"
- "Gere os tipos TypeScript para o meu banco de dados"
- "Mostre os logs de erro do projeto"

## Segurança

⚠️ **Importante**:
- Use apenas em ambiente de desenvolvimento
- Não compartilhe seu Personal Access Token
- Use a flag `--read-only` por padrão
- Limite o acesso a projetos específicos com `--project-ref`

## Troubleshooting

### Erro de Autenticação
- Verifique se o Personal Access Token está correto
- Confirme se o token não expirou

### Servidor não conecta
- Verifique se o Node.js está instalado
- Confirme se o `project-ref` está correto
- Reinicie o IDE após alterar a configuração

### Comandos não funcionam
- Verifique se o MCP está ativo no IDE
- Confirme se as permissões do token são adequadas

## Links Úteis

- [Documentação oficial do MCP Supabase](https://supabase.com/docs/guides/getting-started/mcp)
- [GitHub do projeto](https://github.com/supabase-community/supabase-mcp)
- [Documentação do Model Context Protocol](https://modelcontextprotocol.io/)