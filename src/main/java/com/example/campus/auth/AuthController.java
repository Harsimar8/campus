package com.example.campus.auth;

import com.example.campus.user.Role;
import com.example.campus.user.User;
import com.example.campus.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.campus.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

record SignupRequest(@NotBlank @Size(min=3,max=100) String username,
					 @NotBlank @Size(min=8,max=255) String password,
					 @NotBlank String role) {}

record LoginRequest(@NotBlank String username, @NotBlank String password) {}

record MessageResponse(String message) {}
record LoginResponse(String message, String token, String role) {}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthController(UserRepository userRepository,
						 PasswordEncoder passwordEncoder,
						 AuthenticationManager authenticationManager,
						 JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
		if (userRepository.existsByUsername(req.username())) {
			return ResponseEntity.badRequest().body(new MessageResponse("User already exists"));
		}
		Role role;
		try {
			role = Role.valueOf(req.role().toUpperCase());
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body(new MessageResponse("Invalid role. Allowed: ADMIN, FACULTY, STUDENT"));
		}
		User user = new User();
		user.setUsername(req.username());
		user.setPassword(passwordEncoder.encode(req.password()));
		user.setRole(role);
		
		// Auto-generate student ID for students
		if (role == Role.STUDENT) {
			String studentId = generateStudentId();
			user.setStudentId(studentId);
		}
		
		userRepository.save(user);
		return ResponseEntity.ok(new MessageResponse("Signup successful"));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
		return userRepository.findByUsername(req.username())
			.map(u -> {
				try {
					Authentication authentication = authenticationManager.authenticate(
							new UsernamePasswordAuthenticationToken(req.username(), req.password()));
					SecurityContextHolder.getContext().setAuthentication(authentication);
					String token = jwtService.generateToken((UserDetails) authentication.getPrincipal(), Map.of("role", u.getRole().name()));
					return ResponseEntity.ok(new LoginResponse("Login successful as " + u.getRole().name(), token, u.getRole().name()));
				} catch (BadCredentialsException ex) {
					return ResponseEntity.status(401).body(new MessageResponse("Invalid credentials"));
				}
			})
			.orElseGet(() -> ResponseEntity.status(404).body(new MessageResponse("User not found in database"))); 
	}

	@GetMapping("/me")
	public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
		if (userDetails == null) {
			return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
		}
		return userRepository.findByUsername(userDetails.getUsername())
				.<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of(
						"id", u.getId(),
						"username", u.getUsername(),
						"role", u.getRole().name()
				)))
				.orElseGet(() -> ResponseEntity.status(404).body(new MessageResponse("User not found in database")));
	}

	private String generateStudentId() {
		// Generate student ID in format: STU + year + 4-digit number
		String year = String.valueOf(java.time.Year.now().getValue()).substring(2);
		long count = userRepository.count() + 1;
		return "STU" + year + String.format("%04d", count);
	}
}


