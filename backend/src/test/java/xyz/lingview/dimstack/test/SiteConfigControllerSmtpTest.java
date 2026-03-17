package xyz.lingview.dimstack.test;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import xyz.lingview.dimstack.controller.SiteConfigController;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SiteConfigControllerSmtpTest {

    @Mock
    private SiteConfigService siteConfigService;

    @Mock
    private SiteConfigMapper siteConfigMapper;

    @Mock
    private UserInformationMapper userInformationMapper;

    @Mock
    private MailService mailService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        SiteConfigController controller = new SiteConfigController();
        ReflectionTestUtils.setField(controller, "siteConfigService", siteConfigService);
        ReflectionTestUtils.setField(controller, "siteConfigMapper", siteConfigMapper);
        ReflectionTestUtils.setField(controller, "userInformationMapper", userInformationMapper);
        ReflectionTestUtils.setField(controller, "mailService", mailService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void shouldSendSmtpTestMailSuccessfully() throws Exception {
        doNothing().when(mailService).sendTestMailWithConfig(any(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/site/test-smtp")
                        .contentType("application/json")
                        .content("""
                                {
                                  "smtp_host":"smtp.example.com",
                                  "smtp_port":587,
                                  "mail_sender_email":"sender@example.com",
                                  "mail_sender_name":"系统通知",
                                  "mail_username":"sender@example.com",
                                  "mail_password":"secret",
                                  "mail_protocol":"smtp",
                                  "mail_enable_tls":true,
                                  "mail_enable_ssl":false,
                                  "test_email":"receiver@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(mailService).sendTestMailWithConfig(any(), anyString(), anyString(), anyString());
    }

    @Test
    void shouldReturnBadRequestWhenSmtpTestFails() throws Exception {
        doThrow(new RuntimeException("smtp auth failed"))
                .when(mailService).sendTestMailWithConfig(any(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/site/test-smtp")
                        .contentType("application/json")
                        .content("""
                                {
                                  "smtp_host":"smtp.example.com",
                                  "smtp_port":587,
                                  "mail_sender_email":"sender@example.com",
                                  "mail_sender_name":"系统通知",
                                  "mail_username":"sender@example.com",
                                  "mail_password":"secret",
                                  "mail_protocol":"smtp",
                                  "mail_enable_tls":true,
                                  "mail_enable_ssl":false,
                                  "test_email":"receiver@example.com"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
