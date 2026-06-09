package xyz.lingview.dimstack.security;

public enum AuthType {
    // 基于 Cookie 的会话认证（浏览器）
    SESSION,
    // 基于 Authorization: Bearer 的 API Key 令牌认证（CLI / 程序）
    TOKEN
}
