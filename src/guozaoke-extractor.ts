import * as cheerio from 'cheerio';
import fs from 'fs/promises';

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
    title: string;
    url?: string;
    author: Author;
    node: Node;
    lastTouched: string;
    lastReplyUser?: string | null;
    replyCount: number;
}

interface HotTopic {
    title: string;
    url?: string;
    author: {
        username?: string | null;
        avatar?: string;
    };
}

interface NodeCategory {
    name: string;
    nodes: Node[];
}

interface CurrentUser {
    username?: string | null;
    avatar?: string | null;
    topics: number;
    replies: number;
    favorites: number;
    reputation: number;
}

interface GuozaokeData {
    site: SiteInfo;
    currentUser: CurrentUser;
    topics: Topic[];
    hotTopics: HotTopic[];
    nodeCategories: NodeCategory[];
    hotNodes: Node[];
    communityStats: Record<string, number>;
    extractedAt: string;
    totalTopics: number;
}

/**
 * 读取HTML文件并返回字符串
 * @param htmlPath - HTML文件路径
 * @returns HTML字符串内容
 */
export async function readHtmlFile(htmlPath: string): Promise<string> {
    try {
        return await fs.readFile(htmlPath, 'utf8');
    } catch (error) {
        console.error('读取HTML文件时出错:', error);
        throw error;
    }
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
            
            const topic: Topic = {
                id: index + 1,
                title: $main.find('.title a').text().trim(),
                url: $main.find('.title a').attr('href'),
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
        
        // 提取节点分类
        const nodeCategories: NodeCategory[] = [];
        $('.nodes-cloud ul li').each((index, element) => {
            const $category = $(element);
            const category: NodeCategory = {
                name: $category.find('label').text().trim(),
                nodes: []
            };
            
            $category.find('.nodes a').each((idx, nodeEl) => {
                const $node = $(nodeEl);
                category.nodes.push({
                    name: $node.text().trim(),
                    url: $node.attr('href')
                });
            });
            
            if (category.name && category.nodes.length > 0) {
                nodeCategories.push(category);
            }
        });
        
        // 提取热门话题
        const hotTopics: HotTopic[] = [];
        $('.hot-topics .cell').each((index, element) => {
            const $cell = $(element);
            const hotTopic: HotTopic = {
                title: $cell.find('.hot_topic_title a').text().trim(),
                url: $cell.find('.hot_topic_title a').attr('href'),
                author: {
                    username: $cell.find('a img').attr('src')?.match(/avatar\/(\d+)\//)?.[1] || null,
                    avatar: $cell.find('a img').attr('src')
                }
            };
            
            if (hotTopic.title) {
                hotTopics.push(hotTopic);
            }
        });
        
        // 提取热门节点
        const hotNodes: Node[] = [];
        $('.hot-nodes .ui-content a').each((index, element) => {
            const $node = $(element);
            hotNodes.push({
                name: $node.text().trim(),
                url: $node.attr('href')
            });
        });
        
        // 提取社区统计信息
        const communityStats: Record<string, number> = {};
        $('.community-status dl').each((index, element) => {
            const $dl = $(element);
            const key = $dl.find('dt').text().trim();
            const value = parseInt($dl.find('dd').text().trim()) || 0;
            if (key) {
                communityStats[key] = value;
            }
        });
        
        // 提取当前用户信息
        const currentUser: CurrentUser = {
            username: $('.usercard .username').text().trim() || null,
            avatar: $('.usercard .avatar').attr('src') || null,
            topics: parseInt($('.status-topic strong a').text()) || 0,
            replies: parseInt($('.status-reply strong a').text()) || 0,
            favorites: parseInt($('.status-favorite strong a').text()) || 0,
            reputation: parseInt($('.status-reputation strong').text()) || 0
        };
        
        return {
            site: siteInfo,
            currentUser,
            topics,
            hotTopics,
            nodeCategories,
            hotNodes,
            communityStats,
            extractedAt: new Date().toISOString(),
            totalTopics: topics.length
        };
        
    } catch (error) {
        console.error('提取信息时出错:', error);
        throw error;
    }
}

/**
 * 从HTML文件路径提取信息的便捷函数
 * @param htmlPath - HTML文件路径
 * @returns 提取的结构化数据
 */
export async function extractGuozaokeInfoFromFile(htmlPath: string): Promise<GuozaokeData> {
    const htmlContent = await readHtmlFile(htmlPath);
    return extractGuozaokeInfo(htmlContent);
}

// 如果直接运行此文件，则执行提取并输出JSON
if (import.meta.url === `file://${process.argv[1]}`) {
    const htmlPath = process.argv[2] || './guozaoke.html';
    
    extractGuozaokeInfoFromFile(htmlPath)
        .then(data => {
            console.log(JSON.stringify(data, null, 2));
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}