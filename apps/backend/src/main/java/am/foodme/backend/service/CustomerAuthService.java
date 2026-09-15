package am.foodme.backend.service;

import am.foodme.backend.dto.CustomerAuthDto;
import am.foodme.backend.dto.CustomerLoginRequestDto;
import am.foodme.backend.dto.CustomerProfileDto;
import am.foodme.backend.dto.CustomerRegisterRequestDto;
import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Customer;
import am.foodme.backend.repository.CustomerRepository;
import am.foodme.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CustomerAuthService(CustomerRepository customerRepository,
                               PasswordEncoder passwordEncoder,
                               JwtService jwtService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public CustomerAuthDto register(CustomerRegisterRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        if (customerRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName().trim());
        customer.setEmail(email);
        customer.setPhoneNumber(request.getPhoneNumber().trim());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setCreatedAt(LocalDateTime.now());

        return toAuth(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public CustomerAuthDto login(CustomerLoginRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        return toAuth(customer);
    }

    @Transactional(readOnly = true)
    public CustomerProfileDto me(String email) {
        return toProfile(requireByEmail(email));
    }

    @Transactional(readOnly = true)
    public Customer requireByEmail(String email) {
        return customerRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new NotFoundException("Customer not found"));
    }

    private CustomerAuthDto toAuth(Customer customer) {
        String token = jwtService.generateToken(customer.getEmail(), "CUSTOMER");
        return new CustomerAuthDto(token, toProfile(customer));
    }

    private CustomerProfileDto toProfile(Customer customer) {
        return new CustomerProfileDto(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhoneNumber()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
