# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 MCP (Model Context Protocol) 服务器示例项目，使用 TypeScript 构建。MCP 是一个开放协议，用于连接 AI 系统与外部数据源和工具。

## 常用开发命令

### 基本命令
- `npm install` - 安装依赖
- `npm run dev` - 开发模式启动（使用 tsx 直接运行 TypeScript）
- `npm run build` - 构建项目到 dist/ 目录
- `npm start` - 生产模式启动（运行构建后的 JavaScript）
- `npm run inspect` - 启动 MCP Inspector 进行调试

### 调试工具
- **MCP Inspector**: `npm run inspect` 启动后在浏览器中打开显示的 URL，可以测试工具、资源和提示模板
- 服务器日志输出到 stderr（使用 console.error），避免与 stdio 传输协议冲突

## 代码架构

### 核心架构
这是一个基于 `@modelcontextprotocol/sdk` 的 MCP 服务器，使用 stdio 传输协议与客户端通信：

1. **McpServer**: 主服务器实例，管理工具、资源和提示模板的注册
2. **StdioServerTransport**: stdio 传输层，通过标准输入/输出与客户端通信
3. **Zod**: 用于输入验证和类型定义

### MCP 组件类型
- **Tools**: 执行操作的功能（如网页抓取、API 调用）
- **Resources**: 暴露数据的端点（类似 REST GET）
- **Prompts**: 可重用的对话模板

### 注册模式
所有 MCP 组件使用统一的注册模式：
```typescript
server.registerTool(name, config, handler)
server.registerResource(name, uri, config, handler)  
server.registerPrompt(name, config, handler)
```

### 输入验证
- `inputSchema` 字段使用对象形式：`{ field: z.string() }` 而非 `z.object({})`
- `argsSchema` (用于 prompts) 同样使用对象形式

### 错误处理
- 包含全局的 unhandledRejection 和 uncaughtException 处理
- 支持 SIGINT/SIGTERM 优雅关闭
- 工具内部错误通过 throw Error() 抛出

## Claude Desktop 集成

配置文件位置：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

推荐配置（避免 Node.js 版本冲突）：

**方案1 - 使用绝对路径：**
```json
{
  "mcpServers": {
    "demo-server": {
      "command": "/Users/your-username/.nvm/versions/node/v20.11.1/bin/node",
      "args": ["/path/to/this/project/node_modules/.bin/tsx", "/path/to/this/project/src/index.ts"],
      "cwd": "/path/to/this/project"
    }
  }
}
```

**方案2 - 使用启动脚本（推荐）：**
```json
{
  "mcpServers": {
    "demo-server": {
      "command": "/path/to/this/project/start-mcp.sh",
      "args": []
    }
  }
}
```

**方案3 - 如果确定环境无冲突：**
```json
{
  "mcpServers": {
    "demo-server": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/path/to/this/project"
    }
  }
}
```

## 项目文件结构

- `src/index.ts` - 主服务器文件，包含过早客论坛信息获取工具、资源和提示模板的定义
- `src/guozaoke-extractor.js` - 过早客论坛HTML解析器，用于提取结构化数据
- `start-mcp.sh` - MCP 服务器启动脚本，解决 Node.js 版本冲突
- `dist/` - TypeScript 构建输出目录
- `mcp-development-guide.md` - 完整的 MCP 开发指南文档
- `test-commands.md` - 测试命令和集成说明

## 开发注意事项

- 使用 ESM 模块系统（package.json 中 `"type": "module"`）
- 导入路径需包含 `.js` 扩展名（TypeScript ESM 要求）
- stdio 传输要求日志输出使用 stderr 而非 stdout
- 服务器启动后会阻塞等待客户端连接，这是正常行为

## 常见问题解决

### Claude Desktop 集成问题
- **Node.js 版本冲突**: 使用绝对路径或 `start-mcp.sh` 脚本
- **路径找不到**: 确保 `cwd` 指向正确的项目目录
- **权限问题**: 给 `start-mcp.sh` 添加执行权限：`chmod +x start-mcp.sh`
