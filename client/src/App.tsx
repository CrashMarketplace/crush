// src/App.tsx
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
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

            {/* 인증 필요한 페이지 (예시) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/:id" element={<Chats />} />
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
