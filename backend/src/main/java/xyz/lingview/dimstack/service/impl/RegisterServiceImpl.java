package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Register;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.RegisterDTO;
import xyz.lingview.dimstack.dto.response.RegisterResponseDTO;
import xyz.lingview.dimstack.mapper.RegisterMapper;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.mapper.UserRoleMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.service.RegisterService;
import xyz.lingview.dimstack.util.CaptchaUtil;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.util.RandomUtil;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
@Slf4j
public class RegisterServiceImpl implements RegisterService {

    @Autowired
    private RegisterMapper registerMapper;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private MailService mailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Override
    public RegisterResponseDTO register(RegisterDTO requestDTO) {
        try {
            Integer enableRegister = siteConfigMapper.getEnableRegister();
            if (enableRegister == null || enableRegister != 1) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("管理员未启用注册功能");
                dto.setCode(400);
                return dto;
            }

            String username = requestDTO.getUsername();
            String email = requestDTO.getEmail();
            String phone = requestDTO.getPhone();
            String password = requestDTO.getPassword();
            String captcha = requestDTO.getCaptcha();
            String captchaKey = requestDTO.getCaptchaKey();

            if (isBlank(username)) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("用户名不能为空");
                dto.setCode(400);
                return dto;
            }
            if (isBlank(password)) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("密码不能为空");
                dto.setCode(400);
                return dto;
            }
            if (isBlank(captcha)) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("验证码不能为空");
                dto.setCode(400);
                return dto;
            }
            if (isBlank(captchaKey)) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("验证码无效");
                dto.setCode(400);
                return dto;
            }

            String redisCaptcha = cacheService.get("captcha_" + captchaKey, String.class);
            if (redisCaptcha == null) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("验证码已过期，请重新获取");
                dto.setCode(400);
                return dto;
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                clearCaptcha(captchaKey);
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("验证码错误");
                dto.setCode(400);
                return dto;
            }

            clearCaptcha(captchaKey);

            log.info("注册用户名：{} 手机号：{} 邮箱：{}", username, phone, email);

            int userExists = registerMapper.selectUser(username);
            if (userExists > 0) {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("账号已存在！");
                dto.setCode(400);
                return dto;
            }

            if (phone != null && !phone.trim().isEmpty()) {
                int phoneExists = userInformationMapper.selectUserByPhone(phone);
                if (phoneExists > 0) {
                    RegisterResponseDTO dto = new RegisterResponseDTO();
                    dto.setSuccess(false);
                    dto.setMessage("手机号已存在！");
                    dto.setCode(400);
                    return dto;
                }
            }

            if (email != null && !email.trim().isEmpty()) {
                int emailExists = userInformationMapper.selectUserByEmail(email);
                if (emailExists > 0) {
                    RegisterResponseDTO dto = new RegisterResponseDTO();
                    dto.setSuccess(false);
                    dto.setMessage("邮箱已存在！");
                    dto.setCode(400);
                    return dto;
                }
            }

            Register register = new Register();
            register.setUsername(username);
            register.setEmail(email);
            register.setPhone(phone);
            register.setUuid(RandomUtil.generateUUID());
            register.setPassword(PasswordUtil.hashPassword(password));

            int insertResult = registerMapper.insertUser(register);
            if (insertResult > 0) {
                UserInformation newUser = userInformationMapper.getUserByUsername(username);
                Integer newUserId = newUser != null ? newUser.getId() : null;

                // 为用户分配默认角色
                Integer defaultRoleId = siteConfigMapper.getRegisterUserPermission();
                if (defaultRoleId != null && newUserId != null) {
                    userRoleMapper.insertUserRole(newUserId, defaultRoleId);
                }
                if (siteConfigUtil.isNotificationEnabled()) {
                    Date date = new Date();
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String formattedDate = formatter.format(date);
                    String siteName = siteConfigUtil.getSiteName();
                    mailService.sendSimpleMail(email, siteName + " 注册成功", "用户：" + username + " 于 " + formattedDate + " 注册成功");
                    notificationService.sendSystemNotification(username, "系统通知", "用户：" + username + " 于 " + formattedDate + " 注册成功");
                }

                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(true);
                dto.setMessage("注册成功！");
                dto.setCode(200);
                return dto;
            } else {
                RegisterResponseDTO dto = new RegisterResponseDTO();
                dto.setSuccess(false);
                dto.setMessage("注册失败，请稍后再试");
                dto.setCode(500);
                return dto;
            }

        } catch (Exception e) {
            log.error("注册过程中发生错误", e);
            RegisterResponseDTO dto = new RegisterResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("注册失败，请检查输入或稍后再试");
            dto.setCode(500);
            return dto;
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private void clearCaptcha(String captchaKey) {
        cacheService.delete("captcha_" + captchaKey);
        log.info("已清理验证码: {}", captchaKey);
    }
}