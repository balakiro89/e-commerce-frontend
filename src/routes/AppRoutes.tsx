import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { BuyerProtectedRoute } from '@/components/BuyerProtectedRoute'
import { SellerProtectedRoute } from '@/components/SellerProtectedRoute'
import { HomeRedirect } from '@/components/HomeRedirect'
import { AuthLayout } from '@/layouts/AuthLayout'
import { BuyerLayout } from '@/layouts/BuyerLayout'
import { SellerLayout } from '@/layouts/SellerLayout'

const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const Dashboard = lazy(() => import('@/pages/buyer/Dashboard'))
const Products = lazy(() => import('@/pages/buyer/Products'))
const ProductDetails = lazy(() => import('@/pages/buyer/ProductDetails'))
const Cart = lazy(() => import('@/pages/buyer/Cart'))
const Checkout = lazy(() => import('@/pages/buyer/Checkout'))
const Orders = lazy(() => import('@/pages/buyer/Orders'))
const OrderDetails = lazy(() => import('@/pages/buyer/OrderDetails'))
const Profile = lazy(() => import('@/pages/buyer/Profile'))
const SellerDashboard = lazy(() => import('@/pages/seller/SellerDashboard'))
const SellerOrders = lazy(() => import('@/pages/seller/SellerOrders'))
const SellerProducts = lazy(() => import('@/pages/seller/SellerProducts'))
const SellerProductForm = lazy(() => import('@/pages/seller/SellerProductForm'))

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<BuyerProtectedRoute />}>
          <Route element={<BuyerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<SellerProtectedRoute />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/products/new" element={<SellerProductForm />} />
            <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
