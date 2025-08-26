# MCP Demo Server

一个简单的 MCP (Model Context Protocol) 服务器示例，演示了如何使用 JavaScript/TypeScript 创建 MCP 服务器。

## 功能特性

这个示例服务器提供了以下功能：

### 工具 (Tools)
- **hello**: 个性化问候工具
- **calculate**: 基本数学计算器（加减乘除）
- **current-time**: 获取当前时间（支持时区）

### 资源 (Resources)
- **config://server-info**: 服务器配置信息

### 提示模板 (Prompts)
- **friendly-assistant**: 友好助手提示模板

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式运行
```bash
npm run dev
```

### 3. 构建项目
```bash
npm run build
```

### 4. 生产模式运行
```bash
npm start
```

### 5. 使用 MCP Inspector 调试
```bash
npm run inspect
```

然后在浏览器中打开显示的 URL 进行调试。

## 集成到 Claude Desktop

1. 找到 Claude Desktop 配置文件：
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. 添加服务器配置：

**推荐配置（使用绝对路径）：**
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

**或使用启动脚本（更简洁）：**
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

**注意**: 
- 将 `/path/to/this/project` 替换为项目实际路径
- 将 `/Users/your-username/.nvm/versions/node/v20.11.1/bin/node` 中的用户名和Node.js版本替换为你的实际路径
- 如果遇到Node.js版本冲突，推荐使用绝对路径或启动脚本

3. 重启 Claude Desktop

## 故障排除

### Node.js 版本冲突
如果遇到以下错误：
- `npm ERR! enoent ENOENT: no such file or directory, open '/package.json'`
- `ERROR: npm v10.2.4 is known not to run on Node.js v10.16.3`

**解决方案**：
1. 使用绝对路径配置（见上方推荐配置）
2. 或使用项目提供的 `start-mcp.sh` 启动脚本
3. 确保 Node.js 版本 >= 18.17.0 或 >= 20.5.0

## 项目结构

```
.
├── src/
│   └── index.ts          # 主服务器文件
├── dist/                 # 构建输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── mcp-development-guide.md  # 完整开发指南
└── README.md            # 本文件
```

## 示例用法

启动服务器后，你可以通过 Claude Desktop 使用以下功能：

- 问候: "使用 hello 工具向 Alice 问好"
- 计算: "用计算器工具计算 15 + 25"
- 时间: "获取北京时间"
- 查看服务器信息: "显示 config://server-info 资源"

## 开发说明

- 服务器使用 stdio 传输协议
- 支持错误处理和优雅关闭
- 包含完整的 TypeScript 类型定义
- 遵循 MCP 协议规范

## 更多信息

查看 `mcp-development-guide.md` 获取完整的开发指南和进阶用法。