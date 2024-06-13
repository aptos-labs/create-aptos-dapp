import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

import { Mint } from "./pages/Mint";
import { CreateFungibleAsset } from "./pages/CreateFungibleAsset";
import { MyFungibleAssets } from "./pages/MyFungibleAssets";

function Layout() {
  return (
    <>
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
