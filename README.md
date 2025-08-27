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

### 工具 (Tools)
- **fetch-guozaoke-topic-list**: 获取过早客论坛话题列表，支持分页浏览
- **fetch-guozaoke-topic-details**: 根据话题ID获取详细信息，包括内容和回复


### 提示模板 (Prompts)
- **show-topic-list**: 展示话题列表
- **show-topic-details**: 展示话题详情


### 环境变量配置
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




## 开发说明

查看 `mcp-development-guide.md` 获取完整的开发指南。
