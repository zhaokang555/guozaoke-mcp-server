import * as fs from 'fs/promises';
import { readHtmlFile, extractGuozaokeInfo, extractGuozaokeInfoFromFile } from '../src/guozaoke-extractor.js';

// 简单的断言函数
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`✅ ${message}`);
}

// 异步断言函数
async function assertRejects(promise: Promise<any>, message: string) {
  try {
    await promise;
    throw new Error(`❌ ${message} - Expected rejection but promise resolved`);
  } catch (error) {
    if (error.message.includes('Expected rejection')) {
      throw error;
    }
    console.log(`✅ ${message}`);
  }
}

// 模拟HTML生成函数
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
          <img class="avatar" src="/avatar/test.png" alt="">
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

async function runTests() {
  console.log('🚀 开始运行过早客提取器单元测试\n');
  let testCount = 0;
  let passCount = 0;

  // 准备测试数据
  let sampleHtml: string;
  try {
    sampleHtml = await fs.readFile('guozaoke.html', 'utf8');
  } catch (error) {
    console.log('⚠️  警告: guozaoke.html 文件不存在，使用模拟HTML进行测试');
    sampleHtml = createMockHtml();
  }

  // 测试 readHtmlFile 函数
  console.log('📂 测试 readHtmlFile 函数:');
  try {
    testCount++;
    const testContent = '<html><body>Test</body></html>';
    const testFile = 'test-temp.html';

    await fs.writeFile(testFile, testContent);
    const result = await readHtmlFile(testFile);

    assert(result === testContent, 'readHtmlFile should read file content correctly');
    assert(typeof result === 'string', 'readHtmlFile should return string');
    passCount++;

    // 清理
    await fs.unlink(testFile);
  } catch (error) {
    console.error(`❌ readHtmlFile 测试失败: ${error.message}`);
  }

  try {
    testCount++;
    await assertRejects(readHtmlFile('non-existent-file.html'), 'readHtmlFile should reject for non-existent file');
    passCount++;
  } catch (error) {
    console.error(`❌ readHtmlFile 错误处理测试失败: ${error.message}`);
  }

  // 测试 extractGuozaokeInfo 函数
  console.log('\n🔍 测试 extractGuozaokeInfo 函数:');
  try {
    testCount++;
    const result = extractGuozaokeInfo(sampleHtml);

    // 基本结构测试
    assert(typeof result === 'object', 'extractGuozaokeInfo should return object');
    assert(result.hasOwnProperty('site'), 'Result should have site property');
    assert(result.hasOwnProperty('topics'), 'Result should have topics property');
    assert(result.hasOwnProperty('currentUser'), 'Result should have currentUser property');
    assert(result.hasOwnProperty('extractedAt'), 'Result should have extractedAt property');
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 基本结构测试失败: ${error.message}`);
  }

  try {
    testCount++;
    const result = extractGuozaokeInfo(sampleHtml);

    // 网站信息测试
    assert(typeof result.site.title === 'string', 'Site title should be string');
    assert(result.site.title.length > 0, 'Site title should not be empty');
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 网站信息测试失败: ${error.message}`);
  }

  try {
    testCount++;
    const result = extractGuozaokeInfo(sampleHtml);

    // 话题列表测试
    assert(Array.isArray(result.topics), 'Topics should be array');
    assert(result.totalTopics === result.topics.length, 'Total topics should match array length');

    if (result.topics.length > 0) {
      const firstTopic = result.topics[0];
      assert(typeof firstTopic.id === 'number', 'Topic ID should be number');
      assert(typeof firstTopic.title === 'string', 'Topic title should be string');
      assert(typeof firstTopic.replyCount === 'number', 'Reply count should be number');
      assert(firstTopic.replyCount >= 0, 'Reply count should be non-negative');
    }
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 话题列表测试失败: ${error.message}`);
  }

  try {
    testCount++;
    const result = extractGuozaokeInfo(sampleHtml);

    // 其他数组属性测试
    assert(Array.isArray(result.hotTopics), 'Hot topics should be array');
    assert(Array.isArray(result.nodeCategories), 'Node categories should be array');
    assert(Array.isArray(result.hotNodes), 'Hot nodes should be array');
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 数组属性测试失败: ${error.message}`);
  }

  try {
    testCount++;
    const result = extractGuozaokeInfo(sampleHtml);

    // 用户信息测试
    const user = result.currentUser;
    assert(typeof user.topics === 'number', 'User topics should be number');
    assert(typeof user.replies === 'number', 'User replies should be number');
    assert(typeof user.favorites === 'number', 'User favorites should be number');
    assert(typeof user.reputation === 'number', 'User reputation should be number');
    assert(user.topics >= 0, 'User topics should be non-negative');
    assert(user.replies >= 0, 'User replies should be non-negative');
    assert(user.favorites >= 0, 'User favorites should be non-negative');
    assert(user.reputation >= 0, 'User reputation should be non-negative');
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 用户信息测试失败: ${error.message}`);
  }

  try {
    testCount++;
    const result = extractGuozaokeInfo(sampleHtml);

    // 时间戳测试
    const date = new Date(result.extractedAt);
    assert(!isNaN(date.getTime()), 'Extracted timestamp should be valid date');
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 时间戳测试失败: ${error.message}`);
  }

  // 边界情况测试
  console.log('\n🔬 边界情况测试:');
  try {
    testCount++;
    const result = extractGuozaokeInfo('');

    assert(typeof result === 'object', 'Should handle empty HTML');
    assert(Array.isArray(result.topics), 'Empty HTML should return empty topics array');
    assert(result.topics.length === 0, 'Empty HTML should have no topics');
    assert(result.totalTopics === 0, 'Empty HTML should have zero total topics');
    passCount++;
  } catch (error) {
    console.error(`❌ 空HTML测试失败: ${error.message}`);
  }

  try {
    testCount++;
    const malformedHtml = '<html><body><div class="topic-item"><broken>';
    const result = extractGuozaokeInfo(malformedHtml);

    assert(typeof result === 'object', 'Should handle malformed HTML without throwing');
    passCount++;
  } catch (error) {
    console.error(`❌ 畸形HTML测试失败: ${error.message}`);
  }

  // 测试 extractGuozaokeInfoFromFile 函数
  console.log('\n📄 测试 extractGuozaokeInfoFromFile 函数:');
  try {
    testCount++;
    const testContent = createMockHtml();
    const testFile = 'test-combined.html';

    await fs.writeFile(testFile, testContent);
    const result = await extractGuozaokeInfoFromFile(testFile);

    assert(typeof result === 'object', 'extractGuozaokeInfoFromFile should return object');
    assert(result.hasOwnProperty('site'), 'Result should have site property');
    assert(result.hasOwnProperty('topics'), 'Result should have topics property');
    assert(typeof result.extractedAt === 'string', 'Result should have valid timestamp');
    passCount++;

    // 清理
    await fs.unlink(testFile);
  } catch (error) {
    console.error(`❌ extractGuozaokeInfoFromFile 测试失败: ${error.message}`);
  }

  try {
    testCount++;
    await assertRejects(
      extractGuozaokeInfoFromFile('non-existent-file.html'),
      'extractGuozaokeInfoFromFile should reject for non-existent file'
    );
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfoFromFile 错误处理测试失败: ${error.message}`);
  }

  // 测试结果总结
  console.log(`\n📊 测试结果总结:`);
  console.log(`总测试数: ${testCount}`);
  console.log(`通过测试: ${passCount}`);
  console.log(`失败测试: ${testCount - passCount}`);
  console.log(`通过率: ${((passCount / testCount) * 100).toFixed(1)}%`);

  if (passCount === testCount) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n❌ 有测试失败，请检查上述错误信息');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
