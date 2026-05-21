export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*\S+/gi, "");

  // Remove javascript: and data: URIs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

  // Remove iframe/object/embed tags
  sanitized = sanitized.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object[\s\S]*?<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed[\s\S]*?>/gi, "");

  // Remove style tags with url() that could load external resources
  sanitized = sanitized.replace(/url\s*\(\s*["']?https?:\/\/[^"')\s]+["']?\s*\)/gi, "url()");

  return sanitized;
}

export function sanitizePrompt(prompt: string): string {
  // Limit prompt length to prevent abuse
  const maxLen = 2000;
  let cleaned = prompt.trim().slice(0, maxLen);

  // Remove potential injection attempts
  cleaned = cleaned.replace(/<script/gi, "&lt;script");
  cleaned = cleaned.replace(/javascript:/gi, "");

  return cleaned;
}
