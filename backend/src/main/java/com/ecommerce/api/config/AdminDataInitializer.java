package com.ecommerce.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ecommerce.api.entity.Admin;
import com.ecommerce.api.repository.AdminRepository;

@Configuration
public class AdminDataInitializer {

	@Bean
	CommandLineRunner createAdmin(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {

		return args -> {

			if (adminRepository.findByUsername("admin").isEmpty()) {

				Admin admin = new Admin();

				admin.setUsername("admin");
				admin.setPassword(passwordEncoder.encode("admin123"));

				adminRepository.save(admin);

				System.out.println("Default admin account created.");
			}
		};
	}
}