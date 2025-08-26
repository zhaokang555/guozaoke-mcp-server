# MCP (Model Context Protocol) JavaScript 开发指南

## 目录
1. [MCP 简介](#mcp-简介)
2. [环境准备](#环境准备)
3. [快速开始](#快速开始)
4. [核心概念](#核心概念)
5. [实战示例](#实战示例)
6. [测试和调试](#测试和调试)
7. [部署和集成](#部署和集成)

## MCP 简介

Model Context Protocol (MCP) 是一个开放的通信协议，用于连接 AI 系统（如 Claude）与外部数据源和工具。它提供了一个标准化的方式来：

- **暴露数据** - 通过 Resources 向 LLM 提供信息
- **提供功能** - 通过 Tools 执行操作和产生副作用
- **定义交互模式** - 通过 Prompts 创建可重用的交互模板

### 架构概览

```
┌─────────────┐         stdio/HTTP         ┌─────────────┐
│   Claude    │ ◄──────────────────────────► │ MCP Server  │
│  (Client)   │         JSON-RPC            │   (Your     │
│             │                             │   Service)  │
└─────────────┘                             └─────────────┘
```

## 环境准备

### 系统要求
- Node.js v18.0 或更高版本
- npm 或 yarn 包管理器
- TypeScript（推荐）

### 安装依赖

```bash
# 创建项目目录
mkdir mcp-demo-server
cd mcp-demo-server

# 初始化 npm 项目
npm init -y

# 安装核心依赖
npm install @modelcontextprotocol/sdk zod

# 安装开发依赖
npm install --save-dev typescript @types/node tsx
```

## 快速开始

### 1. 创建基础服务器

创建 `src/index.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 创建服务器实例
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
  description: "我的第一个 MCP 服务器"
});

// 注册一个网页数据获取工具
server.registerTool(
  "fetch-data",
  {
    title: "Fetch Web Data",
    description: "从网页获取结构化数据",
    inputSchema: {
      url: z.string().url().describe("要获取的网页URL")
    }
  },
  async ({ url }) => {
    // 网页数据获取逻辑
    return {
      content: [
        {
          type: "text",
          text: `成功获取数据: ${url}`
        }
      ]
    };
  }
);

// 启动 stdio 传输
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP 服务器已启动");
}

main().catch(console.error);
```

### 2. 配置 TypeScript

创建 `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. 添加启动脚本

更新 `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "inspect": "npx @modelcontextprotocol/inspector tsx src/index.ts"
  }
}
```

## 核心概念

### Tools (工具)

工具允许 LLM 执行操作和产生副作用：

```typescript
// 数学计算工具示例
server.registerTool(
  "calculate",
  {
    title: "计算器",
    description: "执行数学计算",
    inputSchema: z.object({
      operation: z.enum(["add", "subtract", "multiply", "divide"]),
      a: z.number().describe("第一个数字"),
      b: z.number().describe("第二个数字")
    })
  },
  async ({ operation, a, b }) => {
    let result: number;
    
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) {
          throw new Error("除数不能为零");
        }
        result = a / b;
        break;
    }
    
    return {
      content: [
        {
          type: "text",
          text: `结果: ${result}`
        }
      ]
    };
  }
);
```

### Resources (资源)

资源向 LLM 暴露数据：

```typescript
// 静态资源示例
server.registerStaticResource({
  uri: "config://settings",
  name: "应用设置",
  description: "当前应用配置",
  mimeType: "application/json",
  text: JSON.stringify({
    theme: "dark",
    language: "zh-CN",
    debug: false
  }, null, 2)
});

// 动态资源示例
server.registerDynamicResource({
  uriTemplate: "time://current",
  name: "当前时间",
  description: "获取当前时间信息",
  handler: async (uri) => {
    const now = new Date();
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: `当前时间: ${now.toLocaleString('zh-CN')}`
        }
      ]
    };
  }
});
```

### Prompts (提示)

提示提供可重用的交互模板：

```typescript
server.registerPrompt({
  name: "code-review",
  description: "代码审查模板",
  arguments: [
    {
      name: "language",
      description: "编程语言",
      required: true
    },
    {
      name: "code",
      description: "要审查的代码",
      required: true
    }
  ],
  handler: async ({ language, code }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `请审查以下 ${language} 代码：\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n请提供改进建议。`
          }
        }
      ]
    };
  }
});
```

## 实战示例

### 完整的文件操作服务器

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

const server = new McpServer({
  name: "file-server",
  version: "1.0.0",
  description: "文件操作 MCP 服务器"
});

// 读取文件工具
server.registerTool(
  "read-file",
  {
    title: "读取文件",
    description: "读取指定路径的文件内容",
    inputSchema: z.object({
      filePath: z.string().describe("文件路径")
    })
  },
  async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: content
          }
        ]
      };
    } catch (error) {
      throw new Error(`无法读取文件: ${error.message}`);
    }
  }
);

// 写入文件工具
server.registerTool(
  "write-file",
  {
    title: "写入文件",
    description: "将内容写入指定文件",
    inputSchema: z.object({
      filePath: z.string().describe("文件路径"),
      content: z.string().describe("要写入的内容"),
      append: z.boolean().optional().describe("是否追加到文件末尾")
    })
  },
  async ({ filePath, content, append = false }) => {
    try {
      if (append) {
        await fs.appendFile(filePath, content);
      } else {
        await fs.writeFile(filePath, content);
      }
      return {
        content: [
          {
            type: "text",
            text: `文件 ${append ? '追加' : '写入'} 成功: ${filePath}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`写入文件失败: ${error.message}`);
    }
  }
);

// 列出目录内容
server.registerTool(
  "list-directory",
  {
    title: "列出目录",
    description: "列出指定目录的内容",
    inputSchema: z.object({
      dirPath: z.string().describe("目录路径")
    })
  },
  async ({ dirPath }) => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const formatted = items.map(item => {
        const type = item.isDirectory() ? "[目录]" : "[文件]";
        return `${type} ${item.name}`;
      }).join("\n");
      
      return {
        content: [
          {
            type: "text",
            text: formatted
          }
        ]
      };
    } catch (error) {
      throw new Error(`无法列出目录: ${error.message}`);
    }
  }
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("文件操作 MCP 服务器已启动");
}

main().catch(console.error);
```

## 测试和调试

### 使用 MCP Inspector

MCP Inspector 是一个 Web 界面调试工具：

```bash
# 启动 Inspector
npm run inspect

# 或直接运行
npx @modelcontextprotocol/inspector tsx src/index.ts
```

访问浏览器中显示的 URL，可以：
- 查看注册的工具、资源和提示
- 测试工具调用
- 查看请求/响应日志
- 调试错误

### 单元测试示例

```typescript
// test/server.test.ts
import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("MCP Server", () => {
  it("应该正确初始化", () => {
    const server = new McpServer({
      name: "test-server",
      version: "1.0.0"
    });
    
    expect(server).toBeDefined();
  });
  
  it("应该能注册工具", () => {
    const server = new McpServer({
      name: "test-server",
      version: "1.0.0"
    });
    
    server.registerTool("test-tool", {
      title: "Test",
      inputSchema: z.object({})
    }, async () => ({
      content: [{ type: "text", text: "test" }]
    }));
    
    // 验证工具已注册
    expect(server.getTools()).toHaveLength(1);
  });
});
```

## 部署和集成

### Claude Desktop 集成

1. 找到 Claude Desktop 配置文件：
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. 添加服务器配置：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/your/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

3. 重启 Claude Desktop

### 使用 npm 包发布

1. 更新 `package.json`:

```json
{
  "name": "@yourname/mcp-server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "bin": {
    "mcp-server": "dist/index.js"
  },
  "files": [
    "dist/**/*"
  ]
}
```

2. 添加 shebang 到 `src/index.ts`:

```typescript
#!/usr/bin/env node
// ... 其余代码
```

3. 发布到 npm:

```bash
npm run build
npm publish
```

### 错误处理最佳实践

```typescript
// 全局错误处理
process.on("unhandledRejection", (reason, promise) => {
  console.error("未处理的 Promise 拒绝:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("未捕获的异常:", error);
  process.exit(1);
});

// 优雅关闭
process.on("SIGINT", async () => {
  console.error("收到 SIGINT，正在关闭...");
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("收到 SIGTERM，正在关闭...");
  await server.close();
  process.exit(0);
});
```

## 进阶主题

### 状态管理

```typescript
class ServerState {
  private data = new Map<string, any>();
  
  set(key: string, value: any) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key);
  }
  
  delete(key: string) {
    return this.data.delete(key);
  }
}

const state = new ServerState();

// 在工具中使用状态
server.registerTool(
  "save-data",
  {
    inputSchema: z.object({
      key: z.string(),
      value: z.any()
    })
  },
  async ({ key, value }) => {
    state.set(key, value);
    return {
      content: [{ type: "text", text: `已保存: ${key}` }]
    };
  }
);
```

### 认证和授权

```typescript
// 使用环境变量进行简单认证
const API_KEY = process.env.MCP_API_KEY;

server.registerTool(
  "secure-operation",
  {
    inputSchema: z.object({
      apiKey: z.string(),
      action: z.string()
    })
  },
  async ({ apiKey, action }) => {
    if (apiKey !== API_KEY) {
      throw new Error("认证失败");
    }
    
    // 执行安全操作
    return {
      content: [{ type: "text", text: "操作成功" }]
    };
  }
);
```

### 性能优化

```typescript
// 使用缓存减少重复计算
const cache = new Map<string, any>();

server.registerTool(
  "expensive-operation",
  {
    inputSchema: z.object({
      input: z.string()
    })
  },
  async ({ input }) => {
    const cacheKey = `operation:${input}`;
    
    if (cache.has(cacheKey)) {
      return {
        content: [{
          type: "text",
          text: cache.get(cacheKey)
        }]
      };
    }
    
    // 执行昂贵的操作
    const result = await performExpensiveOperation(input);
    cache.set(cacheKey, result);
    
    return {
      content: [{ type: "text", text: result }]
    };
  }
);
```

## 常见问题

### Q: 如何处理大文件？

使用流式处理：

```typescript
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";

server.registerTool(
  "process-large-file",
  {
    inputSchema: z.object({
      filePath: z.string()
    })
  },
  async ({ filePath }) => {
    const stream = createReadStream(filePath, { encoding: "utf-8" });
    let lineCount = 0;
    
    for await (const chunk of stream) {
      lineCount += chunk.split("\n").length;
    }
    
    return {
      content: [{
        type: "text",
        text: `文件包含 ${lineCount} 行`
      }]
    };
  }
);
```

### Q: 如何实现异步操作？

MCP 原生支持异步操作：

```typescript
server.registerTool(
  "async-fetch",
  {
    inputSchema: z.object({
      url: z.string().url()
    })
  },
  async ({ url }) => {
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data, null, 2)
      }]
    };
  }
);
```

### Q: 如何调试服务器？

1. 使用 console.error（不是 console.log）输出日志
2. 使用 MCP Inspector 查看实时交互
3. 添加详细的错误信息

```typescript
server.registerTool(
  "debug-tool",
  {
    inputSchema: z.object({ input: z.string() })
  },
  async ({ input }) => {
    console.error(`[DEBUG] 收到输入: ${input}`);
    
    try {
      const result = await processInput(input);
      console.error(`[DEBUG] 处理成功: ${result}`);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      console.error(`[ERROR] 处理失败:`, error);
      throw error;
    }
  }
);
```

## 资源链接

- [官方 TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP 规范文档](https://modelcontextprotocol.io/specification)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [示例服务器集合](https://github.com/modelcontextprotocol/servers)
- [Claude Desktop 文档](https://claude.ai/desktop)

## 总结

MCP 提供了一个强大而灵活的框架，用于扩展 AI 系统的能力。通过本指南，你应该能够：

1. ✅ 理解 MCP 的核心概念
2. ✅ 创建基础的 MCP 服务器
3. ✅ 实现工具、资源和提示
4. ✅ 测试和调试服务器
5. ✅ 集成到 Claude Desktop
6. ✅ 处理常见的开发场景

继续探索和实验，创建适合你特定需求的 MCP 服务器！