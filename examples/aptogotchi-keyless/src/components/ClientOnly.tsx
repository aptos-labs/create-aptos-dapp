"use client";

import { PropsWithChildren, useEffect, useState } from "react";

/**
 * To fix Next.js issues with mismatching nonce (client-side) and nonce (server-side) errors.
 *
 * Prevents hydration mismatches by only rendering children on the client. This is different
 * from the 'use client' directive because it prevents the child from being pre-rendered on the
 * server at all.
 */
function ClientOnly({ children }: PropsWithChildren) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default ClientOnly;
