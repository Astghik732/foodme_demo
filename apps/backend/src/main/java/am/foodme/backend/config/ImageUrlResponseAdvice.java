package am.foodme.backend.config;

import am.foodme.backend.dto.AdminListResponseDto;
import am.foodme.backend.dto.ChefResponseDto;
import am.foodme.backend.dto.DishDto;
import am.foodme.backend.dto.DishPaginationCountDto;
import am.foodme.backend.dto.ExploreChefResponseDto;
import am.foodme.backend.dto.OrderDishDto;
import am.foodme.backend.dto.OrderDto;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Collection;
import java.util.Map;

/**
 * Image references are stored API-relative (/api/images/...) so one database
 * works in every environment. This advice absolutizes them against the
 * incoming request's scheme/host/port just before serialization.
 */
@RestControllerAdvice
public class ImageUrlResponseAdvice implements ResponseBodyAdvice<Object> {

    private static final String IMAGE_PREFIX = "/api/images/";

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        rewrite(body);
        return body;
    }

    private void rewrite(Object node) {
        if (node == null) {
            return;
        }
        if (node instanceof ChefResponseDto chef) {
            chef.setAvatarUrl(absolutize(chef.getAvatarUrl()));
            chef.setBannerUrl(absolutize(chef.getBannerUrl()));
        } else if (node instanceof ExploreChefResponseDto chef) {
            chef.setAvatarUrl(absolutize(chef.getAvatarUrl()));
            chef.setBannerUrl(absolutize(chef.getBannerUrl()));
            rewrite(chef.getDishes());
        } else if (node instanceof DishDto dish) {
            dish.setUrl(absolutize(dish.getUrl()));
        } else if (node instanceof OrderDishDto orderDish) {
            orderDish.setUrl(absolutize(orderDish.getUrl()));
        } else if (node instanceof OrderDto order) {
            rewrite(order.getOrderDishList());
        } else if (node instanceof AdminListResponseDto<?> adminList) {
            rewrite(adminList.getList());
        } else if (node instanceof DishPaginationCountDto page) {
            rewrite(page.getDishDtoList());
        } else if (node instanceof Collection<?> collection) {
            collection.forEach(this::rewrite);
        } else if (node instanceof Map<?, ?> map) {
            map.values().forEach(this::rewrite);
        }
    }

    private String absolutize(String url) {
        if (url == null || !url.startsWith(IMAGE_PREFIX)) {
            return url;
        }
        return ServletUriComponentsBuilder.fromCurrentContextPath().path(url).build().toUriString();
    }
}
