package am.foodme.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Lets students paste a Neon / Railway / Supabase {@code postgresql://…} URL
 * as {@code DATABASE_URL} without hand-converting to JDBC.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = firstNonBlank(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("NEON_DATABASE_URL")
        );
        if (raw == null || raw.isBlank()) {
            return;
        }
        // Already JDBC — leave alone (SPRING_DATASOURCE_URL may also be set).
        if (raw.startsWith("jdbc:")) {
            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", raw);
            environment.getPropertySources().addFirst(new MapPropertySource("foodmeDatabaseUrl", props));
            return;
        }
        if (!raw.startsWith("postgres://") && !raw.startsWith("postgresql://")) {
            return;
        }

        try {
            URI uri = URI.create(raw);
            String userInfo = uri.getUserInfo();
            if (userInfo == null || !userInfo.contains(":")) {
                return;
            }
            String[] parts = userInfo.split(":", 2);
            String user = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String password = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath() == null ? "" : uri.getPath();
            String db = path.startsWith("/") ? path.substring(1) : path;
            if (db.contains("?")) {
                db = db.substring(0, db.indexOf('?'));
            }
            String query = uri.getQuery();
            boolean hasSsl = query != null && query.contains("sslmode=");
            String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + db
                    + (hasSsl ? "?" + query : (query == null || query.isBlank()
                    ? "?sslmode=require"
                    : "?" + query + "&sslmode=require"));

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbc);
            props.put("spring.datasource.username", user);
            props.put("spring.datasource.password", password);
            // Prefer these over empty DB_USER defaults when DATABASE_URL is set.
            props.put("DB_USER", user);
            props.put("DB_PASSWORD", password);
            environment.getPropertySources().addFirst(new MapPropertySource("foodmeDatabaseUrl", props));
        } catch (Exception ignored) {
            // Fall back to discrete DB_* / SPRING_DATASOURCE_URL settings.
        }
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a.trim();
        }
        if (b != null && !b.isBlank()) {
            return b.trim();
        }
        return null;
    }
}
