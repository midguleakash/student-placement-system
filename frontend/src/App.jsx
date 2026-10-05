import { useState } from 'react'
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/home/Home";
import AppRoutes from "./routes/AppRoutes";

import './App.css'

function App() {


  return (
    <>
      <Navbar />

      <main>
        <AppRoutes />
        
      </main>

      <Footer />
    </>
  )
}

export default App
