import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/layout/Footer.jsx";
import { Navbar } from "./components/layout/Navbar.jsx";
import { AlertStack } from "./components/ui/AlertStack.jsx";
import { Loader } from "./components/ui/Loader.jsx";
import { ProtectedRoute } from "./components/ui/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { BookingPage } from "./pages/BookingPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { MyBookingsPage } from "./pages/MyBookingsPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { SeatAvailabilityPage } from "./pages/SeatAvailabilityPage.jsx";
import { TrainListPage } from "./pages/TrainListPage.jsx";

const Layout = () => {
  const location = useLocation();
  const { initializing } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Restoring your session" size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-cream text-brand-ink">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(29,116,189,0.18),transparent_55%)]" />
      <Navbar />
      <AlertStack />
      <main className="relative z-10 mx-auto min-h-[calc(100vh-168px)] w-full max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trains" element={<TrainListPage />} />
          <Route path="/trains/:id/seats" element={<SeatAvailabilityPage />} />
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => <Layout />;

export default App;
