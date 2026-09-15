package am.foodme.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    private final JdbcTemplate jdbcTemplate;

    public ImageService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record StoredImage(String contentType, byte[] data) {
    }

    public Optional<StoredImage> findByPath(String path) {
        List<StoredImage> result = jdbcTemplate.query(
                "SELECT content_type, data FROM foodme.image WHERE path = ?",
                (rs, rowNum) -> new StoredImage(rs.getString("content_type"), rs.getBytes("data")),
                path);
        return result.stream().findFirst();
    }

    public boolean isEmpty() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM foodme.image", Integer.class);
        return count == null || count == 0;
    }

    public void saveAll(List<ImageRow> rows) {
        jdbcTemplate.batchUpdate(
                "INSERT INTO foodme.image (path, content_type, data) VALUES (?, ?, ?) ON CONFLICT (path) DO NOTHING",
                rows,
                100,
                (ps, row) -> {
                    ps.setString(1, row.path());
                    ps.setString(2, row.contentType());
                    ps.setBytes(3, row.data());
                });
    }

    public record ImageRow(String path, String contentType, byte[] data) {
    }
}
