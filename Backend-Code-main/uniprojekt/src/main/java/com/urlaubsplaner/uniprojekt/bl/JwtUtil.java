package com.urlaubsplaner.uniprojekt.bl;

import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final Key key;
    private final long expiration;

    public JwtUtil(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiration) {
        
        //byte[] decodedKey = Base64.getDecoder().decode(secret);
        byte[] decodedKey = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256).getEncoded();
        this.key = Keys.hmacShaKeyFor(decodedKey);
        this.expiration = expiration;

    }

    public String createAccessToken(long authId) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(String.valueOf(authId))
                .setIssuedAt(new java.util.Date(now))
                .setExpiration(new java.util.Date(now + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getAuthIdFromToken(String token) {
        return Long.parseLong(parseToken(token).getBody().getSubject());
    }

    private Jws<Claims> parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token expired");
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("Unsupported token");
        } catch (MalformedJwtException e) {
            throw new RuntimeException("Invalid token");
        } catch (SecurityException e) {
            throw new RuntimeException("Invalid signature");
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Token empty");
        }
    }
}
