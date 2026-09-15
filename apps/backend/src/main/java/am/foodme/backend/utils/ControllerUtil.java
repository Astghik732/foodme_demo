package am.foodme.backend.utils;

public class ControllerUtil {
    private static final String API_CONTROLLER = "/api";
    private static final String ADMIN_CONTROLLER = "/admin";
    private static final String CHEF_CONTROLLER = "/chef";
    private static final String DISH_CONTROLLER = "/dish";
    private static final String ORDER_CONTROLLER = "/order";
    private static final String AUTH_CONTROLLER = "/auth";
    private static final String CUSTOMER_CONTROLLER = "/customer";
    private static final String DEBUG_CONTROLLER = "/debug";

    public static final String API_CHEF_CONTROLLER = API_CONTROLLER + CHEF_CONTROLLER;
    public static final String API_DISH_CONTROLLER = API_CONTROLLER + DISH_CONTROLLER;
    public static final String API_ORDER_CONTROLLER = API_CONTROLLER + ORDER_CONTROLLER;
    public static final String API_AUTH_CONTROLLER = API_CONTROLLER + AUTH_CONTROLLER;
    public static final String API_CUSTOMER_CONTROLLER = API_CONTROLLER + CUSTOMER_CONTROLLER;
    public static final String API_DEBUG_CONTROLLER = API_CONTROLLER + DEBUG_CONTROLLER;

    public static final String ADMIN_AUTH_CONTROLLER = ADMIN_CONTROLLER + AUTH_CONTROLLER;
    public static final String ADMIN_CHEF_CONTROLLER = ADMIN_CONTROLLER + CHEF_CONTROLLER;
    public static final String ADMIN_DISH_CONTROLLER = ADMIN_CONTROLLER + DISH_CONTROLLER;
    public static final String ADMIN_ORDER_CONTROLLER = ADMIN_CONTROLLER + ORDER_CONTROLLER;

    private ControllerUtil() {
    }
}
