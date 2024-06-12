import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";

import { Mint } from "./pages/Mint";
import { CreateCollection } from "./pages/CreateCollection";
import { MyCollections } from "./pages/MyCollections";
import { Header } from "./components/Header";

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
        element: <Mint />,
      },
      {
        path: "create-collection",
        element: <CreateCollection />,
      },
      {
        path: "my-collections",
        element: <MyCollections />,
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
