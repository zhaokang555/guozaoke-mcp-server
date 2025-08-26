/**
 * 检测是否为任何类型的登录页面（不限于过早客）
 */
export function isGenericLoginPage(html: string): boolean {
  if (!html || typeof html !== 'string') {
    return false;
  }

  const loginPatterns = [
    /登录|login/i,
    /密码|password/i,
    /邮箱|email/i,
    /<form[^>]*>/i
  ];

  const matchCount = loginPatterns.filter(pattern => pattern.test(html)).length;

  // 至少匹配3个模式才认为是登录页面
  return matchCount >= 3;
}
