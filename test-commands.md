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

1. **fetch-guozaoke-topic-list** - 获取过早客话题列表
   - 参数: `{ "page": 1 }` (可选，默认为第1页)
   - 输出: 结构化的话题列表数据，包括话题标题、作者、回复数等

2. **fetch-guozaoke-topic-details** - 获取过早客话题详情
   - 参数: `{ "topicId": 123813 }` (必需，话题ID)
   - 输出: 话题详情和所有回复内容

### Resources (资源)

- **config://server-info** - 服务器信息
  - 包含服务器配置和元数据

### Prompts (提示模板)

1. **show-topic-list** - 展示话题列表
   - 参数: `{ "page": "1" }` (可选，默认为第1页)
   - 获取并展示过早客论坛的话题列表

2. **show-topic-details** - 展示话题详情
   - 参数: `{ "topicOrder": "1" }` 或 `{ "topicTitle": "部分标题" }`
   - 获取并展示话题详情和所有网友评论

## Claude Desktop 集成配置

将以下配置添加到 Claude Desktop 配置文件：

```json
{
  "mcpServers": {
    "guozaoke-mcp-server": {
      "command": "node",
      "args": ["/Users/kang.zhao/zk/2025/guozaoke-mcp-server/dist/index.js"],
      "cwd": "/Users/kang.zhao/zk/2025/guozaoke-mcp-server"
    }
  }
}
```

或者使用开发模式：

```json
{
  "mcpServers": {
    "guozaoke-mcp-server": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/kang.zhao/zk/2025/guozaoke-mcp-server"
    }
  }
}
```

配置文件位置：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`