import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Chef from "@/pages/Chef";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Orders from "@/pages/Orders";
import OrderStatus from "@/pages/OrderStatus";
import Tracking from "@/pages/Tracking";

function withLayout(element: ReactNode) {
  return <AppLayout>{element}</AppLayout>;
}

export const router = createBrowserRouter([
  { path: "/", element: withLayout(<Home />) },
  { path: "/explore", element: withLayout(<Explore />) },
  { path: "/chef/:id", element: withLayout(<Chef />) },
  { path: "/checkout", element: withLayout(<Checkout />) },
  { path: "/login", element: withLayout(<Login />) },
  { path: "/register", element: withLayout(<Register />) },
  { path: "/orders", element: withLayout(<Orders />) },
  { path: "/orders/success", element: withLayout(<OrderStatus type="success" />) },
  { path: "/orders/failed", element: withLayout(<OrderStatus type="failure" />) },
  { path: "/tracking/:number", element: withLayout(<Tracking />) },
  { path: "*", element: <Navigate to="/" replace /> },
]);
