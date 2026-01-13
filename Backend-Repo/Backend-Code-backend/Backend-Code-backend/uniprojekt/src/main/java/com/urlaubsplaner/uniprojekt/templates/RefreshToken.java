package com.urlaubsplaner.uniprojekt.templates;

import java.sql.Timestamp;

public class RefreshToken {
    private String refreshToken;
    private long authId;
    private Timestamp expireDate;

    public RefreshToken(String refreshToken, long authId) {
        this.refreshToken = refreshToken;
        this.authId = authId;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public long getAuthId() {
        return authId;
    }
    public void setAuthId(long authId) {
        this.authId = authId;
    }
    public Timestamp getExpireDate() {
        return expireDate;
    }
    public void setExpireDate(Timestamp expireDate) {
        this.expireDate = expireDate;
    }
}
