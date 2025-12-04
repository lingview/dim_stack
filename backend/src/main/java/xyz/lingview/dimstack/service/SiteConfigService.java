package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.request.HeroDTO;

public interface SiteConfigService {
    SiteConfig getSiteConfig();
    HeroDTO getHeroConfig();
    String getCopyright();
    String getSiteName();
    String getSiteIcon();
    String getSiteTheme();
    String getExpansionServer();
    boolean updateSiteConfig(SiteConfig siteConfig);
    boolean updateSiteTheme(String themeName);
    String getIcpRecordNumber();
    String getMpsRecordNumber();
    Integer getEnableRegister();

    default xyz.lingview.dimstack.domain.MailConfig getMailConfig() {
        SiteConfig siteConfig = getSiteConfig();
        if (siteConfig != null) {
            xyz.lingview.dimstack.domain.MailConfig mailConfig = new xyz.lingview.dimstack.domain.MailConfig();
            mailConfig.setSmtp_host(siteConfig.getSmtp_host());
            mailConfig.setSmtp_port(siteConfig.getSmtp_port());
            mailConfig.setMail_sender_email(siteConfig.getMail_sender_email());
            mailConfig.setMail_sender_name(siteConfig.getMail_sender_name());
            mailConfig.setMail_username(siteConfig.getMail_username());
            mailConfig.setMail_password(siteConfig.getMail_password());
            mailConfig.setMail_protocol(siteConfig.getMail_protocol());
            mailConfig.setMail_enable_tls(siteConfig.getMail_enable_tls());
            mailConfig.setMail_enable_ssl(siteConfig.getMail_enable_ssl());
            mailConfig.setMail_default_encoding(siteConfig.getMail_default_encoding());
            return mailConfig;
        }
        return null;
    }
}
