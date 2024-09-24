import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Message Detail",
  description: "Message Detail Page",
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};

export default RootLayout;
