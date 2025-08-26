#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import { extractGuozaokeInfo } from "./guozaoke-extractor.js";

// 创建 MCP 服务器实例
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
  description: "一个简单的 MCP 服务器示例"
});


// 注册过早客信息获取工具
server.registerTool(
  "fetch-guozaoke",
  {
    title: "获取过早客论坛信息",
    description: "从过早客论坛网站获取指定页面的话题、热门讨论、节点信息等结构化数据，支持分页功能",
    inputSchema: {
      page: z.number().int().positive().optional().describe("要获取的页码，默认为第1页")
    }
  },
  async ({ page }) => {
    try {
      const targetUrl = `https://www.guozaoke.com/?p=${page || 1}`;

      // 发起HTTP请求获取HTML内容
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
      }

      const htmlContent = await response.text();

      // 使用提取函数解析HTML并获取结构化数据
      const data = extractGuozaokeInfo(htmlContent);

      return {
        content: [
          {
            type: "text",
            text: `成功获取过早客论坛信息！（第 ${page || 1} 页）

📊 **基本统计**
- 话题总数: ${data.totalTopics}
- 注册成员: ${data.communityStats['注册成员'] || 'N/A'}
- 节点数: ${data.communityStats['节点'] || 'N/A'}
- 主题总数: ${data.communityStats['主题'] || 'N/A'}
- 回复总数: ${data.communityStats['回复'] || 'N/A'}

📝 **话题**
${data.topics.map((topic, index) => 
  `${index + 1}. ${topic.title} - ${topic.author.username} (${topic.replyCount}回复)`
).join('\n')}

📋 **节点分类**
${data.nodeCategories.map(category => 
  `${category.name}: ${category.nodes.map(node => node.name).join(', ')}`
).join('\n')}

⏰ 数据获取时间: ${data.extractedAt}`
          },
          {
            type: "text",
            text: `\n📄 **完整JSON数据:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
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
        name: "demo-server",
        version: "1.0.0",
        features: ["计算器", "问候", "时间查询"],
        author: "MCP 学习者",
        created: new Date().toISOString()
      }, null, 2)
    }]
  })
);

// 注册一个提示模板
server.registerPrompt(
  "friendly-assistant",
  {
    title: "友好助手",
    description: "友好助手的提示模板",
    argsSchema: {
      topic: z.string().describe("要讨论的话题")
    }
  },
  async ({ topic }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `请以友好和耐心的方式讨论关于"${topic}"的话题。请提供有用的信息并保持积极的态度。`
        }
      }
    ]
  })
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
