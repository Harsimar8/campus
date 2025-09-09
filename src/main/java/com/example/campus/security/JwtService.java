package com.example.campus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

	@Value("${app.jwt.secret:ZmFrZVNlY3JldEtleUZvckpXVFNob3VsZEJlUmVwbGFjZWQ=}")
	private String secret;

	@Value("${app.jwt.expiration-ms:86400000}") // 1 day default
	private long expirationMs;

	// ✅ Generate token with extra claims (e.g., role)
	public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
				.setClaims(extraClaims)
				.setSubject(userDetails.getUsername())
				.setIssuedAt(now)
				.setExpiration(expiry)
				.signWith(getSigningKey(), SignatureAlgorithm.HS256)
				.compact();
	}

	// ✅ Generate token with role embedded automatically
	public String generateTokenWithRole(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority()); // e.g., ROLE_ADMIN
		return generateToken(userDetails, claims);
	}

	public String extractUsername(String token) {
		return extractAllClaims(token).getSubject();
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		String username = extractUsername(token);
		return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		return extractAllClaims(token).getExpiration().before(new Date());
	}

	public Claims extractAllClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getSigningKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	private Key getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(secret);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
