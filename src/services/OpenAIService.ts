import OpenAI from 'openai';
import { Message } from '../models/types';

export class OpenAIService {
	private readonly MODEL = 'gpt-4o-mini';
	private openai: OpenAI;

	constructor() {
		this.openai = new OpenAI({
			apiKey: import.meta.env.VITE_OPENAI_API_KEY,
			dangerouslyAllowBrowser: true,
		});
	}

	private formatMessagesForAPI(
		messages: Message[]
	): { role: 'system' | 'user' | 'assistant'; content: string }[] {
		const systemMessage = {
			role: 'system' as const,
			content:
				'당신은 도움이 되는 AI 어시스턴트입니다. 파일 내용을 분석하고 이해하여 사용자의 질문에 답변해주세요.',
		};

		return [
			systemMessage,
			...messages.map((msg) => {
				let content = msg.content;
				// 파일이 있는 경우 내용을 포함
				if (msg.file) {
					content = `${content}\n\n파일 내용 (${msg.file.name}):\n${msg.file.content}`;
				}
				return {
					role: msg.role,
					content,
				};
			}),
		];
	}

	async *processMessageStream(messages: Message[], signal?: AbortSignal) {
		const conversation = this.formatMessagesForAPI(messages);

		const stream = await this.openai.chat.completions.create(
			{
				model: this.MODEL,
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
}
