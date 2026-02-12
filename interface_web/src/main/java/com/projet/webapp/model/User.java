package com.projet.webapp.model;

import lombok.Data;

@Data
public class User {
	
	private Long id;
	
	private String nom;
	
	private String prenom;
	
	private String mail;
	
	private String login;
	
	private String password;

}
