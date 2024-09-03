'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWriteMessage } from '@/hooks/entry/useWriteMessage'
import { useViewMessageContent } from '@/hooks/view/useViewMessageContent'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
	message: z.string().min(2).max(300)
})

export function MessageBoard() {
	const { data } = useViewMessageContent()
	const writeMessage = useWriteMessage()
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, isDirty, isValid }
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	})

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		writeMessage.mutate({ message: values.message })
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col gap-6">
				<h4 className="text-lg font-medium">
					Message content: {data?.content}
				</h4>
				<span>New message</span>
				<Input placeholder="yoho" {...register('message')} />
				<Button type="submit" disabled={!isDirty || !isValid}>
					{isSubmitting ? 'Writing...' : 'Write'}
				</Button>
			</div>
		</form>
	)
}
