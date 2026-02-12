package com.projet.api.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.projet.api.model.Experiment;

@Repository
public interface ExperimentRepository extends CrudRepository<Experiment, Long> {

}
