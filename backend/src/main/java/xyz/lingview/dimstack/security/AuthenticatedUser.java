package xyz.lingview.dimstack.security;

public class AuthenticatedUser {

    private final String username;
    private volatile String uuid;
    private final AuthType authType;

    public AuthenticatedUser(String username, String uuid, AuthType authType) {
        this.username = username;
        this.uuid = uuid;
        this.authType = authType;
    }

    public String getUsername() {
        return username;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public AuthType getAuthType() {
        return authType;
    }
}
