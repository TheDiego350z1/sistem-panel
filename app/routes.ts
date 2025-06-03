import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/auth-layout.tsx", [
    index("routes/home.tsx"),
    ...prefix("/providers", [route("/", "routes/providers/index.tsx")]),
  ]),

  route("/login", "routes/login.tsx"),
] satisfies RouteConfig;
