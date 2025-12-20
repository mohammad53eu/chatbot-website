import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    layout("./auth/layout.tsx", [
    route("login", "./auth/Login.tsx"),
    route("register", "./auth/Register.tsx"),
  ]),
  route("chat", "./routes/chat.tsx")

] satisfies RouteConfig;
