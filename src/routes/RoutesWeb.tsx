import Footer from "@/components/headfoot/Footer";
import Header from "@/components/headfoot/Header";
import Admin from "@/pages/Admin/Admin";
import ChangePassword from "@/pages/ChangePassword";
import Home from "@/pages/Home";
import PointSale from "@/pages/PointSale/PointSale";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);
const routers = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <h1>FAIL HOME</h1>,
      },
      {
        path: "/admin",
        element: <Admin />,
        errorElement: <h1>FAIL ADMIN</h1>,
      },
      {
        path: "point-sale/:id",
        element: <PointSale />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      }
    ],
  },
]);

function RoutesWeb() {
  return <RouterProvider router={routers} />;
}

export default RoutesWeb;
