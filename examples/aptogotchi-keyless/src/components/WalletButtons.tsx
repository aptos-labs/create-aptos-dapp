"use client";

import { toast } from "sonner";

import { useKeylessAccount } from "@/context/KeylessAccountContext";
import useEphemeralKeyPair from "@/hooks/useEphemeralKeyPair";
import { collapseAddress } from "@/utils/address";

import GoogleLogo from "./GoogleLogo";

const buttonStyles =
  "nes-btn flex items-center justify-center md:gap-4 py-2 flex-nowrap whitespace-nowrap";

export const WalletButtons = () => {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID is not set in env");
  }

  const { keylessAccount, setKeylessAccount } = useKeylessAccount();
  const ephemeralKeyPair = useEphemeralKeyPair();

  const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const searchParams = new URLSearchParams({
    /**
     * Replace with your own client ID
     */
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    /**
     * The redirect_uri must be registered in the Google Developer Console. This callback page
     * parses the id_token from the URL fragment and combines it with the ephemeral key pair to
     * derive the keyless account.
     */
    redirect_uri:
      typeof window !== "undefined"
        ? `${window.location.origin}/callback`
        : (process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : process.env.NEXT_PUBLIC_VERCEL_URL) + "/callback",
    /**
     * This uses the OpenID Connect implicit flow to return an id_token. This is recommended
     * for SPAs (single-page applications) as it does not require a backend server.
     */
    response_type: "id_token",
    scope: "openid email profile",
    nonce: ephemeralKeyPair.nonce,
  });
  redirectUrl.search = searchParams.toString();

  const disconnect = () => {
    setKeylessAccount(null);
    toast.success("Successfully disconnected account");
  };

  if (keylessAccount) {
    return (
      <div className="flex items-center justify-center m-auto sm:m-0 sm:px-4">
        <button
          className={buttonStyles}
          onClick={disconnect}
          title="Disconnect Wallet"
        >
          <GoogleLogo />
          <span title={keylessAccount.accountAddress.toString()}>
            {collapseAddress(keylessAccount.accountAddress.toString())}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center m-auto sm:m-0 sm:px-4">
      <a href={redirectUrl.toString()} className="hover:no-underline">
        <button className={buttonStyles}>
          <GoogleLogo />
          <p>Sign in with Google</p>
        </button>
      </a>
    </div>
  );
};
