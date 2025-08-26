# MCP 服务器测试命令

## 启动和测试命令

### 1. 开发模式启动
```bash
npm run dev
```

### 2. 生产模式启动
```bash
npm run build
npm start
```

### 3. 使用 MCP Inspector 调试
```bash
npm run inspect
```
然后在浏览器中打开显示的 URL

## 可用的工具测试

当服务器运行后，你可以在 MCP Inspector 中测试以下功能：

### Tools (工具)

1. **fetch-guozaoke** - 获取过早客论坛信息
   - 参数: `{ "url": "https://www.guozaoke.com/" }` (可选，默认为首页)
   - 输出: 结构化的论坛数据，包括热门话题、节点分类、社区统计等

### Resources (资源)

- **config://server-info** - 服务器信息
  - 包含服务器配置和元数据

### Prompts (提示模板)

- **friendly-assistant** - 友好助手模板
  - 参数: `{ "topic": "编程" }`
  - 生成友好的对话提示

## Claude Desktop 集成配置

将以下配置添加到 Claude Desktop 配置文件：

```json
{
  "mcpServers": {
    "demo-server": {
      "command": "node",
      "args": ["/Users/kang.zhao/zk/2025/learn-mcp/dist/index.js"],
      "cwd": "/Users/kang.zhao/zk/2025/learn-mcp"
    }
  }
}
```

或者使用开发模式：

```json
{
  "mcpServers": {
    "demo-server": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/kang.zhao/zk/2025/learn-mcp"
    }
  }
}
```

配置文件位置：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`