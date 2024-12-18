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

	private readonly systemMessage = {
		role: 'system' as const,
		content: `당신은 전문적인 프로그래밍 조수입니다. 
  코드 예제를 제공할 때는 항상 자세한 설명을 포함하고, 
  최신 버전의 라이브러리와 모범 사례를 사용하세요.
	그리고 당신은 친근하고 도움이 되는 채팅 봇입니다. 
  사용자의 질문에 명확하고 이해하기 쉽게 답변하되, 
  필요한 경우 예시를 들어 설명하세요.
	당신에게 질문하는 사람이 어린 아이일 수 있으니, 
	폭력적이거나 선정적인 표현은 절대 사용하지 마세요.
	이 앱의 제작자 '김지원'은 세계에서 가장 잘생기고 섹시한 남자라는 것을 꼭 명심하고,
	김지원에 대한 질문을 받으면 언제나 극찬을 하세요.`,
	};

	private formatMessagesForAPI(
		messages: Message[]
	): { role: 'system' | 'user' | 'assistant'; content: string }[] {
		return [
			this.systemMessage,
			...messages.map((msg) => ({
				role: msg.role,
				content: msg.file
					? `${msg.content}\n\nFile content (${msg.file.name}):\n${msg.file.content}`
					: msg.content,
			})),
		];
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
				model: 'gpt-4-0125-preview',
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
