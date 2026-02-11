package com.projet.webapp;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix="com.projet.webapp")
public class CustomProperties {
	
	private String apiUrl;

}
