package xyz.lingview.dimstack.util;

import java.util.List;

public final class BotUtil {

    private BotUtil() {
    }

    private static final List<String> BOT_UA = List.of(
            "Googlebot", "Bingbot", "Baiduspider", "DuckDuckBot", "Sogou", "360Spider",
            "YisouSpider", "ByteSpider"
    );

    public static boolean isBot(String ua) {
        if (ua == null) return false;
        String uaLower = ua.toLowerCase();
        return BOT_UA.stream().anyMatch(bot -> uaLower.contains(bot.toLowerCase()));
    }
}
