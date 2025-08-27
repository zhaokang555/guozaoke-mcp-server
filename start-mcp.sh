#!/bin/bash
# MCP Server 启动脚本
cd "/Users/kang.zhao/zk/2025/guozaoke-mcp-server" || exit 1
exec /Users/kang.zhao/.nvm/versions/node/v20.11.1/bin/node /Users/kang.zhao/zk/2025/guozaoke-mcp-server/node_modules/.bin/tsx /Users/kang.zhao/zk/2025/guozaoke-mcp-server/src/index.ts