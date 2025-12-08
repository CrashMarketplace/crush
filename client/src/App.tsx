// src/App.tsx
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
// 🎄 크리스마스 효과 (나중에 삭제 가능)
import ChristmasEffects from "./components/ChristmasEffects";
import ChristmasPopup from "./components/ChristmasPopup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ListingDetail from "./pages/ListingDetail";
import ProductNew from "./pages/ProductNew";
import Feed from "./pages/Feed";
import Categories from "./pages/Categories";
import AllProducts from "./pages/AllProducts";
import MyPage from "./pages/MyPage";
import Chats from "./pages/Chats";
import Admin from "./pages/Admin";
import ProductEdit from "./pages/ProductEdit";
import Reservations from "./pages/Reservations";
import Notifications from "./pages/Notifications";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserReviews from "./pages/UserReviews";
import MyPayments from "./pages/MyPayments";
import FraudAnalytics from "./pages/FraudAnalytics";
import ProtectedRoute from "./routes/ProtectedRoute";

const HIDE_LAYOUT_PATHS = ["/login", "/signup"] as const;

// 특정 경로에서는 Header/Footer 숨기기
const shouldHideLayout = (pathname: string) =>
  HIDE_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

export default function App() {
  const { pathname } = useLocation();
  const hideLayout = shouldHideLayout(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <SocketProvider>
          {/* 🎄 크리스마스 효과 (나중에 삭제 가능) */}
          <ChristmasEffects />
          <ChristmasPopup />
          
          {/* 로그인/회원가입 페이지에서는 Header 숨김 */}
          {!hideLayout && <Header />}

          <main className="flex-1">
            <Routes>
            {/* 공개 페이지 */}
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/feed/recommend" element={<Feed mode="recommend" />} />
            <Route path="/feed/hot" element={<Feed mode="hot" />} />
            <Route path="/feed/new" element={<Feed mode="new" />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/all" element={<AllProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/sell" element={<ProductNew />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/user/:userId/reviews" element={<UserReviews />} />

            {/* 인증 필요한 페이지 (예시) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/:id" element={<Chats />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/fraud-analytics" element={<FraudAnalytics />} />
              <Route path="/product/edit/:id" element={<ProductEdit />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/payments" element={<MyPayments />} />
            </Route>
            </Routes>
          </main>

          {/* 로그인/회원가입 페이지에서는 Footer 숨김 */}
          {!hideLayout && <Footer />}
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}
