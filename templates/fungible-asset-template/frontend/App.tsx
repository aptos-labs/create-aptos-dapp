import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

import { LaunchpadHeader } from "./components/LaunchpadHeader";
import { Mint } from "./pages/Mint";
import { CreateFungibleAsset } from "./pages/CreateFungibleAsset";
import { MyFungibleAssets } from "./pages/MyFungibleAssets";
import { Header } from "./components/Header";

function Layout() {
  return (
    <>
      {import.meta.env.DEV ? <LaunchpadHeader /> : <Header />}
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
        element: <Mint />,
      },
      {
        path: "create-asset",
        element: <CreateFungibleAsset />,
      },
      {
        path: "my-assets",
        element: <MyFungibleAssets />,
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
