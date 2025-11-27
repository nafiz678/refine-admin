import { Refine } from "@refinedev/core";
import {
  DevtoolsPanel,
  DevtoolsProvider,
} from "@refinedev/devtools";
import {
  RefineKbar,
  RefineKbarProvider,
} from "@refinedev/kbar";
import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from "react-router";
import "./App.css";
import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import Dashboard from "./pages/dashboard/dashboard";
import {
  Boxes,
  Image,
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  Tags,
  Ticket,
  Users2,
} from "lucide-react";
import Products from "./pages/products/products";
import { supabaseClient } from "./lib";
import {
  dataProvider,
  liveProvider,
} from "@refinedev/supabase";
import UsersTablePage from "./pages/users/users";
import EditProduct from "./pages/products/edit/edit-products";
import Orders from "./pages/orders/orders";
import Categories from "./pages/category/category";
import Banner from "./pages/Banners/banner";
import Collections from "./pages/collections/collections";
import AddProductPage from "./pages/products/add/add-products";
import { authProvider } from "./lib/auth/auth-provider";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import Coupon from "./pages/coupon/coupon";
import AddCoupon from "./pages/coupon/add/add-coupon";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider(supabaseClient)}
              liveProvider={liveProvider(supabaseClient)}
              authProvider={authProvider}
              resources={[
                {
                  name: "Dashboard",
                  list: "/dashboard",
                  meta: {
                    label: "Dashboard",
                    icon: <LayoutDashboard />,
                  },
                },
                {
                  name: "product",
                  list: "/products",
                  edit: "/products/edit/:id",
                  meta: {
                    canDelete: true,
                    icon: <PackageCheck />,
                    label: "Product",
                  },
                },
                {
                  name: "Users",
                  list: "/users",
                  meta: {
                    icon: <Users2 />,
                    canDelete: true,
                  },
                },
                {
                  name: "coupons",
                  list: "/coupons",
                  meta: {
                    icon: <Ticket />,
                    label: "Coupons",
                  },
                  
                },
                {
                  name: "Orders",
                  list: "/orders",
                  meta: {
                    icon: <ShoppingBag />,
                    label: "Orders"
                  },
                },
                {
                  name: "Categories",
                  list: "/categories",
                  meta: {
                    icon: <Tags />,
                    canDelete: true,
                  },
                },
                {
                  name: "Banner",
                  list: "/banner",
                  meta: {
                    icon: <Image />,
                    label: "Banner",
                    canDelete: true,
                  },
                },
                {
                  name: "Collections",
                  list: "/collections",
                  meta: {
                    icon: <Boxes />,
                    label: "Collection",
                    canDelete: true,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "GfdQqS-RL3UpX-tQ9E9W",
                liveMode: "auto"
              }}
            >
              <Routes>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                >
                  <Route
                    index
                    element={
                      <NavigateToResource resource="Dashboard" />
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={<Dashboard />}
                  />
                  <Route path="/products">
                    <Route index element={<Products />} />
                    <Route
                      path="edit/:id"
                      element={<EditProduct />}
                    />
                    <Route path="add-new" element={<AddProductPage/> }/>
                  </Route>
                  <Route
                    path="/users"
                    element={<UsersTablePage />}
                  />
                  <Route path="/coupons">
                    <Route index element={<Coupon />} />
                    <Route path="add-new" element={<AddCoupon />} />
                  </Route>
                  <Route path="/orders">
                    <Route index element={<Orders />} />
                  </Route>

                  <Route path="/categories">
                    <Route index element={<Categories />} />
                  </Route>
                  <Route
                    path="/banner"
                    element={<Banner />}
                  />
                  <Route path="/collections">
                    <Route index element={<Collections />} />
                  </Route>
                  <Route
                    path="*"
                    element={<ErrorComponent />}
                  />
                </Route>
                <Route path="/register" element={<Register />}/>
                <Route path="/login" element={<Login />}/>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
