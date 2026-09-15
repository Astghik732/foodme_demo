package am.foodme.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * One-shot loader that copies the bundled seed images (classpath:/img-seed)
 * into the foodme.image table on first start. Idempotent: skips when the
 * table already holds rows.
 */
@Component
@ConditionalOnProperty(name = "foodme.images.seed-enabled", havingValue = "true", matchIfMissing = true)
public class ImageSeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ImageSeedRunner.class);
    private static final String SEED_ROOT = "/img-seed/";

    private final ImageService imageService;

    public ImageSeedRunner(ImageService imageService) {
        this.imageService = imageService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!imageService.isEmpty()) {
            return;
        }
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources(ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX + SEED_ROOT + "**");
        List<ImageService.ImageRow> rows = new ArrayList<>();
        for (Resource resource : resources) {
            String location = URLDecoder.decode(resource.getURL().toString(), StandardCharsets.UTF_8);
            int idx = location.indexOf(SEED_ROOT);
            if (idx < 0) {
                continue;
            }
            String path = location.substring(idx + SEED_ROOT.length());
            String contentType = contentTypeOf(path);
            if (path.isBlank() || contentType == null || !resource.isReadable()) {
                continue;
            }
            rows.add(new ImageService.ImageRow(path, contentType, resource.getInputStream().readAllBytes()));
        }
        imageService.saveAll(rows);
        log.info("Seeded {} images into foodme.image from classpath:{}", rows.size(), SEED_ROOT);
    }

    private static String contentTypeOf(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        return null;
    }
}
