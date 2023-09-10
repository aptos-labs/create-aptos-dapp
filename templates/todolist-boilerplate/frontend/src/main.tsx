import React from "react";
import ReactDOM from "react-dom/client";

import Start from "./start";
import { AlertProvider } from "./components/alertProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AlertProvider>
      <Start />
    </AlertProvider>
  </React.StrictMode>
);
