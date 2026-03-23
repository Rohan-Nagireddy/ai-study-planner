package com.studyplanner.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.studyplanner.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@Controller
public class DashboardController {

    private final UserService userService;

    public DashboardController(UserService userService){
        this.userService = userService;
    }

    @GetMapping({"/", "/dashboard"})
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model){
        if(userDetails != null) model.addAttribute("username", userDetails.getUsername());
        return "index"; // reuse the existing dashboard template
    }
}
