package com.projet.api;

import javax.management.MXBean;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

import com.projet.api.controller.UserController;
import com.projet.api.service.UserService;

@SpringBootTest
@WebMvcTest(Controllers = UserController.class)
public class UserControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MXBean
	private UserService userService;

	@Test
	public void testGetUsers() throws Exception{
		mockMvc.perform(get("/users"))
			.andExcept(status().isOk());
	}


}
