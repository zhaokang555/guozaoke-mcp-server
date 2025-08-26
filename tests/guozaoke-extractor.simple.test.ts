import * as fs from 'fs/promises';
import { extractGuozaokeInfo } from '../src/guozaoke-extractor.js';

// 简单的断言函数
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`✅ ${message}`);
}


// 读取真实HTML文件的函数
async function createMockHtml(): Promise<string> {
  try {
    const htmlContent = await fs.readFile('tests/guozaoke.html', 'utf-8');
    return htmlContent;
  } catch (error) {
    throw new Error(`无法读取 tests/guozaoke.html 文件: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 开始运行过早客提取器单元测试\n');
  let testCount = 0;
  let passCount = 0;

  // 准备测试数据
  let sampleHtml: string;
  try {
    sampleHtml = await fs.readFile('tests/guozaoke.html', 'utf8');
  } catch (error) {
    console.log('⚠️  警告: tests/guozaoke.html 文件不存在，使用模拟HTML进行测试');
    sampleHtml = await createMockHtml();
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
    assert(result.hasOwnProperty('hotTopics'), 'Result should have hotTopics property');
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

    // 热门话题数组属性测试
    assert(Array.isArray(result.hotTopics), 'Hot topics should be array');
    passCount++;
  } catch (error) {
    console.error(`❌ extractGuozaokeInfo 数组属性测试失败: ${error.message}`);
  }

  // 用户信息测试已移除 - currentUser 属性在实际实现中不存在

  // 时间戳测试已移除 - extractedAt 属性在实际实现中不存在

  // 边界情况测试
  console.log('\n🔬 边界情况测试:');
  try {
    testCount++;
    const result = extractGuozaokeInfo('');

    assert(typeof result === 'object', 'Should handle empty HTML');
    assert(Array.isArray(result.topics), 'Empty HTML should return empty topics array');
    assert(result.topics.length === 0, 'Empty HTML should have no topics');
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
