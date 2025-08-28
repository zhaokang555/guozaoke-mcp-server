# 过早客 MCP 服务器 (Guozaoke MCP Server)

一个专门用于获取过早客论坛信息的 MCP (Model Context Protocol) 服务器，可以通过 AI 助手访问过早客论坛的话题和内容。

## 效果

![today-hot.gif](screenshots/today-hot.gif)
![latest.gif](screenshots/latest.gif)
![fetch-guozaoke-topic-details.gif](screenshots/fetch-guozaoke-topic-details.gif)

## 快速开始

```bash
GUOZAOKE_COOKIE='...' npx -y guozaoke-mcp-server
```

or

```json
{
  "mcpServers": {
    "guozaoke-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "guozaoke-mcp-server"
      ],
      "env": {
        "GUOZAOKE_COOKIE": "..."
      }
    }
  }
}
```

## 功能特性

### 工具 (Tools)
- **fetch-guozaoke-latest-topic-list**: 获取过早客论坛最新话题列表，支持分页浏览。
- **fetch-guozaoke-today-hot-topic-list**: 获取过早客论坛今日热门话题列表。
- **fetch-guozaoke-topic-details**: 根据话题ID获取详细信息，包括内容和回复。支持检测登录状态，支持Cookie认证访问需要权限的内容。

### 提示模板 (Prompts)
- **show-latest-topic-list**: 展示最新话题列表
- **show-hot-topic-list**: 展示今日热门话题列表
- **show-topic-details**: 展示话题详情
