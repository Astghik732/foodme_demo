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
class AdminChefControllerTest {

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

    @Test
    void list_withoutToken_unauthorized() throws Exception {
        mockMvc.perform(get("/admin/chef")).andExpect(status().isUnauthorized());
    }

    // Chef 3 ("closed-kitchen") has no dishes in the seed data, so updating it here
    // can't trip the dish orphanRemoval cascade that other chefs' dish-count
    // assertions (ChefControllerTest, DishControllerTest) rely on.
    @Test
    void update_changesNameEn_persists() throws Exception {
        Map<String, Object> payload = Map.ofEntries(
                Map.entry("username", "closed-kitchen"),
                Map.entry("phoneNumber", "+37493000003"),
                Map.entry("email", "closed@foodme.am"),
                Map.entry("avatarUrl", "/img/chef/3-avatar.jpg"),
                Map.entry("bannerUrl", "/img/chef/3-banner.jpg"),
                Map.entry("status", "INACTIVE"),
                Map.entry("fullNameEn", "Old Yerevan Kitchen (Renovated)"),
                Map.entry("fullNameAm", "Հին Երևանի Խոհանոց"),
                Map.entry("fullNameRu", "Кухня старого Еревана"),
                Map.entry("descriptionEn", "On a break."),
                Map.entry("descriptionAm", "Ընդմիջման մեջ"),
                Map.entry("descriptionRu", "На перерыве"),
                Map.entry("kitchenEn", "Armenian"),
                Map.entry("kitchenAm", "Հայկական"),
                Map.entry("kitchenRu", "Армянская"),
                Map.entry("rating", 4.2),
                Map.entry("platformFee", 0.12),
                Map.entry("deliveryPrice", 700.0),
                Map.entry("freeDeliveryFrom", 8000.0),
                Map.entry("priorityIndex", 2)
        );

        mockMvc.perform(put("/admin/chef/3")
                        .header("Authorization", "Bearer " + adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameEn").value("Old Yerevan Kitchen (Renovated)"));

        mockMvc.perform(get("/admin/chef/3").header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameEn").value("Old Yerevan Kitchen (Renovated)"));
    }
}
