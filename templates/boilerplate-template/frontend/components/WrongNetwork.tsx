import { NETWORK } from "@/constants";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import * as Dialog from "@radix-ui/react-dialog";

export function WrongNetwork() {
  const { network } = useWallet();

  return network?.name === NETWORK ? (
    <></>
  ) : (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dialogOverlay backdrop-blur-sm" />
        <Dialog.Content className="z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md w-[50vw] h-[30vh] min-w-[600px] min-h-[200px]">
          <div className="nes-container is-dark with-title w-[100%] h-[100%]">
            <Dialog.Title className="text-2xl font-bold text-center">Switch to {NETWORK}</Dialog.Title>
            <br />
            <Dialog.Description>Please switch your network to {NETWORK} in order to use this app.</Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
