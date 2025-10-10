package xyz.lingview.systemconfig.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    // 加密密码
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    // 检查密码是否相同
    public static boolean checkPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
}
