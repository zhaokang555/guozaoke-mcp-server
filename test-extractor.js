import { readHtmlFile, extractGuozaokeInfo } from './src/guozaoke-extractor.js';

async function test() {
    try {
        const htmlContent = await readHtmlFile('guozaoke.html');

        const data = extractGuozaokeInfo(htmlContent);
        console.log('✓ 提取的话题数量:', data.totalTopics);
        console.log('✓ 网站标题:', data.site.title);
        console.log('✓ 当前用户:', data.currentUser.username);

        console.log('\n话题:');
        data.topics.forEach((topic, index) => {
            console.log(`${index + 1}. ${topic.title} - ${topic.author.username} (${topic.replyCount}回复)`);
        });

        console.log('\n✅ 测试完成！函数工作正常');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

test();
