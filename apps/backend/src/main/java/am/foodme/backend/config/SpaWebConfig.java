package am.foodme.backend.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.lang.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serves the two bundled single-page apps from the backend so the whole product
 * lives on one origin (no cross-service URL, no CORS, no per-deploy config):
 *
 * <ul>
 *   <li>storefront  -> {@code classpath:/static/} at {@code /}</li>
 *   <li>admin        -> {@code classpath:/static/backoffice/} at {@code /backoffice}</li>
 * </ul>
 *
 * The admin app is mounted at {@code /backoffice} (not {@code /admin}) because
 * {@code /admin/**} is the JWT-protected admin REST API. Real API paths are
 * handled by {@code @RestController}s, which take precedence over this resource
 * handler; anything else is a static asset (has a file extension) or a
 * client-side route (no extension), which falls back to the matching SPA shell.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // One handler rooted at /static — the admin build lives under /static/backoffice,
        // so this serves assets for both apps and both index.html shells.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new SpaResourceResolver());
    }

    private static final class SpaResourceResolver extends PathResourceResolver {

        private final Resource storefrontIndex = new ClassPathResource("static/index.html");
        private final Resource adminIndex = new ClassPathResource("static/backoffice/index.html");

        @Override
        protected Resource getResource(@NonNull String resourcePath, @NonNull Resource location) throws IOException {
            // Whether the last path segment looks like a file cleanly separates a static
            // asset request ("/assets/x.js") from a client-side route ("/explore",
            // "/backoffice/chefs") and avoids ever trying to serve a directory.
            String lastSegment = resourcePath;
            int slash = lastSegment.lastIndexOf('/');
            if (slash >= 0) {
                lastSegment = lastSegment.substring(slash + 1);
            }

            if (lastSegment.contains(".")) {
                // Static file: serve it if present, otherwise let it 404 (no SPA shell for a missing asset).
                return super.getResource(resourcePath, location);
            }

            // Never hand an SPA shell to the REST API / infra endpoints.
            if (resourcePath.startsWith("api/") || resourcePath.startsWith("admin/")
                    || resourcePath.startsWith("actuator/") || resourcePath.startsWith("swagger-ui")
                    || resourcePath.startsWith("v3/")) {
                return null;
            }

            boolean admin = resourcePath.equals("backoffice") || resourcePath.startsWith("backoffice/");
            Resource index = admin ? adminIndex : storefrontIndex;
            return index.exists() ? index : null;
        }
    }
}
