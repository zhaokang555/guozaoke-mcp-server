/** @type {import('jest').Config} */
export default {
  // 使用 ts-jest 预设来处理 TypeScript
  preset: 'ts-jest/presets/default-esm',
  
  // 设置测试环境为 Node.js
  testEnvironment: 'node',
  
  // 支持 ES modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // TypeScript 配置
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // 模块名称映射（处理 .js 导入 .ts 文件的情况）
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js'
  ],
  
  // 收集覆盖率的文件
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'  // 排除主入口文件
  ],
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 测试超时时间（毫秒）
  testTimeout: 10000,
  
  // 详细输出
  verbose: true,
  
  // 在测试运行前清理模拟
  clearMocks: true,
  
  // 在每次测试后恢复模拟
  restoreMocks: true
};