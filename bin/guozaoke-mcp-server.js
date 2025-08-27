#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 导入并运行主模块
try {
  await import(join(__dirname, '..', 'dist', 'index.js'));
} catch (error) {
  console.error('启动 guozaoke-mcp-server 时发生错误:', error.message);
  process.exit(1);
}