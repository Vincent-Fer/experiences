package com.projet.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projet.api.model.Experiment;
import com.projet.api.service.ExperimentService;

@RestController
public class ExperimentController {

	@Autowired
	private ExperimentService experimentService;

	@GetMapping("/experiments")
	public Iterable<Experiment> getExperiments(){
		return experimentService.getExperiments();
	}
}
