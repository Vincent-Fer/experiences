package model;

import java.util.HashMap;

public class Questionnaire {
	
	private String nom;
	private HashMap<Integer,String> listQuestions;
	private HashMap<Integer,Integer> listReponses;
	
	public Questionnaire(String nom) {
		this.nom = nom;
		setListQuestions(new HashMap<>());
		setListReponses(new HashMap<>());
	}
	
	public Questionnaire(String nom, HashMap<Integer,String> listQuestions, HashMap<Integer,Integer> listReponses) {
		this.nom = nom;
		this.listQuestions = listQuestions;
		this.listReponses = listReponses;
	}
	
	public String getNom() {
		return nom;
	}
	public void setNom(String nom) {
		this.nom = nom;
	}

	public HashMap<Integer,String> getListQuestions() {
		return listQuestions;
	}

	public void setListQuestions(HashMap<Integer,String> listQuestions) {
		this.listQuestions = listQuestions;
	}

	public HashMap<Integer,Integer> getListReponses() {
		return listReponses;
	}

	public void setListReponses(HashMap<Integer,Integer> listReponses) {
		this.listReponses = listReponses;
	}
	
	
	
	
}
