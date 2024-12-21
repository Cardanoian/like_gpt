import OpenAI from 'openai';
import { Message, RoleConfig, roleConfigs, UserRole } from '../models/types';

export class OpenAIService {
	private currentConfig: RoleConfig;
	private openai: OpenAI;

	constructor(initialRole: UserRole = '학생') {
		this.currentConfig = roleConfigs[initialRole];
		this.openai = new OpenAI({
			apiKey: import.meta.env.VITE_OPENAI_API_KEY,
			dangerouslyAllowBrowser: true,
		});
	}

	setRole(role: UserRole) {
		this.currentConfig = roleConfigs[role];
	}

	private formatMessagesForAPI(
		messages: Message[]
	): { role: 'system' | 'user' | 'assistant'; content: string }[] {
		return [
			{
				role: 'system',
				content: this.currentConfig.systemMessage,
			},
			...messages.map((msg) => ({
				role: msg.role,
				content:
					msg.content +
					(msg.file
						? `\n\n파일 내용 (${msg.file.name}):\n${msg.file.content}`
						: ''),
			})),
		];
	}

	async *processMessageStream(messages: Message[], signal?: AbortSignal) {
		const conversation = this.formatMessagesForAPI(messages);

		const stream = await this.openai.chat.completions.create(
			{
				model: this.currentConfig.model,
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
