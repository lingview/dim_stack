package xyz.lingview.dimstack.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.SiteConfigService;

import java.io.File;
import java.util.Map;
import java.util.Properties;

@Slf4j
@Service
public class MailServiceImpl implements MailService {

    @Autowired
    private SiteConfigService siteConfigService;

    /**
     * 获取邮件发送器
     * @return JavaMailSender
     */
    private JavaMailSender getMailSender() {
        SiteConfig config = siteConfigService.getSiteConfig();

        if (config == null ||
            !StringUtils.hasText(config.getMail_username()) ||
            !StringUtils.hasText(config.getMail_password()) ||
            !StringUtils.hasText(config.getSmtp_host())) {
            log.warn("邮件配置不完整，无法发送邮件");
            return null;
        }

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getSmtp_host());
        mailSender.setPort(config.getSmtp_port() != null ? config.getSmtp_port() : 25);
        mailSender.setUsername(config.getMail_username());
        mailSender.setPassword(config.getMail_password());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", config.getMail_protocol() != null ? config.getMail_protocol() : "smtp");
        props.put("mail.smtp.auth", "true");

        if (config.getMail_enable_tls() != null && config.getMail_enable_tls()) {
            props.put("mail.smtp.starttls.enable", "true");
        } else if (config.getMail_enable_ssl() != null && config.getMail_enable_ssl()) {
            props.put("mail.smtp.ssl.enable", "true");
        }

        props.put("mail.debug", "false");

        return mailSender;
    }

    @Override
    public void sendSimpleMail(String to, String subject, String content) {
        JavaMailSender mailSender = getMailSender();
        if (mailSender == null) {
            return;
        }

        SiteConfig config = siteConfigService.getSiteConfig();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(config.getMail_sender_email());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);
            log.info("简单邮件发送成功: to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("发送简单邮件时发生异常: to={}, subject={}", to, subject, e);
        }
    }

    @Override
    public void sendHtmlMail(String to, String subject, String content) throws MessagingException {
        JavaMailSender mailSender = getMailSender();
        if (mailSender == null) {
            return;
        }

        SiteConfig config = siteConfigService.getSiteConfig();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(config.getMail_sender_email());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
            log.info("HTML邮件发送成功: to={}, subject={}", to, subject);
        } catch (MessagingException e) {
            log.error("发送HTML邮件时发生异常: to={}, subject={}", to, subject, e);
            throw e;
        }
    }

    @Override
    public void sendAttachmentsMail(String to, String subject, String content, String filePath) throws MessagingException {
        JavaMailSender mailSender = getMailSender();
        if (mailSender == null) {
            return;
        }

        SiteConfig config = siteConfigService.getSiteConfig();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(config.getMail_sender_email());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            File file = new File(filePath);
            if (file.exists()) {
                helper.addAttachment(file.getName(), file);
            }

            mailSender.send(message);
            log.info("带附件邮件发送成功: to={}, subject={}", to, subject);
        } catch (MessagingException e) {
            log.error("发送带附件邮件时发生异常: to={}, subject={}", to, subject, e);
            throw e;
        }
    }

    @Override
    public void sendInlineResourceMail(String to, String subject, String content, String rscPath, String rscId) throws MessagingException {
        JavaMailSender mailSender = getMailSender();
        if (mailSender == null) {
            return;
        }

        SiteConfig config = siteConfigService.getSiteConfig();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(config.getMail_sender_email());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            File file = new File(rscPath);
            if (file.exists()) {
                helper.addInline(rscId, file);
            }

            mailSender.send(message);
            log.info("带静态资源邮件发送成功: to={}, subject={}", to, subject);
        } catch (MessagingException e) {
            log.error("发送带静态资源邮件时发生异常: to={}, subject={}", to, subject, e);
            throw e;
        }
    }

    @Override
    public void sendTemplateMail(String to, String subject, String templateName, Map<String, Object> model) throws MessagingException {
        // 暂时用不到先不开发（
        String content = "模板邮件内容";
        sendHtmlMail(to, subject, content);
    }
}
