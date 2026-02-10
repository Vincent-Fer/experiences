package model;

public class Comportement {
	
	private String nom;
	private Integer value;
	
	public Comportement(String nom, Integer value) {
		this.setNom(nom);
		this.setValue(value);
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public Integer getValue() {
		return value;
	}

	public void setValue(Integer value) {
		this.value = value;
	}

}
