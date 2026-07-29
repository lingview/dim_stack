package xyz.lingview.dimstack.security;


public final class UserContextHolder {

    private static final ThreadLocal<AuthenticatedUser> CONTEXT = new ThreadLocal<>();

    private UserContextHolder() {
    }

    public static void set(AuthenticatedUser user) {
        CONTEXT.set(user);
    }

    public static AuthenticatedUser get() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
