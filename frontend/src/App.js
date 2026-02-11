import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ApplyLoan from "./pages/ApplyLoan";
import Features from "./pages/Features"; // ✅ new import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<ApplyLoan />} />
        <Route path="/features" element={<Features />} /> {/* ✅ new route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
