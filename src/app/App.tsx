// App entry point for the Demeter application.
// This component mounts the router and the global toast system used across screens.
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  // Attach the route tree and keep the app-level notification container available.
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
