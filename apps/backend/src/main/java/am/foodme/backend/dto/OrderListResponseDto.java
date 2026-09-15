package am.foodme.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class OrderListResponseDto {
    private List<OrderDto> list;
    private long count;
}
