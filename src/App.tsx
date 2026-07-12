import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="min-h-screen"
              exit={{ opacity: 0, y: -14 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <HomePage />
            </motion.div>
          }
        />
        <Route
          path="/admin"
          element={
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="min-h-screen"
              exit={{ opacity: 0, y: -14 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <AdminPage />
            </motion.div>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
