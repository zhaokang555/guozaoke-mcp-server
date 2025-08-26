import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import fs from 'fs/promises';
import { readHtmlFile, extractGuozaokeInfo, extractGuozaokeInfoFromFile } from '../src/guozaoke-extractor.js';

describe('Guozaoke Extractor', () => {
  let sampleHtml: string;
  
  beforeAll(async () => {
    // 读取测试用的HTML文件
    try {
      sampleHtml = await fs.readFile('guozaoke.html', 'utf8');
    } catch (error) {
      console.warn('Warning: guozaoke.html not found, using mock HTML for tests');
      sampleHtml = createMockHtml();
    }
  });

  describe('readHtmlFile', () => {
    it('should read a valid HTML file successfully', async () => {
      // 创建临时测试文件
      const testContent = '<html><body>Test</body></html>';
      const testFile = 'test-temp.html';
      
      await fs.writeFile(testFile, testContent);
      
      try {
        const result = await readHtmlFile(testFile);
        expect(result).toBe(testContent);
        expect(typeof result).toBe('string');
      } finally {
        // 清理临时文件
        await fs.unlink(testFile).catch(() => {});
      }
    });

    it('should throw error for non-existent file', async () => {
      await expect(readHtmlFile('non-existent-file.html'))
        .rejects
        .toThrow();
    });

    it('should handle empty file', async () => {
      const testFile = 'test-empty.html';
      await fs.writeFile(testFile, '');
      
      try {
        const result = await readHtmlFile(testFile);
        expect(result).toBe('');
      } finally {
        await fs.unlink(testFile).catch(() => {});
      }
    });
  });

  describe('extractGuozaokeInfo', () => {
    it('should extract basic site information', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('site');
      expect(result.site).toHaveProperty('title');
      expect(result.site).toHaveProperty('description');
      expect(result.site).toHaveProperty('keywords');
      
      expect(typeof result.site.title).toBe('string');
      expect(result.site.title.length).toBeGreaterThan(0);
    });

    it('should extract topics list with correct structure', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('topics');
      expect(Array.isArray(result.topics)).toBe(true);
      expect(result.totalTopics).toBe(result.topics.length);
      
      if (result.topics.length > 0) {
        const firstTopic = result.topics[0];
        expect(firstTopic).toHaveProperty('id');
        expect(firstTopic).toHaveProperty('title');
        expect(firstTopic).toHaveProperty('author');
        expect(firstTopic).toHaveProperty('node');
        expect(firstTopic).toHaveProperty('replyCount');
        
        expect(typeof firstTopic.id).toBe('number');
        expect(typeof firstTopic.title).toBe('string');
        expect(typeof firstTopic.replyCount).toBe('number');
        expect(firstTopic.author).toHaveProperty('username');
      }
    });

    it('should extract hot topics', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('hotTopics');
      expect(Array.isArray(result.hotTopics)).toBe(true);
      
      result.hotTopics.forEach(hotTopic => {
        expect(hotTopic).toHaveProperty('title');
        expect(hotTopic).toHaveProperty('author');
        expect(typeof hotTopic.title).toBe('string');
      });
    });

    it('should extract node categories', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('nodeCategories');
      expect(Array.isArray(result.nodeCategories)).toBe(true);
      
      result.nodeCategories.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('nodes');
        expect(typeof category.name).toBe('string');
        expect(Array.isArray(category.nodes)).toBe(true);
      });
    });

    it('should extract hot nodes', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('hotNodes');
      expect(Array.isArray(result.hotNodes)).toBe(true);
      
      result.hotNodes.forEach(node => {
        expect(node).toHaveProperty('name');
        expect(typeof node.name).toBe('string');
      });
    });

    it('should extract community statistics', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('communityStats');
      expect(typeof result.communityStats).toBe('object');
      
      // 检查常见的统计项
      const expectedKeys = ['注册成员', '节点', '主题', '回复'];
      const statsKeys = Object.keys(result.communityStats);
      
      expectedKeys.forEach(key => {
        if (statsKeys.includes(key)) {
          expect(typeof result.communityStats[key]).toBe('number');
        }
      });
    });

    it('should extract current user information', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('currentUser');
      expect(result.currentUser).toHaveProperty('username');
      expect(result.currentUser).toHaveProperty('topics');
      expect(result.currentUser).toHaveProperty('replies');
      expect(result.currentUser).toHaveProperty('favorites');
      expect(result.currentUser).toHaveProperty('reputation');
      
      expect(typeof result.currentUser.topics).toBe('number');
      expect(typeof result.currentUser.replies).toBe('number');
      expect(typeof result.currentUser.favorites).toBe('number');
      expect(typeof result.currentUser.reputation).toBe('number');
    });

    it('should include extraction timestamp', () => {
      const result = extractGuozaokeInfo(sampleHtml);
      
      expect(result).toHaveProperty('extractedAt');
      expect(typeof result.extractedAt).toBe('string');
      
      // 验证是有效的ISO日期字符串
      const date = new Date(result.extractedAt);
      expect(date).toBeInstanceOf(Date);
      expect(!isNaN(date.getTime())).toBe(true);
    });

    it('should handle empty HTML gracefully', () => {
      const result = extractGuozaokeInfo('');
      
      expect(result).toHaveProperty('site');
      expect(result).toHaveProperty('topics');
      expect(result).toHaveProperty('hotTopics');
      expect(result).toHaveProperty('nodeCategories');
      expect(result).toHaveProperty('hotNodes');
      expect(result).toHaveProperty('communityStats');
      expect(result).toHaveProperty('currentUser');
      expect(result).toHaveProperty('extractedAt');
      expect(result).toHaveProperty('totalTopics');
      
      expect(result.topics).toEqual([]);
      expect(result.hotTopics).toEqual([]);
      expect(result.nodeCategories).toEqual([]);
      expect(result.hotNodes).toEqual([]);
      expect(result.totalTopics).toBe(0);
    });

    it('should handle malformed HTML without throwing', () => {
      const malformedHtml = '<html><body><div class="topic-item"><broken>';
      
      expect(() => {
        extractGuozaokeInfo(malformedHtml);
      }).not.toThrow();
    });
  });

  describe('extractGuozaokeInfoFromFile', () => {
    it('should combine file reading and extraction successfully', async () => {
      const testContent = createMockHtml();
      const testFile = 'test-combined.html';
      
      await fs.writeFile(testFile, testContent);
      
      try {
        const result = await extractGuozaokeInfoFromFile(testFile);
        
        expect(result).toHaveProperty('site');
        expect(result).toHaveProperty('topics');
        expect(result).toHaveProperty('extractedAt');
        expect(typeof result.extractedAt).toBe('string');
      } finally {
        await fs.unlink(testFile).catch(() => {});
      }
    });

    it('should throw error for non-existent file', async () => {
      await expect(extractGuozaokeInfoFromFile('non-existent-file.html'))
        .rejects
        .toThrow();
    });
  });

  describe('Data Validation', () => {
    let result: any;

    beforeAll(() => {
      result = extractGuozaokeInfo(sampleHtml);
    });

    it('should have all required top-level properties', () => {
      const requiredProperties = [
        'site', 'currentUser', 'topics', 'hotTopics', 
        'nodeCategories', 'hotNodes', 'communityStats', 
        'extractedAt', 'totalTopics'
      ];
      
      requiredProperties.forEach(prop => {
        expect(result).toHaveProperty(prop);
      });
    });

    it('should have valid topic structure', () => {
      if (result.topics.length > 0) {
        const topic = result.topics[0];
        const requiredProps = ['id', 'title', 'author', 'node', 'lastTouched', 'replyCount'];
        
        requiredProps.forEach(prop => {
          expect(topic).toHaveProperty(prop);
        });
        
        expect(topic.author).toHaveProperty('username');
        expect(topic.node).toHaveProperty('name');
      }
    });

    it('should have non-negative reply counts', () => {
      result.topics.forEach((topic: any) => {
        expect(topic.replyCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid current user structure', () => {
      const user = result.currentUser;
      const numericProps = ['topics', 'replies', 'favorites', 'reputation'];
      
      numericProps.forEach(prop => {
        expect(typeof user[prop]).toBe('number');
        expect(user[prop]).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

// 辅助函数：创建模拟HTML用于测试
function createMockHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>过早客</title>
        <meta name="description" content="过早客测试描述">
        <meta name="keywords" content="过早客,测试">
      </head>
      <body>
        <div class="usercard">
          <div class="username">testuser</div>
          <div class="avatar" src="/avatar/test.png"></div>
        </div>
        
        <div class="status-topic"><strong><a>5</a></strong></div>
        <div class="status-reply"><strong><a>10</a></strong></div>
        <div class="status-favorite"><strong><a>2</a></strong></div>
        <div class="status-reputation"><strong>100</strong></div>
        
        <div class="topic-item">
          <img class="avatar" src="/avatar1.png" alt="">
          <div class="main">
            <h3 class="title">
              <a href="/t/1">测试话题1</a>
            </h3>
            <div class="meta">
              <span class="node"><a href="/node/test">测试节点</a></span>
              <span class="username"><a href="/u/user1">user1</a></span>
              <span class="last-touched">1分钟前</span>
              <span class="last-reply-username"><strong>replier1</strong></span>
            </div>
          </div>
          <div class="count"><a>5</a></div>
        </div>
        
        <div class="hot-topics">
          <div class="cell">
            <div class="hot_topic_title">
              <a href="/t/hot1">热门话题1</a>
            </div>
            <a><img src="/avatar2.png" alt=""></a>
          </div>
        </div>
        
        <div class="nodes-cloud">
          <ul>
            <li>
              <label>测试分类</label>
              <span class="nodes">
                <a href="/node/test1">测试节点1</a>
                <a href="/node/test2">测试节点2</a>
              </span>
            </li>
          </ul>
        </div>
        
        <div class="hot-nodes">
          <div class="ui-content">
            <a href="/node/hot1">热门节点1</a>
            <a href="/node/hot2">热门节点2</a>
          </div>
        </div>
        
        <div class="community-status">
          <dl>
            <dt>注册成员</dt>
            <dd>1000</dd>
          </dl>
          <dl>
            <dt>节点</dt>
            <dd>20</dd>
          </dl>
        </div>
      </body>
    </html>
  `;
}