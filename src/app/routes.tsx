import { createBrowserRouter, RouteObject } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Camera } from "./components/Camera";
import { Profile } from "./components/Profile";
import { Recommendations } from "./components/Recommendations";
import { History } from "./components/History";
import { Onboarding } from "./components/Onboarding";
import { Registration } from "./components/Registration";
import { RegistrationSuccess } from "./components/RegistrationSuccess";
import { Login } from "./components/Login";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Registration />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Registration />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/registration-success",
    element: <RegistrationSuccess />,
  },
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "camera", element: <Camera /> },
      { path: "profile", element: <Profile /> },
      { path: "recommendations", element: <Recommendations /> },
      { path: "history", element: <History /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
