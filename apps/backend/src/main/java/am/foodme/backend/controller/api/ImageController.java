package am.foodme.backend.controller.api;

import am.foodme.backend.service.ImageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@RestController
public class ImageController {

    private static final String PREFIX = "/api/images/";

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping(PREFIX + "**")
    public ResponseEntity<byte[]> getImage(HttpServletRequest request) {
        String uri = URLDecoder.decode(request.getRequestURI(), StandardCharsets.UTF_8);
        int idx = uri.indexOf(PREFIX);
        if (idx < 0) {
            return ResponseEntity.notFound().build();
        }
        String path = uri.substring(idx + PREFIX.length());
        return imageService.findByPath(path)
                .map(image -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(image.contentType()))
                        .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                        .body(image.data()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
