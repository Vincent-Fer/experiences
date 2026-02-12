package com.projet.api.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.projet.api.model.Experiment;
import com.projet.api.repository.ExperimentRepository;

import lombok.Data;

@Data
@Service
public class ExperimentService {
	@Autowired
	private ExperimentRepository experimentRepository;
	
	public Optional<Experiment> getExperiment(final Long id){
		return experimentRepository.findById(id);
	}
	
	public Iterable<Experiment> getExperiments(){
		return experimentRepository.findAll();
	}
	
	public void deleteExperiment(final Long id) {
		experimentRepository.deleteById(id);
	}
	
	public Experiment saveExperiment(Experiment experiment) {
		Experiment savedExperiment = experimentRepository.save(experiment);
		return savedExperiment;
	}
}
