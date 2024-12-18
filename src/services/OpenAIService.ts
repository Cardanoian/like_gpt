import OpenAI from 'openai';
import { Message } from '../models/types';

export class OpenAIService {
	private openai: OpenAI;

	constructor() {
		this.openai = new OpenAI({
			apiKey: import.meta.env.VITE_OPENAI_API_KEY,
			dangerouslyAllowBrowser: true,
		});
	}

	private formatMessagesForAPI(
		messages: Message[]
	): { role: 'user' | 'assistant'; content: string }[] {
		return messages.map((msg) => ({
			role: msg.role,
			content: msg.file
				? `${msg.content}\n\nFile content (${msg.file.name}):\n${msg.file.content}`
				: msg.content,
		}));
	}

	async *processTextMessageStream(
		messages: Message[],
		newMessage: string,
		signal?: AbortSignal
	) {
		const conversation = this.formatMessagesForAPI(messages);
		conversation.push({ role: 'user', content: newMessage });

		const stream = await this.openai.chat.completions.create(
			{
				model: 'gpt-4o',
				messages: conversation,
				stream: true,
			},
			{ signal }
		);

		for await (const chunk of stream) {
			if (chunk.choices[0]?.delta?.content) {
				yield chunk.choices[0].delta.content;
			}
		}
	}

	async *processImageMessageStream(
		messages: Message[],
		image: string,
		prompt: string,
		signal?: AbortSignal
	) {
		const conversation = this.formatMessagesForAPI(messages);
		const stream = await this.openai.chat.completions.create(
			{
				model: 'gpt-4o',
				messages: [
					...conversation,
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: prompt || '이 이미지에 대해 설명해주세요.',
							},
							{
								type: 'image_url',
								image_url: { url: image },
							},
						],
					},
				],
				stream: true,
			},
			{ signal }
		);

		for await (const chunk of stream) {
			if (chunk.choices[0]?.delta?.content) {
				yield chunk.choices[0].delta.content;
			}
		}
	}
}
