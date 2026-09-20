package am.foodme.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Adds a small random delay to every API request so the storefront and admin
 * show realistic loading states instead of resolving instantly. Demo-only for
 * the QA course.
 *
 * <p>The delay is applied to {@code /api/**} and {@code /admin/**} only — never
 * to the health check ({@code /actuator/**}), the bundled SPA/static assets, or
 * DB-backed images ({@code /api/images/**}), so Render's health probe, page
 * loads, and image fetches stay fast. The range is configurable via
 * {@code foodme.latency.min-ms} / {@code foodme.latency.max-ms}; the test
 * profile sets both to 0 so the suite is fast and deterministic.
 */
@Configuration
public class SimulatedLatencyConfig implements WebMvcConfigurer {

    @Value("${foodme.latency.min-ms:200}")
    private long minMs;

    @Value("${foodme.latency.max-ms:1500}")
    private long maxMs;

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(new LatencyInterceptor())
                .addPathPatterns("/api/**", "/admin/**")
                .excludePathPatterns("/api/images/**");
    }

    private class LatencyInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(@NonNull HttpServletRequest request,
                                 @NonNull HttpServletResponse response,
                                 @NonNull Object handler) throws InterruptedException {
            if (maxMs > 0) {
                Thread.sleep(ThreadLocalRandom.current().nextLong(minMs, maxMs + 1));
            }
            return true;
        }
    }
}
