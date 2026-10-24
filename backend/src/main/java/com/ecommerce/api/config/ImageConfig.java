package com.ecommerce.api.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ImageConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path imageDirectory = Paths.get("images")
                .toAbsolutePath()
                .normalize();

        String imageLocation = imageDirectory.toUri().toString();

        registry.addResourceHandler("/images/**")
                .addResourceLocations(imageLocation);
    }
}