import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

import logo from "./assets/aptos.png";

import { Header } from "./components/Header";
import { MyCollections } from "./pages/MyCollections";

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
