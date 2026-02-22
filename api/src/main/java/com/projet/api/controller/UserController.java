package com.projet.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projet.api.model.User;
import com.projet.api.service.UserService;

@RestController
public class UserController {
	@Autowired
	private UserService userService;

	@GetMapping("/users")
	public Iterable<User> getUsers(){
		return userService.getUsers();
	}
}
