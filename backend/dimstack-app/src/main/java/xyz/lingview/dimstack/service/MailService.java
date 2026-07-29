package xyz.lingview.dimstack.service;

import jakarta.mail.MessagingException;
import org.springframework.scheduling.annotation.Async;

import java.util.Map;

public interface MailService {
    /**
     * 发送简单文本邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     */
    @Async
    void sendSimpleMail(String to, String subject, String content);

    /**
     * 发送HTML格式邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content HTML内容
     */
    @Async
    void sendHtmlMail(String to, String subject, String content) throws MessagingException;

    /**
     * 发送带附件的邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     * @param filePath 附件路径
     */
    @Async
    void sendAttachmentsMail(String to, String subject, String content, String filePath) throws MessagingException;

    /**
     * 发送带静态资源的邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content HTML内容
     * @param rscPath 静态资源路径
     * @param rscId 静态资源ID
     */
    @Async
    void sendInlineResourceMail(String to, String subject, String content, String rscPath, String rscId) throws MessagingException;

    /**
     * 发送模板邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param templateName 模板名称
     * @param model 模板参数
     */
    @Async
    void sendTemplateMail(String to, String subject, String templateName, Map<String, Object> model) throws MessagingException;
}
