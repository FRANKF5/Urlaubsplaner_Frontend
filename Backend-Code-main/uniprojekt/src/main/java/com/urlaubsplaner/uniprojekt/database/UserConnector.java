package com.urlaubsplaner.uniprojekt.database;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.urlaubsplaner.uniprojekt.templates.*;

@Repository
public class UserConnector {

    private final JdbcTemplate jdbc;

    public UserConnector(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Liefert alle Settings (option/value) für den gegebenen Nutzer
    public List<UserConfig> getUserSettings(long authId) {
        String sql = """
                    SELECT auth_id, option, value
                    FROM settings
                    WHERE auth_id = ?
                """;

        return jdbc.query(sql, rs -> {
            List<UserConfig> list = new ArrayList<>();
            while (rs.next()) {
                UserConfig uc = new UserConfig(
                        rs.getLong("auth_id"),
                        rs.getString("option"),
                        rs.getString("value"));
                list.add(uc);
            }
            return list;
        }, authId);
    }

    // Liefert einzelnes Setting eines Nutzers anhand der Option
    public UserConfig getUserSetting(long authId, String option) {
        String sql = """
                    SELECT auth_id, option, value
                    FROM settings
                    WHERE auth_id = ? AND option = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }
            return new UserConfig(
                    rs.getLong("auth_id"),
                    rs.getString("option"),
                    rs.getString("value"));
        }, authId, option);
    }

    // Aktualisiert den Wert eines bestehenden Settings
    public boolean updateUserSetting(UserConfig config) {
        String sql = """
                    UPDATE settings
                    SET value = ?
                    WHERE auth_id = ? AND option = ?
                """;
        return jdbc.update(sql, config.getValue(), config.getAuthId(), config.getOption()) == 1;
    }

    // Erstellt ein neues Setting (falls Option noch nicht existiert)
    public void storeUserSetting(UserConfig config) {
        String sql = """
                    INSERT INTO settings (auth_id, option, value)
                    VALUES (?, ?, ?)
                """;
        jdbc.update(sql, config.getAuthId(), config.getOption(), config.getValue());
    }

    // Komfort: Upsert (PostgreSQL) – erstellt oder aktualisiert einen Eintrag
    public boolean upsertUserSetting(UserConfig config) {
        String sql = """
                    INSERT INTO settings (auth_id, option, value)
                    VALUES (?, ?, ?)
                    ON CONFLICT (auth_id, option)
                    DO UPDATE SET value = EXCLUDED.value
                """;
        return jdbc.update(sql, config.getAuthId(), config.getOption(), config.getValue()) == 1;
    }
}
