import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

import logo from "./assets/aptos.png";

import { Header } from "./components/Header";
import { CreateAsset } from "./pages/CreateAsset";
import { MyAssets } from "./pages/MyAssets";

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <MyAssets />,
      },
      {
        path: "create-asset",
        element: <CreateAsset />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
