package am.foodme.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminDishControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken() throws Exception {
        String response = mockMvc.perform(post("/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "admin",
                                "password", "admin123"
                        ))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    // SecurityConfig deliberately permits GET /admin/dish/** without a token so the
    // storefront can preview the admin-curated menu before admin auth kicks in.
    @Test
    void list_withoutToken_succeeds() throws Exception {
        mockMvc.perform(get("/admin/dish"))
                .andExpect(status().isOk());
    }

    // Dish 3 belongs to chef 2 and isn't referenced by any other test, so mutating
    // its price here can't affect chef 1's dish-count assertions elsewhere.
    @Test
    void update_changesPrice_persists() throws Exception {
        Map<String, Object> payload = Map.ofEntries(
                Map.entry("nameEn", "Pork Khorovats"),
                Map.entry("nameHy", "Խոզի խորոված"),
                Map.entry("nameRu", "Свиной хоровац"),
                Map.entry("descriptionEn", "Grill."),
                Map.entry("price", 4950.0),
                Map.entry("url", "/img/dish/3.jpg"),
                Map.entry("portionEn", "400 g"),
                Map.entry("portionHy", "400 գ"),
                Map.entry("portionRu", "400 г"),
                Map.entry("status", "ACTIVE"),
                Map.entry("minimumOrderCount", 1),
                Map.entry("priorityIndex", 0)
        );

        mockMvc.perform(put("/admin/dish/3")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(4950.0));

        mockMvc.perform(get("/admin/dish/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(4950.0));
    }
}
