package am.foodme.backend.service;

import am.foodme.backend.dto.AdminLoginRequestDto;
import am.foodme.backend.dto.AdminLoginResponseDto;
import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.model.Admin;
import am.foodme.backend.repository.AdminRepository;
import am.foodme.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminAuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AdminLoginResponseDto login(AdminLoginRequestDto request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Unknown username: " + request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BadRequestException("Incorrect password");
        }

        String token = jwtService.generateToken(admin.getUsername(), admin.getRole());
        return new AdminLoginResponseDto(token, admin.getUsername(), admin.getRole());
    }
}
