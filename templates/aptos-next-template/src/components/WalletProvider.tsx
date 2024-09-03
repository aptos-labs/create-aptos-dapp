'use client'

// Internal components
import { NETWORK } from '@/lib/constants'
// Internal constants
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import type { PropsWithChildren } from 'react'
import { toast } from 'sonner'

export function WalletProvider({ children }: PropsWithChildren) {
	return (
		<AptosWalletAdapterProvider
			autoConnect={true}
			dappConfig={{ network: NETWORK }}
			onError={(error) => {
				toast.error('Error', {
					description: error
				})
			}}
		>
			{children}
		</AptosWalletAdapterProvider>
	)
}
