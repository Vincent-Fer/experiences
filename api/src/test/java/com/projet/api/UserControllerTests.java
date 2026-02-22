package com.projet.api;

import static org.hamcrest.CoreMatchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.projet.api.controller.UserController;
import com.projet.api.service.UserService;

@WebMvcTest(controllers = UserController.class)
public class UserControllerTests {
	
	@Autowired
	private MockMvc mockMvc;
	
	@MockitoBean
	private UserService userService;
	
	@Test
	public void testGetUsers() throws Exception{
		mockMvc.perform(get("/users")).andExpect(status().isOk());
	}
}
