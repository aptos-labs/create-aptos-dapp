import { AlertOctagon } from "lucide-react";
import { FC, ReactNode } from "react";
import { Alert, AlertDescription } from "./alert";

export const WarningAlert: FC<{
  title: string;
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <Alert variant="warning">
      <AlertOctagon className="w-4 h-4" />
      <AlertDescription className="body-md">{children}</AlertDescription>
    </Alert>
  );
};
