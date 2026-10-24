package com.ecommerce.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ecommerce.api.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {

		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http
				// Enable CORS
				.cors(cors -> {
				})

				// Disable CSRF for REST API
				.csrf(csrf -> csrf.disable())

				// Use stateless JWT authentication
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// Authorization rules
				.authorizeHttpRequests(auth -> auth

						// Allow admin login without authentication
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

						// Allow public access to products
						.requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

						// Allow public access to categories
						.requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

						.requestMatchers("/images/**").permitAll()
						
						// Only ADMIN can create products
						.requestMatchers(HttpMethod.POST, "/api/products").hasRole("ADMIN")

						// Only ADMIN can update products
						.requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")

						// Only ADMIN can delete products
						.requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

						// All other requests require authentication
						.anyRequest().authenticated())

				// Add JWT authentication filter
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}