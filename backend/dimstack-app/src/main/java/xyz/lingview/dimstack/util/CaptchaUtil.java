package xyz.lingview.dimstack.util;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Random;
import java.util.UUID;

public class CaptchaUtil {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final Random RANDOM = new Random();

    public static String generateCaptcha(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    // 生成验证码key
    public static String generateCaptchaKey() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    // 生成验证码图片
    public static String generateCaptchaImage(String captcha) {
        int width = 120;
        int height = 40;

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();

        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);

        g.setColor(Color.LIGHT_GRAY);
        for (int i = 0; i < 5; i++) {
            int x1 = RANDOM.nextInt(width);
            int y1 = RANDOM.nextInt(height);
            int x2 = RANDOM.nextInt(width);
            int y2 = RANDOM.nextInt(height);
            g.drawLine(x1, y1, x2, y2);
        }

        g.setFont(new Font("Arial", Font.BOLD, 24));

        for (int i = 0; i < captcha.length(); i++) {
            g.setColor(new Color(RANDOM.nextInt(150), RANDOM.nextInt(150), RANDOM.nextInt(150)));
            int x = 20 + i * 20;
            int y = 30;
            g.drawString(String.valueOf(captcha.charAt(i)), x, y);
        }

        g.dispose();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            byte[] bytes = baos.toByteArray();
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    // 检查验证码是否正确
    public static boolean validateCaptcha(String sessionCaptcha, String inputCaptcha) {
        if (sessionCaptcha == null || inputCaptcha == null) {
            return false;
        }
        return sessionCaptcha.equalsIgnoreCase(inputCaptcha.trim().toLowerCase());
    }

}
