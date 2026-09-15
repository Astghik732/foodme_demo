package am.foodme.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CustomerAuthDto {
    private String token;
    private CustomerProfileDto customer;
}
