package com.urlaubsplaner.uniprojekt.templates;

public class UserConfig {
    private long authId; // aus dem Token
    private String option; // z.B. "language", "currency"
    private String value; // z.B. "de", "EUR"
    private String dataType;

    // Konstruktoren
    public UserConfig() {
    }

    public UserConfig(long authId, String option, String value, String dataType) {
        this.authId = authId;
        this.option = option;
        this.value = value;
        this.dataType = dataType;
    }

    public UserConfig(long authId, String option, String value) {
        this(authId, option, value, null);
    }

    // Getter und Setter
    public long getAuthId() {
        return authId;
    }

    public void setAuthId(long authId) {
        this.authId = authId;
    }

    public String getOption() {
        return option;
    }

    public void setOption(String option) {
        this.option = option;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
}
