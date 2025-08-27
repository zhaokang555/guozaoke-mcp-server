# 过早客 MCP 服务器 (Guozaoke MCP Server)

一个专门用于获取过早客论坛信息的 MCP (Model Context Protocol) 服务器，可以通过 AI 助手访问过早客论坛的话题和内容。

## 安装

### 使用 npx（推荐）
无需安装，直接运行：
```bash
npx -y guozaoke-mcp-server
```

### 全局安装
```bash
npm install -g guozaoke-mcp-server
```

然后运行：
```bash
guozaoke-mcp-server
```

## 功能特性

这个 MCP 服务器提供了以下功能：

### 工具 (Tools)
- **fetch-guozaoke-topic-list**: 获取过早客论坛话题列表，支持分页浏览
- **fetch-guozaoke-topic-details**: 根据话题ID获取详细信息，包括内容和回复


### 提示模板 (Prompts)
- **show-topic-list**: 展示话题列表 - 获取并展示过早客论坛的话题列表
- **show-topic-details**: 展示话题详情 - 获取并展示过早客论坛的话题详情和所有网友评论

## 快速开始

### 使用 npx 运行（推荐）
```bash
# 直接运行，无需安装
npx -y guozaoke-mcp-server
```

### 全局安装后运行
```bash
# 安装
npm install -g guozaoke-mcp-server

# 运行
guozaoke-mcp-server
```

### 环境变量配置（可选）
如果需要访问需要登录的内容，可以设置 Cookie：

```bash
# 设置环境变量
export GUOZAOKE_COOKIE="session=abc123; auth_token=xyz789"

# 然后运行服务器
npx -y guozaoke-mcp-server
```


## 故障排除

### 网络问题
如果 npx 下载缓慢，可以使用国内镜像：
```bash
npx -y --registry=https://registry.npmmirror.com guozaoke-mcp-server
```

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

启动服务器后，你可以使用以下功能：

- 获取话题列表: "使用 fetch-guozaoke-topic-list 工具获取第1页话题"
- 获取话题详情: "使用 fetch-guozaoke-topic-details 工具获取话题ID为123813的详情"
- 查看服务器信息: "显示 config://server-info 资源"

## 开发说明

- 服务器使用 stdio 传输协议
- 支持错误处理和优雅关闭
- 包含完整的 TypeScript 类型定义
- 遵循 MCP 协议规范

## 更多信息

查看 `mcp-development-guide.md` 获取完整的开发指南和进阶用法。
