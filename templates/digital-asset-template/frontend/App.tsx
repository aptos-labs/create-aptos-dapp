import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Mint } from "./pages/Mint";
import { CreateCollection } from "./pages/CreateCollection";
import { MyCollections } from "./pages/MyCollections";

const router = createBrowserRouter([
  {
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
