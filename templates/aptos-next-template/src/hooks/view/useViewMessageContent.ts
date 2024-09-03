import { ABI } from '@/utils/abi'
import { surfClient } from '@/utils/aptosClient'
import { useQuery } from '@tanstack/react-query'
import { useWalletClient } from '@thalalabs/surf/hooks'
import { toast } from 'sonner'

export const useViewMessageContent = () => {
	const { client } = useWalletClient()

	return useQuery({
		queryKey: ['message-content'],
		refetchInterval: 10_000,
		queryFn: async () => {
			if (!client) throw new Error('Wallet client not available')

			try {
				const [content] = await surfClient()
					.useABI(ABI)
					.view.get_message_content({
						functionArguments: [],
						typeArguments: []
					})

				return { content }
			} catch (error: any) {
				console.error(error)
				toast.error('Error', {
					description: error.message || 'Failed to fetch message content'
				})
				return { content: '' }
			}
		}
	})
}
