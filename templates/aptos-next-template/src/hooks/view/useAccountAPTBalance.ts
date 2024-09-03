import { surfClient } from '@/utils/aptosClient'
import { COIN_ABI } from '@/utils/coin_abi'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

export type AccountAPTBalanceArguments = {
	accountAddress: `0x${string}` | undefined
}

export const useAccountAPTBalance = (args: AccountAPTBalanceArguments) => {
	const { accountAddress } = args

	return useQuery({
		queryKey: ['apt-balance', accountAddress],
		refetchInterval: 10_000,
		enabled: !!accountAddress,
		queryFn: async () => {
			try {
				const [balance] = await surfClient()
					.useABI(COIN_ABI)
					.view.balance({
						functionArguments: [accountAddress!],
						typeArguments: ['0x1::aptos_coin::AptosCoin']
					})

				return { balance: Number(balance) }
			} catch (error: any) {
				console.error(error)
				toast.error('Error', {
					description: error.message || 'Failed to fetch account balance'
				})
				return { balance: 0 }
			}
		}
	})
}
