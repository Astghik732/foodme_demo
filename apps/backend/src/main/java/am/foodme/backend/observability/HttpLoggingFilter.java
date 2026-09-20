package am.foodme.backend.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Logs every HTTP call handled by the app — method, path, status, duration, and
 * the request/response headers and bodies — to a dedicated {@code http} logger
 * at INFO. With the Loki appender enabled these lines are shipped to Loki, so
 * the whole request/response trail is queryable in Grafana.
 *
 * <p>Runs first in the filter chain (HIGHEST_PRECEDENCE) so it wraps Spring
 * Security too and sees the final status even for rejected requests. Only
 * {@code /api/**} and {@code /admin/**} traffic is logged; static SPA assets and
 * actuator probes are skipped to keep the stream signal-heavy.
 *
 * <p>Secrets are redacted before anything is logged: the Authorization/Cookie
 * family of headers, and {@code password}/{@code token}-style fields in JSON
 * bodies. Disable entirely with {@code foodme.http-logging.enabled=false}.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(name = "foodme.http-logging.enabled", havingValue = "true", matchIfMissing = true)
public class HttpLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("am.foodme.backend.observability.http");

    /** Bodies larger than this are truncated in the log (they're still delivered in full). */
    private static final int MAX_BODY_BYTES = 8_192;

    /** Header names whose values are masked (compared case-insensitively). */
    private static final Set<String> SENSITIVE_HEADERS = Set.of(
            "authorization", "proxy-authorization", "cookie", "set-cookie",
            "x-api-key", "x-internal-api-key");

    /** JSON string fields whose values are masked, e.g. "password":"***". */
    private static final Pattern SENSITIVE_JSON_FIELD = Pattern.compile(
            "(\"(?:password|token|accessToken|refreshToken|secret)\"\\s*:\\s*\")[^\"]*(\")",
            Pattern.CASE_INSENSITIVE);

    private static final String REDACTED = "***";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith("/api/") || path.startsWith("/admin/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        ContentCachingRequestWrapper req = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper res = new ContentCachingResponseWrapper(response);

        long start = System.nanoTime();
        try {
            filterChain.doFilter(req, res);
        } finally {
            long tookMs = (System.nanoTime() - start) / 1_000_000;
            try {
                log.info("HTTP {}", buildLogLine(req, res, tookMs));
            } catch (RuntimeException ex) {
                // Logging must never break the response.
                log.warn("Failed to log HTTP exchange for {} {}", request.getMethod(), request.getRequestURI(), ex);
            }
            // Copy the cached body back to the real response — required or the client gets an empty body.
            res.copyBodyToResponse();
        }
    }

    private String buildLogLine(ContentCachingRequestWrapper req, ContentCachingResponseWrapper res, long tookMs) {
        String query = req.getQueryString();
        StringBuilder sb = new StringBuilder(512);
        sb.append(req.getMethod()).append(' ').append(req.getRequestURI());
        if (StringUtils.hasText(query)) {
            sb.append('?').append(query);
        }
        sb.append(" -> ").append(res.getStatus())
          .append(" (").append(tookMs).append("ms)")
          .append(" from ").append(req.getRemoteAddr());

        sb.append("\n  req.headers: ").append(requestHeaders(req));
        String reqBody = bodyOf(req.getContentAsByteArray(), req.getContentType());
        if (reqBody != null) {
            sb.append("\n  req.body: ").append(reqBody);
        }

        sb.append("\n  res.headers: ").append(responseHeaders(res));
        String resBody = bodyOf(res.getContentAsByteArray(), res.getContentType());
        if (resBody != null) {
            sb.append("\n  res.body: ").append(resBody);
        }
        return sb.toString();
    }

    private String requestHeaders(HttpServletRequest req) {
        StringBuilder sb = new StringBuilder("{");
        Enumeration<String> names = req.getHeaderNames();
        boolean first = true;
        while (names != null && names.hasMoreElements()) {
            String name = names.nextElement();
            String value = isSensitiveHeader(name)
                    ? REDACTED
                    : String.join(",", Collections.list(req.getHeaders(name)));
            if (!first) sb.append(", ");
            sb.append(name).append('=').append(value);
            first = false;
        }
        return sb.append('}').toString();
    }

    private String responseHeaders(HttpServletResponse res) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (String name : res.getHeaderNames()) {
            String value = isSensitiveHeader(name)
                    ? REDACTED
                    : String.join(",", res.getHeaders(name));
            if (!first) sb.append(", ");
            sb.append(name).append('=').append(value);
            first = false;
        }
        return sb.append('}').toString();
    }

    private boolean isSensitiveHeader(String name) {
        return SENSITIVE_HEADERS.contains(name.toLowerCase(Locale.ROOT));
    }

    /**
     * Returns a loggable, redacted, size-capped rendering of a body, or {@code null}
     * when there is nothing worth logging (empty, or a non-textual content type).
     */
    private String bodyOf(byte[] content, String contentType) {
        if (content == null || content.length == 0 || !isTextual(contentType)) {
            return null;
        }
        int len = Math.min(content.length, MAX_BODY_BYTES);
        String body = new String(content, 0, len, StandardCharsets.UTF_8);
        body = SENSITIVE_JSON_FIELD.matcher(body).replaceAll("$1" + REDACTED + "$2");
        if (content.length > MAX_BODY_BYTES) {
            body = body + "...[truncated " + (content.length - MAX_BODY_BYTES) + " bytes]";
        }
        return body;
    }

    private boolean isTextual(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return false;
        }
        String ct = contentType.toLowerCase(Locale.ROOT);
        return ct.contains("json") || ct.contains("xml") || ct.startsWith("text/")
                || ct.contains("x-www-form-urlencoded");
    }
}
