package am.foodme.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// KAN-5: customers rate delivered orders; chef rating becomes the average of those ratings.
// These tests create many orders, so give later classes a fresh context: OrderControllerTest
// asserts the first order number is FM-100001.
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderRatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String register() throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Rater",
                                "email", "rating-test-" + UUID.randomUUID() + "@example.com",
                                "phoneNumber", "+37491234567",
                                "password", "secret123"
                        ))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

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

    /** Places a cash order for the given chef/dish and returns its customer-facing number. */
    private String placeOrder(String customerToken, int chefId, int dishId) throws Exception {
        Map<String, Object> body = Map.of(
                "chefId", chefId,
                "receiverName", "Rater",
                "receiverPhoneNumber", "+37491234567",
                "receiverEmail", "rater@example.com",
                "paymentType", "CASH",
                "deliveryMethod", "TAKEAWAY",
                "createOrderDishes", List.of(Map.of("dishId", dishId, "quantity", 1))
        );
        String response = mockMvc.perform(post("/api/order")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("number").asText();
    }

    private void setStatus(String number, String newStatus) throws Exception {
        String admin = adminToken();
        String list = mockMvc.perform(get("/admin/order").param("size", "500")
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long id = -1;
        for (var node : objectMapper.readTree(list).get("list")) {
            if (number.equals(node.get("number").asText())) {
                id = node.get("id").asLong();
            }
        }
        mockMvc.perform(patch("/admin/order/" + id + "/status")
                        .header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", newStatus))))
                .andExpect(status().isOk());
    }

    private String deliveredOrder(String customerToken, int chefId, int dishId) throws Exception {
        String number = placeOrder(customerToken, chefId, dishId);
        setStatus(number, "ACCEPTED");
        setStatus(number, "DELIVERED");
        return number;
    }

    private String ratingBody(Object stars, String comment) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("stars", stars);
        if (comment != null) {
            body.put("comment", comment);
        }
        return objectMapper.writeValueAsString(body);
    }

    private org.springframework.test.web.servlet.ResultActions rate(String token, String number, String body) throws Exception {
        var request = post("/api/customer/orders/" + number + "/rating")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body);
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    @Test
    void rate_deliveredOrder_savesAndAppearsOnOrder() throws Exception {
        String token = register();
        String number = deliveredOrder(token, 1, 1);

        rate(token, number, ratingBody(5, "Great food"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stars").value(5))
                .andExpect(jsonPath("$.comment").value("Great food"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());

        mockMvc.perform(get("/api/customer/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list[0].rating.stars").value(5))
                .andExpect(jsonPath("$.list[0].rating.comment").value("Great food"));

        mockMvc.perform(get("/api/order/number/" + number))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating.stars").value(5));
    }

    @Test
    void rate_withoutComment_succeeds() throws Exception {
        String token = register();
        String number = deliveredOrder(token, 1, 1);

        rate(token, number, ratingBody(3, null))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stars").value(3))
                .andExpect(jsonPath("$.comment").doesNotExist());
    }

    @Test
    void rate_withoutToken_unauthorized() throws Exception {
        rate(null, "FM-100001", ratingBody(5, null))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rate_someoneElsesOrder_notFound() throws Exception {
        String owner = register();
        String number = deliveredOrder(owner, 1, 1);
        String stranger = register();

        rate(stranger, number, ratingBody(5, null))
                .andExpect(status().isNotFound());
    }

    @Test
    void rate_unknownOrder_notFound() throws Exception {
        rate(register(), "FM-999999", ratingBody(5, null))
                .andExpect(status().isNotFound());
    }

    @Test
    void rate_orderNotDelivered_rejected() throws Exception {
        String token = register();
        String number = placeOrder(token, 1, 1);

        rate(token, number, ratingBody(5, null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only delivered orders can be reviewed."));

        setStatus(number, "ACCEPTED");
        rate(token, number, ratingBody(5, null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only delivered orders can be reviewed."));
    }

    @Test
    void rate_sameOrderTwice_rejected() throws Exception {
        String token = register();
        String number = deliveredOrder(token, 1, 1);

        rate(token, number, ratingBody(4, null)).andExpect(status().isOk());
        rate(token, number, ratingBody(2, null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Order already reviewed."));

        mockMvc.perform(get("/api/order/number/" + number))
                .andExpect(jsonPath("$.rating.stars").value(4));
    }

    @Test
    void rate_invalidStars_rejected() throws Exception {
        String token = register();
        String number = deliveredOrder(token, 1, 1);

        for (Object bad : new Object[]{0, 6, -1, 3.5}) {
            rate(token, number, ratingBody(bad, null))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Rating must be a whole number of stars from 1 to 5"));
        }
        rate(token, number, ratingBody(null, null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Rating must be a whole number of stars from 1 to 5"));
        rate(token, number, "{\"stars\":\"five\"}")
                .andExpect(status().isBadRequest());

        // none of the rejected attempts consumed the order's single rating
        rate(token, number, ratingBody(5, null)).andExpect(status().isOk());
    }

    @Test
    void rate_commentLength_limitIs1000Characters() throws Exception {
        String token = register();
        String tooLong = deliveredOrder(token, 1, 1);
        rate(token, tooLong, ratingBody(5, "x".repeat(1001)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Comment must be at most 1000 characters"));

        String exact = deliveredOrder(token, 1, 1);
        rate(token, exact, ratingBody(5, "x".repeat(1000)))
                .andExpect(status().isOk());
    }

    // Chef 2 is rated only by this test, so its average is fully determined here.
    @Test
    void rate_updatesChefRatingToAverageRoundedToOneDecimal() throws Exception {
        String token = register();

        rate(token, deliveredOrder(token, 2, 3), ratingBody(5, null)).andExpect(status().isOk());
        mockMvc.perform(get("/api/chef/2")).andExpect(jsonPath("$.rating").value(5.0));

        rate(token, deliveredOrder(token, 2, 3), ratingBody(4, null)).andExpect(status().isOk());
        mockMvc.perform(get("/api/chef/2")).andExpect(jsonPath("$.rating").value(4.5));

        rate(token, deliveredOrder(token, 2, 3), ratingBody(4, null)).andExpect(status().isOk());
        // (5 + 4 + 4) / 3 = 4.333... -> 4.3
        mockMvc.perform(get("/api/chef/2")).andExpect(jsonPath("$.rating").value(4.3));
    }

    @Test
    void adminOrder_includesRating_whenRated() throws Exception {
        String token = register();
        String number = deliveredOrder(token, 1, 1);
        rate(token, number, ratingBody(2, "Cold")).andExpect(status().isOk());

        String admin = adminToken();
        String list = mockMvc.perform(get("/admin/order").param("size", "500")
                        .header("Authorization", "Bearer " + admin))
                .andReturn().getResponse().getContentAsString();
        for (var node : objectMapper.readTree(list).get("list")) {
            if (number.equals(node.get("number").asText())) {
                long id = node.get("id").asLong();
                mockMvc.perform(get("/admin/order/" + id).header("Authorization", "Bearer " + admin))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.rating.stars").value(2))
                        .andExpect(jsonPath("$.rating.comment").value("Cold"));
            }
        }
    }
}
