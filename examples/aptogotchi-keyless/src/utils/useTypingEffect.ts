import { useEffect, useState } from "react";

const nbsp = "\xa0";

export function useTypingEffect(text: string, speed = 25) {
  const [typedText, setTypedText] = useState(nbsp);

  useEffect(() => {
    // Clear out the type text when the text prop changes
    setTypedText(nbsp);
  }, [text]);

  useEffect(() => {
    if (typedText === text) return;

    const interval = window.setInterval(() => {
      setTypedText((prev) => text.slice(0, prev.length + 1));
    }, speed);

    return () => {
      window.clearInterval(interval);
    };
  }, [text, speed, typedText]);

  return typedText;
}
