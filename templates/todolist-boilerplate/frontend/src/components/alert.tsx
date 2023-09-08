import { Alert } from "antd";
import { Dispatch, ReactNode, SetStateAction } from "react";

type Alert = {
  text: ReactNode;
  setText: Dispatch<SetStateAction<ReactNode | null>>;
};

export function SuccessAlert({ text }: Alert) {
  return <Alert message={text} type="success" closable />;
}

export function ErrorAlert({ text }: Alert) {
  return <Alert message={text} type="error" closable />;
}
