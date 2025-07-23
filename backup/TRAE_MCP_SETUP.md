# 🚀 Configuração MCP para Trae AI

## ✅ Status da Configuração

- **Pacote MCP Supabase**: Instalado globalmente
- **Token de Acesso**: Configurado
- **Project Reference**: `yeizisgimwwwvestmhnj`
- **Modo**: Somente leitura (segurança)

## 📁 Arquivos de Configuração Criados

### 1. `.trae/mcp.json`
Configuração principal do MCP para Trae AI:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "@supabase/mcp-server-supabase@latest",
        "--project-ref",
        "yeizisgimwwwvestmhnj",
        "--read-only"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_4b696215d1f9ac55d5efb2d63974b3ffbc0cd192"
      }
    }
  }
}
```

### 2. `.trae/config.json`
Configuração alternativa (caso o Trae use formato diferente):

```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "command": "npx",
        "args": [
          "@supabase/mcp-server-supabase@latest",
          "--project-ref",
          "yeizisgimwwwvestmhnj",
          "--read-only"
        ],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "sbp_4b696215d1f9ac55d5efb2d63974b3ffbc0cd192"
        }
      }
    }
  }
}
```

## 🔧 Como Usar

Após a configuração, você pode usar comandos como:

### 📊 Consultas de Banco de Dados
- "Liste todas as tabelas do projeto"
- "Mostre a estrutura da tabela usuarios"
- "Execute uma consulta para buscar os últimos 10 registros de emocoes"

### 🛠️ Gerenciamento
- "Gere os tipos TypeScript para o banco de dados"
- "Mostre os logs de erro do projeto"
- "Verifique advisors de segurança"

### 📈 Análise de Dados
- "Quantos usuários estão cadastrados?"
- "Quais são os hábitos mais populares?"
- "Mostre estatísticas de uso das emoções"

## ⚠️ Problemas Conhecidos

### Erro de Project Reference
Se você ver erros como "Project reference in URL is not valid", pode ser:

1. **Configuração do Trae**: O Trae AI pode ter um formato específico de configuração MCP
2. **Cache do Sistema**: Reinicie o Trae AI após alterar configurações
3. **Permissões**: Verifique se o token tem as permissões corretas

### Soluções Testadas

✅ **Instalação global do pacote**
```bash
npm install -g @supabase/mcp-server-supabase
```

✅ **Múltiplos formatos de configuração**
- Criados arquivos `.trae/mcp.json` e `.trae/config.json`
- Testados diferentes formatos de argumentos

✅ **Token válido**
- Token: `sbp_4b696215d1f9ac55d5efb2d63974b3ffbc0cd192`
- Project-ref: `yeizisgimwwwvestmhnj`

## 🔄 Próximos Passos

1. **Reiniciar o Trae AI** para carregar as novas configurações
2. **Testar comandos simples** como "Liste as tabelas"
3. **Verificar logs** se houver erros
4. **Contatar suporte do Trae** se o problema persistir

## 📞 Suporte

Se o MCP não funcionar:

1. Verifique se o Trae AI suporta MCP nativamente
2. Consulte a documentação oficial do Trae sobre MCP
3. Teste a configuração em outro IDE (Cursor/VS Code) para validar

## 🔗 Links Úteis

- [Documentação MCP Supabase](https://supabase.com/docs/guides/getting-started/mcp)
- [Trae AI Documentation](https://trae.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Status**: Configuração completa, aguardando teste no Trae AI
**Última atualização**: 27/01/2025