package xyz.lingview.dimstack_expansion_server.util;

import java.util.UUID;

public class RandomUtil {

    public static String generateRandomNumber(int length, String chars) {
        if (length <= 0) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        return sb.toString();
    }

    private static String generate8DigitRandom() {
        java.util.Random random = new java.util.Random();
        int num = 10000000 + random.nextInt(90000000);
        return String.valueOf(num);
    }

    public static String generateUUID() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        return uuid + timestamp + generate8DigitRandom();
    }

    public static String generateStandardUUID() {
        String uuid = UUID.randomUUID().toString();
        String timestamp = String.valueOf(System.currentTimeMillis());
        return uuid + "-" + timestamp + "-" + generate8DigitRandom();
    }

}
