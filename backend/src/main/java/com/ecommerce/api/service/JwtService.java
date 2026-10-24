package com.ecommerce.api.service;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final SecretKey key;
	private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expiration = expiration;
    }

    public String generateToken(String username) {

        return Jwts.builder()
                .subject(username)
                .claim("role", "ADMIN")
                .issuedAt(new Date())
                .expiration(
                    new Date(
                        System.currentTimeMillis() + expiration
                    )
                )
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {

        return getClaims(token)
                .getSubject();
    }

    public String extractRole(String token) {

        return getClaims(token)
                .get("role", String.class);
    }

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {

        try {
            getClaims(token);
            return true;

        } catch (Exception e) {
            return false;
        }
    }
}