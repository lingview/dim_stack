package xyz.lingview.dimstack.util;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.SecureRandom;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class RandomUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Path SALT_FILE = Path.of(".random_salt");

    private static final String LOADED_SALT = loadOrCreateSalt();

    private static final String CACHED_NODE_ID = initHashedNodeId();

    private static String loadOrCreateSalt() {
        try {
            if (Files.exists(SALT_FILE)) {
                String salt = Files.readString(SALT_FILE).trim();
                if (salt.length() == 64 && salt.matches("[a-f0-9]{64}")) {
                    return salt;
                }
            }

            byte[] saltBytes = new byte[32];
            SECURE_RANDOM.nextBytes(saltBytes);
            StringBuilder sb = new StringBuilder(64);
            for (byte b : saltBytes) {
                sb.append("%02x".formatted(b));
            }
            String newSalt = sb.toString();

            Files.write(SALT_FILE, newSalt.getBytes(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.WRITE,
                    StandardOpenOption.TRUNCATE_EXISTING);

            try {
                SALT_FILE.toFile().setReadable(false, false);
                SALT_FILE.toFile().setReadable(true, true);
                SALT_FILE.toFile().setWritable(true, true);
            } catch (Exception ignored) {}

            return newSalt;

        } catch (Exception e) {
            byte[] fallback = new byte[32];
            SECURE_RANDOM.nextBytes(fallback);
            StringBuilder sb = new StringBuilder(64);
            for (byte b : fallback) {
                sb.append("%02x".formatted(b));
            }
            return sb.toString();
        }
    }


    private static String getLocalIpAddress() {
        try {
            java.util.Enumeration<java.net.NetworkInterface> interfaces =
                    java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface nic = interfaces.nextElement();
                if (nic.isLoopback() || !nic.isUp()) continue;
                java.util.Enumeration<java.net.InetAddress> addresses = nic.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress addr = addresses.nextElement();
                    if (addr instanceof java.net.Inet4Address && !addr.isLoopbackAddress()) {
                        return addr.getHostAddress();
                    }
                }
            }
            return java.net.InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "127.0.0.1";
        }
    }


    private static String initHashedNodeId() {
        String ip = getLocalIpAddress();
        String hash = hmacSha256(ip, LOADED_SALT);
        return hash.substring(0, Math.min(hash.length(), 32));
    }


    private static String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes());
            StringBuilder sb = new StringBuilder(rawHmac.length * 2);
            for (byte b : rawHmac) {
                sb.append("%02x".formatted(b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "fallback_hmac_" + Math.abs(SECURE_RANDOM.nextInt(1000000));
        }
    }


    private static String generate8DigitRandom() {
        int num = 10_000_000 + SECURE_RANDOM.nextInt(90_000_000);
        return String.valueOf(num);
    }

    public static String generateUUID() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        return CACHED_NODE_ID + uuid + timestamp + generate8DigitRandom();
    }

    public static String generateStandardUUID() {
        String uuid = UUID.randomUUID().toString();
        String timestamp = String.valueOf(System.currentTimeMillis());
        return CACHED_NODE_ID + "-" + uuid + "-" + timestamp + "-" + generate8DigitRandom();
    }
}