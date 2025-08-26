/**
 * 检测HTML字符串是否为过早客论坛的登录页面
 */
export function isLoginPage(html: string): boolean {
  if (!html || typeof html !== 'string') {
    return false;
  }

  const loginIndicators = [
    // 主要特征：登录提示文字
    '请先登录社区再完成操作',

    // 次要特征：登录相关元素
    '<legend class="">登录</legend>',
    'name="email"',
    'name="password"',
    'class="btn btn-success">登录</button>',

    // 导航链接特征
    'href="/login"',
    'href="/register"',

    // 页面标题
    '<title>过早客</title>'
  ];

  // 检查所有主要指标
  const hasMainIndicator = html.includes('请先登录社区再完成操作');

  // 检查至少包含一定数量的次要指标
  const secondaryMatches = loginIndicators.slice(1).filter(indicator =>
    html.includes(indicator)
  ).length;

  // 主要指标存在且至少有4个次要指标匹配
  return hasMainIndicator && secondaryMatches >= 4;
}

/**
 * 更严格的检测函数，检查更多特征
 */
export function isLoginPageStrict(html: string): boolean {
  if (!html || typeof html !== 'string') {
    return false;
  }

  const requiredElements = [
    '请先登录社区再完成操作',
    '<form class="form-horizontal"',
    'name="email"',
    'name="password"',
    'name="_xsrf"',
    '支持通过E-mail，手机号登录',
    '请输入您的密码（不少于6个字符）'
  ];

  return requiredElements.every(element => html.includes(element));
}
