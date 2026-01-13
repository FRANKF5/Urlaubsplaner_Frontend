package com.urlaubsplaner.uniprojekt.database;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.urlaubsplaner.uniprojekt.templates.*;

@Repository
public class AuthConnector {

    private final JdbcTemplate jdbc;

    public AuthConnector(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Auth authByMail(String mail) {
        String sql = """
                SELECT id,
                       email,
                       password_hash,
                       confirmed_at
                FROM auth
                WHERE email = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }

            Auth auth = new Auth(
                    rs.getString("email"),
                    rs.getString("password_hash"));

            auth.setId(rs.getLong("id"));
            auth.setConfirmed_at(rs.getTimestamp("confirmed_at"));

            return auth;
        }, mail);
    }

    public String mailById(long authId) {

        String sql = """
                    SELECT email
                    FROM auth
                    WHERE id = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }
            return rs.getString("email");
        }, authId);
    }

    public RefreshToken refreshTokenByToken(String refreshToken) {

        String sql = """
                    SELECT token, auth_id, expires_at
                    FROM tokens
                    WHERE token = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next())
                return null;

            RefreshToken token = new RefreshToken(
                    rs.getString("token"),
                    rs.getLong("auth_id"));

            token.setExpireDate(rs.getTimestamp("expires_at"));
            return token;
        }, refreshToken);
    }

    public void storeRefreshToken(RefreshToken refreshToken) {
        String sql = """
                    INSERT INTO tokens (token, auth_id, expires_at)
                    VALUES (?, ?, ?)
                """;

        jdbc.update(
                sql,
                refreshToken.getRefreshToken(),
                refreshToken.getAuthId(),
                refreshToken.getExpireDate());
    }

    // Inserts a new auth record and returns the automatically generated primary key
    // (id)
    public long storeAuth(Auth auth, String verificationCode) {
        String sql = """
                    INSERT INTO auth (email, password_hash, verification_code)
                    VALUES (?, ?, ?)
                    RETURNING id
                """;

        return jdbc.query(sql, rs -> {
            rs.next();
            return rs.getLong("id");
        },
                auth.getMail(),
                auth.getPass_hash(),
                verificationCode);
    }

    public Verification getVerificationByAuthId(long authId) {
        String sql = """
                    SELECT email,
                           verification_code
                    FROM auth
                    WHERE id = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }

            Verification v = new Verification();
            v.setEmail(rs.getString("email"));
            v.setVerificationCode(rs.getString("verification_code"));
            return v;
        }, authId);
    }

    public Verification getVerificationByMail(String mail) {
        String sql = """
                    SELECT email,
                           verification_code
                    FROM auth
                    WHERE email = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }

            Verification v = new Verification();
            v.setEmail(rs.getString("email"));
            v.setVerificationCode(rs.getString("verification_code"));
            return v;
        }, mail);
    }

    public PersonalData getPersonalDataByAuthId(long authId) {
        String sql = """
                    SELECT id,
                           auth_id,
                           first_name,
                           last_name,
                           gender,
                           avatar_url,
                           user_name,
                           birth_date
                    FROM users
                    WHERE auth_id = ?
                """;

        return jdbc.query(sql, rs -> {
            if (!rs.next())
                return null;

            PersonalData pd = new PersonalData();
            pd.setUserId(rs.getLong("id"));
            pd.setAuthId(rs.getLong("auth_id"));
            pd.setFirstName(rs.getString("first_name"));
            pd.setLastName(rs.getString("last_name"));
            pd.setGender(rs.getString("gender"));
            pd.setAvatarUrl(rs.getString("avatar_url"));
            pd.setUserName(rs.getString("user_name"));
            pd.setBirthDate(rs.getDate("birth_date"));
            return pd;
        }, authId);
    }

    public void storePersonalData(PersonalData pd) {
        String sql = """
                    INSERT INTO users (
                        auth_id,
                        first_name,
                        last_name,
                        gender,
                        avatar_url,
                        user_name,
                        birth_date
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        jdbc.update(sql,
                pd.getAuthId(),
                pd.getFirstName(),
                pd.getLastName(),
                pd.getGender(),
                pd.getAvatarUrl(),
                pd.getUserName(),
                pd.getBirthDate());
    }

    public boolean updatePersonalData(long authId, PersonalData pd) {
        // only update fields that are not null in personalData
        StringBuilder sql = new StringBuilder("UPDATE users SET ");
        List<Object> args = new ArrayList<>();

        if (pd.getFirstName() != null) {
            sql.append("first_name = ?, ");
            args.add(pd.getFirstName());
        }
        if (pd.getLastName() != null) {
            sql.append("last_name = ?, ");
            args.add(pd.getLastName());
        }
        if (pd.getGender() != null) {
            sql.append("gender = ?, ");
            args.add(pd.getGender());
        }
        if (pd.getAvatarUrl() != null) {
            sql.append("avatar_url = ?, ");
            args.add(pd.getAvatarUrl());
        }
        if (pd.getUserName() != null) {
            sql.append("user_name = ?, ");
            args.add(pd.getUserName());
        }
        if (pd.getBirthDate() != null) {
            sql.append("birth_date = ?, ");
            args.add(pd.getBirthDate());
        }

        if (args.isEmpty())
            return false;

        sql.setLength(sql.length() - 2); // letztes ", " entfernen
        sql.append(" WHERE auth_id = ?");
        args.add(authId);

        return jdbc.update(sql.toString(), args.toArray()) == 1;
    }

    public boolean deleteRefreshToken(String refreshToken) {
        String sql = """
                    DELETE FROM tokens
                    WHERE token = ?
                """;
        return jdbc.update(sql, refreshToken) > 0;
    }

    public int deleteRefreshTokensByUserId(long userId) {

        String sql = "DELETE FROM tokens " +
                "WHERE auth_id = ( " +
                "    SELECT auth_id " +
                "    FROM users " +
                "    WHERE id = ? " +
                ")";
        return jdbc.update(sql, userId); // number of deleted refresh tokens (logout from all devices)
    }

    public boolean storeVerificationDate(long authId) {
        String sql = """
                    UPDATE auth
                    SET confirmed_at = now()
                    WHERE id = ?
                """;

        return jdbc.update(sql, authId) == 1;
    }

    public boolean storeVerificationCode(long authId, String verificationCode) {

        String sql = """
                    UPDATE auth
                    SET verification_code = ?,
                        confirmed_at = NULL
                    WHERE id = ?
                """;

        return jdbc.update(sql, verificationCode, authId) == 1;
    }

    public boolean updateLastSignInAt(long authId) {
        String sql = """
                    UPDATE auth
                    SET last_sign_in_at = now()
                    WHERE id = ?
                """;
        return jdbc.update(sql, authId) == 1;
    }

    // --- DELETE AUTH ACCOUNT ---
    public boolean deleteAuthAccount(long authId) {
        String sql = """
                    DELETE FROM auth
                    WHERE id = ?
                """;
        return jdbc.update(sql, authId) == 1;
    }

    // --- DELETE USER DATA ---
    public boolean deleteUserData(long authId) {
        String sql = """
                    DELETE FROM users
                    WHERE auth_id = ?
                """;
        return jdbc.update(sql, authId) == 1;
    }

    // --- CHECK IF EMAIL EXISTS ---
    public boolean emailExists(String email) {
        String sql = """
                    SELECT EXISTS(
                        SELECT 1 FROM auth
                        WHERE email = ?
                    )
                """;
        Boolean result = jdbc.queryForObject(sql, Boolean.class, email);
        return result != null && result;
    }

    // --- CHECK IF USER IS VERIFIED ---
    public boolean isUserVerified(long authId) {
        String sql = """
                    SELECT confirmed_at IS NOT NULL
                    FROM auth
                    WHERE id = ?
                """;
        Boolean result = jdbc.queryForObject(sql, Boolean.class, authId);
        return result != null && result;
    }

    // --- GET ALL REFRESH TOKENS FOR USER ---
    public List<RefreshToken> getAllRefreshTokensByAuthId(long authId) {
        String sql = """
                    SELECT token, auth_id, expires_at
                    FROM tokens
                    WHERE auth_id = ?
                    ORDER BY expires_at DESC
                """;

        return jdbc.query(sql, (rs, rowNum) -> {
            RefreshToken token = new RefreshToken(
                    rs.getString("token"),
                    rs.getLong("auth_id"));
            token.setExpireDate(rs.getTimestamp("expires_at"));
            return token;
        }, authId);
    }

    // --- DELETE EXPIRED TOKENS ---
    public int deleteExpiredTokens() {
        String sql = """
                    DELETE FROM tokens
                    WHERE expires_at < now()
                """;
        return jdbc.update(sql);
    }
}
