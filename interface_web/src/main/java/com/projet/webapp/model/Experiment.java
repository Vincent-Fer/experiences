package com.projet.webapp.model;

import lombok.Data;

@Data
public class Experiment {
	private Long id;
	
	private String nom;
	
	private String tache;
	
	private String nombreStimuli;
}
