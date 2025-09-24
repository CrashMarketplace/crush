import { Routes, Route, Router } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./page/Home"
import Signup from "./page/Signup"
import Login from "./page/Login"
import ListingDetail from "./page/ListingDetail"

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path={"/listing/:id"} element={<ListingDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
  