import { ABI } from '@/utils/abi'
import { aptosClient } from '@/utils/aptosClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletClient } from '@thalalabs/surf/hooks'
import { toast } from 'sonner'

export type TransferAPTArguments = {
	message: string
}

export const useWriteMessage = () => {
	const { client } = useWalletClient()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ message }: TransferAPTArguments) => {
			if (!client) throw new Error('Wallet client not available')
			const result = await client.useABI(ABI).post_message({
				arguments: [message],
				type_arguments: []
			})
			return result.hash
		},
		onSuccess: async (hash) => {
			const executedTransaction = await aptosClient().waitForTransaction({
				transactionHash: hash
			})

			queryClient.invalidateQueries()
			toast('Success', {
				description: `Transaction succeeded, hash: ${executedTransaction.hash}`
			})
		},
		onError: (error) => {
			console.error(error)
		}
	})
}
