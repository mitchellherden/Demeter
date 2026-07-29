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
import { VerifyEmail } from "./components/VerifyEmail";
import { ResetPassword } from "./components/ResetPassword";
import { AuthGuard } from "./components/AuthGuard";

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
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/registration-success",
    element: <RegistrationSuccess />,
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
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
