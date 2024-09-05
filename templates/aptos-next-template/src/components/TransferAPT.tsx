'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTransferCoin } from '@/hooks/entry/useTransferCoin'
import { useAccountAPTBalance } from '@/hooks/view/useAccountAPTBalance'
import { aptosClient, callFaucet } from '@/utils/aptosClient'
import { parseAptos } from '@/utils/units'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { ToastAction } from '@radix-ui/react-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

export function TransferAPT() {
	const { account } = useWallet()
	const queryClient = useQueryClient()
	const transferMutation = useTransferCoin()
	const { data } = useAccountAPTBalance({
		accountAddress: account?.address as `0x${string}`
	})
	const [recipient, setRecipient] = useState<string>()
	const [transferAmount, setTransferAmount] = useState<number>()

	const doTransfer = async () => {
		if (!account || !recipient || !transferAmount) {
			return
		}

		try {
			await transferMutation.mutate({
				to: recipient as `0x${string}`,
				amount: transferAmount * 1e8 // Convert to Octas
			})
		} catch (error) {
			console.error(error)
		}
	}

	const topUp = async () => {
		const hashes = await callFaucet(parseAptos('1'), account!.address)
		const executedTransaction = await aptosClient().waitForTransaction({
			transactionHash: hashes as unknown as string
		})
		queryClient.invalidateQueries()
		toast('Transaction sent', {
			action: (
				<ToastAction
					altText="View Hash"
					onClick={() => {
						window.open(
							`https://explorer.aptoslabs.com/txn/${executedTransaction.hash}?network=${process.env.NEXT_PUBLIC_APP_NETWORK}`,
							'_blank'
						)
					}}
				>
					View Hash
				</ToastAction>
			)
		})
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-row items-center gap-2">
				<h4 className="text-lg font-medium">
					APT balance: {data?.balance ? data.balance / Math.pow(10, 8) : 0}
				</h4>
				{process.env.NEXT_PUBLIC_APP_NETWORK !== 'mainnet' && (
					<Button onClick={topUp}>Top Up</Button>
				)}
			</div>
			Recipient{' '}
			<Input
				disabled={!account}
				placeholder="0x1"
				onChange={(e) => setRecipient(e.target.value)}
			/>
			Amount{' '}
			<Input
				disabled={!account}
				placeholder="100"
				onChange={(e) => setTransferAmount(Number.parseFloat(e.target.value))}
			/>
			<Button
				disabled={
					!account ||
					!recipient ||
					!transferAmount ||
					transferAmount > (data?.balance ?? 0) ||
					transferAmount <= 0
				}
				onClick={doTransfer}
			>
				Transfer
			</Button>
		</div>
	)
}
