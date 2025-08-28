#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import { extractGuozaokeInfo } from "./guozaoke-extractor.js";
import { extractTopicDetails } from "./guozaoke-topic-extractor.js";
import { isLoginPage } from './login-detector.js';

// 读取环境变量中的cookie
const COOKIE = process.env.GUOZAOKE_COOKIE || '';

// 创建 MCP 服务器实例
const server = new McpServer({
  name: "guozaoke-mcp-server",
  version: "1.0.2",
  description: "过早客论坛信息获取 MCP 服务器"
});


server.registerTool(
  "fetch-guozaoke-latest-topic-list",
  {
    title: "获取过早客最新的话题列表",
    description: "从过早客论坛网站获取最新的话题列表，支持分页浏览。",
    inputSchema: {
      page: z.number().int().positive().optional().describe("要获取的页码，默认为第1页")
    }
  },
  async ({ page }) => {
    try {
      const targetUrl = `https://www.guozaoke.com/?p=${page || 1}`;

      // 发起HTTP请求获取HTML内容
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      if (COOKIE) {
        headers['Cookie'] = COOKIE;
      }

      const response = await fetch(targetUrl, {
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
      }

      const htmlContent = await response.text();

      // 使用提取函数解析HTML并获取结构化数据
      const {site, topics} = extractGuozaokeInfo(htmlContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({site, topics}, null, 2)
          }
        ]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      return {
        content: [
          {
            type: "text",
            text: `❌ 获取过早客信息时发生错误: ${errorMessage}`
          }
        ]
      };
    }
  }
);

server.registerTool(
  "fetch-guozaoke-today-hot-topic-list",
  {
    title: "获取过早客今日热门话题列表",
    description: "从过早客论坛网站获取今日热门话题列表",
  },
  async () => {
    try {
      const targetUrl = `https://www.guozaoke.com/`;

      // 发起HTTP请求获取HTML内容
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      if (COOKIE) {
        headers['Cookie'] = COOKIE;
      }

      const response = await fetch(targetUrl, {
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
      }

      const htmlContent = await response.text();

      // 使用提取函数解析HTML并获取结构化数据
      const {site, hotTopics} = extractGuozaokeInfo(htmlContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({site, hotTopics}, null, 2)
          }
        ]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      return {
        content: [
          {
            type: "text",
            text: `❌ 获取过早客信息时发生错误: ${errorMessage}`
          }
        ]
      };
    }
  }
);

// 注册过早客话题详情获取工具
server.registerTool(
  "fetch-guozaoke-topic-details",
  {
    title: "获取过早客话题详情",
    description: "根据话题ID获取过早客论坛的话题详情，包括内容、回复和相关信息。",
    inputSchema: {
      topicId: z.number().int().positive().describe("话题ID，例如：123813")
    }
  },
  async ({ topicId }) => {
    try {
      const targetUrl = `https://www.guozaoke.com/t/${topicId}`;

      // 发起HTTP请求获取HTML内容
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      if (COOKIE) {
        headers['Cookie'] = COOKIE;
      }

      const response = await fetch(targetUrl, {
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
      }

      const htmlContent = await response.text();

      // 检查是否为登录页面
      if (isLoginPage(htmlContent)) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ 检测到登录页面，无法访问话题详情。请设置环境变量 GUOZAOKE_COOKIE 来提供登录凭据。`
            },
            {
              type: "text",
              text: JSON.stringify(headers, null, 2)
            },
            {
              type: "text",
              text: htmlContent
            }
          ]
        };
      }

      // 使用提取函数解析HTML并获取结构化数据
      const result = extractTopicDetails(htmlContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      return {
        content: [
          {
            type: "text",
            text: `❌ 获取话题详情时发生错误: ${errorMessage}`
          }
        ]
      };
    }
  }
);

// 注册一个静态资源
server.registerResource(
  "server-info",
  "config://server-info",
  {
    title: "服务器信息",
    description: "关于此 MCP 服务器的信息"
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify({
        name: "guozaoke-mcp-server",
        version: "1.0.2",
        features: ["过早客最新话题列表获取", "过早客今日热门话题获取", "话题详情和评论获取", "分页浏览支持"],
        author: "MCP 开发者",
        description: "过早客论坛信息获取 MCP 服务器",
        tools: ["fetch-guozaoke-latest-topic-list", "fetch-guozaoke-today-hot-topic-list", "fetch-guozaoke-topic-details"],
        prompts: ["show-latest-topic-list", "show-hot-topic-list", "show-topic-details"],
        created: new Date().toISOString()
      }, null, 2)
    }]
  })
);

// 注册最新话题列表展示提示模板
server.registerPrompt(
  "show-latest-topic-list",
  {
    title: "展示最新话题列表",
    description: "获取并展示过早客论坛的最新话题列表",
    argsSchema: {
      page: z.string().optional().describe("要获取的页码，默认为第1页")
    }
  },
  async ({ page }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `请使用 fetch-guozaoke-latest-topic-list 工具获取第${page || '1'}页的过早客论坛最新话题列表。确保展示所有话题。所有话题title使用原文。`
        }
      }
    ]
  })
);

// 注册今日热门话题列表展示提示模板
server.registerPrompt(
  "show-hot-topic-list",
  {
    title: "展示今日热门话题列表",
    description: "获取并展示过早客论坛的今日热门话题列表"
  },
  async () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "请使用 fetch-guozaoke-today-hot-topic-list 工具获取过早客论坛今日热门话题列表。确保展示所有热门话题。所有话题title使用原文。"
        }
      }
    ]
  })
);

// 注册话题详情展示提示模板
server.registerPrompt(
  "show-topic-details",
  {
    title: "展示话题详情",
    description: "获取并展示过早客论坛的话题详情和所有网友评论。必须提供topicOrder或topicTitle其中之一",
    argsSchema: {
      topicOrder: z.string().optional().describe("话题在列表中的顺序号（从1开始）"),
      topicTitle: z.string().optional().describe("话题标题（部分匹配）")
    }
  },
  async (args) => {
    // 验证只能提供其中一个参数
    const hasTopicOrder = args.topicOrder !== undefined && args.topicOrder.trim() !== "";
    const hasTopicTitle = args.topicTitle !== undefined && args.topicTitle.trim() !== "";

    if (!hasTopicOrder && !hasTopicTitle) {
      throw new Error("必须提供 topicOrder 或 topicTitle 其中之一");
    }

    if (hasTopicOrder && hasTopicTitle) {
      throw new Error("只能提供 topicOrder 或 topicTitle 其中之一，不能同时提供两个");
    }

    let instruction;
    if (hasTopicOrder) {
      const orderNum = parseInt(args.topicOrder!, 10);
      if (isNaN(orderNum) || orderNum < 1) {
        throw new Error("topicOrder 必须是大于0的整数");
      }
      instruction = `从上下文中获取话题列表，找到第${orderNum}个话题的ID，然后使用 fetch-guozaoke-topic-details 工具获取该话题的详细信息。`;
    } else {
      instruction = `从上下文中获取话题列表，根据标题"${args.topicTitle}"找到匹配的话题ID，然后使用 fetch-guozaoke-topic-details 工具获取该话题的详细信息。`;
    }

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${instruction}请以结构化的方式展示话题内容、所有网友的评论和回复。确保包含完整的讨论内容。`
          }
        }
      ]
    };
  }
);

// 错误处理
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
  console.error("收到 SIGINT，正在关闭服务器...");
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("收到 SIGTERM，正在关闭服务器...");
  await server.close();
  process.exit(0);
});

// 启动服务器
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP 服务器已启动并连接到 stdio 传输");
  } catch (error) {
    console.error("启动服务器时发生错误:", error);
    process.exit(1);
  }
}

main().catch(console.error);
