import * as cheerio from 'cheerio';

// 定义接口类型
interface SiteInfo {
    title: string;
    description?: string;
    keywords?: string;
}

interface Author {
    username: string;
    profileUrl?: string;
    avatar?: string;
}

interface Node {
    name: string;
    url?: string;
}

interface Topic {
    id: number;
    number: number;
    title: string;
    url?: string;
    author: Author;
    node: Node;
    lastTouched: string;
    lastReplyUser?: string | null;
    replyCount: number;
}

interface HotTopic {
    id: number;
    title: string;
    url?: string;
}

interface GuozaokeData {
    site: SiteInfo;
    topics: Topic[];
    hotTopics: HotTopic[];
}

/**
 * 从URL中提取ID
 * @param url - URL字符串，例如 "/t/123817#reply42"
 * @returns 提取的数字ID，如果没找到则返回0
 */
function extractIdFromUrl(url?: string): number {
    if (!url) return 0;
    const match = url.match(/\/t\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}


/**
 * 从过早客HTML字符串中提取结构化信息
 * @param htmlContent - HTML字符串内容
 * @returns 提取的结构化数据
 */
export function extractGuozaokeInfo(htmlContent: string): GuozaokeData {
    try {
        const $ = cheerio.load(htmlContent);

        // 提取网站基本信息
        const siteInfo: SiteInfo = {
            title: $('title').text().trim(),
            description: $('meta[name="description"]').attr('content'),
            keywords: $('meta[name="keywords"]').attr('content')
        };

        // 提取话题列表
        const topics: Topic[] = [];
        $('.topic-item').each((index, element) => {
            const $item = $(element);
            const $main = $item.find('.main');
            const $meta = $main.find('.meta');

            const topicUrl = $main.find('.title a').attr('href');
            const topic: Topic = {
                id: extractIdFromUrl(topicUrl),
                number: index + 1,
                title: $main.find('.title a').text().trim(),
                url: topicUrl,
                author: {
                    username: $meta.find('.username a').text().trim(),
                    profileUrl: $meta.find('.username a').attr('href'),
                    avatar: $item.find('.avatar').attr('src')
                },
                node: {
                    name: $meta.find('.node a').text().trim(),
                    url: $meta.find('.node a').attr('href')
                },
                lastTouched: $meta.find('.last-touched').text().trim(),
                lastReplyUser: $meta.find('.last-reply-username strong').text().trim() || null,
                replyCount: parseInt($item.find('.count a').text().trim()) || 0
            };

            topics.push(topic);
        });

        // 提取热门话题
        const hotTopics: HotTopic[] = [];
        $('.hot-topics .cell').each((index, element) => {
            const $cell = $(element);
            const hotTopicUrl = $cell.find('.hot_topic_title a').attr('href');
            const hotTopic: HotTopic = {
                id: extractIdFromUrl(hotTopicUrl),
                title: $cell.find('.hot_topic_title a').text().trim(),
                url: hotTopicUrl,
            };

            if (hotTopic.title) {
                hotTopics.push(hotTopic);
            }
        });

        return {
            site: siteInfo,
            topics,
            hotTopics,
        };

    } catch (error) {
        console.error('提取信息时出错:', error);
        throw error;
    }
}


