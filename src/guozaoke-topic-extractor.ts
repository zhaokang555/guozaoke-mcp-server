import * as cheerio from 'cheerio';

interface User {
  username: string;
  avatar: string;
  profileUrl: string;
}

interface Node {
  name: string;
  url: string;
}

interface Stats {
  views: number;
  likes: number;
  favorites: number;
  repliesCount: number;
}

interface Reply {
  floor: string;
  author: User;
  time: string;
  location: string;
  content: string;
  likes: number;
  replyId: number | null;
}

interface RelatedTopic {
  title: string;
  url: string;
  author: User;
}

interface Topic {
  id: number | null;
  title: string;
  author: User;
  node: Node;
  createdTime: string;
  lastReplyUser: {
    username: string;
    profileUrl: string;
  };
  lastReplyTime: string;
  content: string;
  stats: Stats;
  replies: Reply[];
  relatedTopics: RelatedTopic[];
}

interface Site {
  name: string;
  url: string;
}

interface TopicDetailsResult {
  topic: Topic;
  site: Site;
}

/**
 * 从过早客话题详情页面提取结构化数据
 */
export function extractTopicDetails(htmlContent: string): TopicDetailsResult {
  const $ = cheerio.load(htmlContent);
  
  // 提取话题基本信息
  const topic: Topic = {
    id: null,
    title: '',
    author: {
      username: '',
      avatar: '',
      profileUrl: ''
    },
    node: {
      name: '',
      url: ''
    },
    createdTime: '',
    lastReplyUser: {
      username: '',
      profileUrl: ''
    },
    lastReplyTime: '',
    content: '',
    stats: {
      views: 0,
      likes: 0,
      favorites: 0,
      repliesCount: 0
    },
    replies: [],
    relatedTopics: []
  };

  // 从URL或脚本中提取话题ID
  const qrcodeScript = $('script').text();
  const idMatch = qrcodeScript.match(/guozaoke\.com\/t\/(\d+)/);
  if (idMatch) {
    topic.id = parseInt(idMatch[1]);
  }

  // 提取标题
  topic.title = $('.topic-detail .ui-header h3.title').text().trim();

  // 提取作者信息
  const authorLink = $('.topic-detail .ui-header a[href^="/u/"]').first();
  topic.author.username = authorLink.attr('href')?.replace('/u/', '') || '';
  topic.author.profileUrl = authorLink.attr('href') || '';
  topic.author.avatar = $('.topic-detail .ui-header img.avatar').attr('src') || '';

  // 提取节点信息
  const nodeLink = $('.topic-detail .ui-header .node a');
  topic.node.name = nodeLink.text().trim();
  topic.node.url = nodeLink.attr('href') || '';

  // 提取时间信息
  topic.createdTime = $('.topic-detail .ui-header .created-time').text().replace('发表于 ', '').trim();
  
  // 提取最后回复信息
  const lastReplyUserLink = $('.topic-detail .ui-header .last-reply-username a');
  topic.lastReplyUser.username = lastReplyUserLink.text().trim();
  topic.lastReplyUser.profileUrl = lastReplyUserLink.attr('href') || '';
  topic.lastReplyTime = $('.topic-detail .ui-header .last-reply-time').text().trim();

  // 提取话题内容
  topic.content = $('.topic-detail .ui-content').html()?.trim() || '';

  // 提取统计信息
  const hitsText = $('.topic-detail .ui-footer .hits').text();
  const hitsMatch = hitsText.match(/(\d+)/);
  topic.stats.views = hitsMatch ? parseInt(hitsMatch[1]) : 0;

  const upVoteText = $('.topic-detail .ui-footer .up_vote').text();
  const upVoteMatch = upVoteText.match(/(\d+)/);
  topic.stats.likes = upVoteMatch ? parseInt(upVoteMatch[1]) : 0;

  const favoritedText = $('.topic-detail .ui-footer .favorited').text();
  const favoritedMatch = favoritedText.match(/(\d+)/);
  topic.stats.favorites = favoritedMatch ? parseInt(favoritedMatch[1]) : 0;

  // 提取回复数量
  const replyCountText = $('.topic-reply .ui-header span').text();
  const replyCountMatch = replyCountText.match(/共收到(\d+)条回复/);
  topic.stats.repliesCount = replyCountMatch ? parseInt(replyCountMatch[1]) : 0;

  // 提取回复列表
  $('.topic-reply .reply-item').each((index, element) => {
    const $reply = $(element);
    
    const reply: Reply = {
      floor: '',
      author: {
        username: '',
        avatar: '',
        profileUrl: ''
      },
      time: '',
      location: '',
      content: '',
      likes: 0,
      replyId: null
    };

    // 提取楼层
    reply.floor = $reply.find('.floor').first().text().trim();

    // 提取作者信息
    const replyAuthorLink = $reply.find('a[href^="/u/"]').first();
    reply.author.username = replyAuthorLink.attr('href')?.replace('/u/', '') || '';
    reply.author.profileUrl = replyAuthorLink.attr('href') || '';
    reply.author.avatar = $reply.find('img.avatar').attr('src') || '';

    // 提取时间和地点
    const timeSpans = $reply.find('.meta .time');
    if (timeSpans.length >= 2) {
      reply.time = timeSpans.eq(0).text().trim();
      reply.location = timeSpans.eq(1).text().trim();
    } else if (timeSpans.length === 1) {
      const timeText = timeSpans.eq(0).text().trim();
      if (timeText === '楼主') {
        reply.time = timeSpans.eq(1)?.text().trim() || '';
        reply.location = timeSpans.eq(2)?.text().trim() || '';
      } else {
        reply.time = timeText;
      }
    }

    // 提取回复内容
    reply.content = $reply.find('.content').html()?.trim() || '';

    // 提取点赞数和回复ID
    const voteLink = $reply.find('.J_replyVote');
    const voteCount = voteLink.attr('data-count');
    reply.likes = voteCount ? parseInt(voteCount) : 0;
    
    const voteHref = voteLink.attr('href');
    const replyIdMatch = voteHref?.match(/reply_id=(\d+)/);
    if (replyIdMatch) {
      reply.replyId = parseInt(replyIdMatch[1]);
    }

    topic.replies.push(reply);
  });

  // 提取相关话题
  $('.hot-topics .cell').each((index, element) => {
    const $cell = $(element);
    const relatedTopic: RelatedTopic = {
      title: '',
      url: '',
      author: {
        username: '',
        avatar: '',
        profileUrl: ''
      }
    };

    // 提取标题和链接
    const titleLink = $cell.find('.hot_topic_title a');
    relatedTopic.title = titleLink.text().trim();
    relatedTopic.url = titleLink.attr('href') || '';

    // 提取作者信息
    const authorLink = $cell.find('a[href^="/u/"]');
    relatedTopic.author.username = authorLink.attr('href')?.replace('/u/', '') || '';
    relatedTopic.author.profileUrl = authorLink.attr('href') || '';
    relatedTopic.author.avatar = $cell.find('img.avatar').attr('src') || '';

    topic.relatedTopics.push(relatedTopic);
  });

  return {
    topic,
    site: {
      name: '过早客',
      url: 'https://www.guozaoke.com'
    }
  };
}