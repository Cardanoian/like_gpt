import { ChatModel } from '../models/ChatModel';
import { OpenAIService } from '../services/OpenAIService';
import { FileData } from '../models/types';

export class ChatController {
	private model: ChatModel;
	private openaiService: OpenAIService;
	private abortController: AbortController | null = null;

	constructor() {
		this.model = new ChatModel();
		this.openaiService = new OpenAIService();
	}

	getMessages() {
		return this.model.getMessages();
	}

	subscribe(listener: () => void) {
		return this.model.subscribe(listener);
	}

	async readFileContent(file: File): Promise<string> {
		if (file.type.startsWith('image/')) {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.readAsDataURL(file);
			});
		} else {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.readAsText(file);
			});
		}
	}

	async sendMessage(message: string, fileData?: FileData) {
		const currentMessages = this.model.getMessages();

		// 사용자 메시지 추가
		this.model.addMessage({
			role: 'user',
			content: message,
			file: fileData
				? {
						name: fileData.file.name,
						content: fileData.content,
				  }
				: undefined,
		});

		try {
			// AI 응답을 위한 빈 메시지 추가
			const assistantMessageId = this.model.addMessage({
				role: 'assistant',
				content: '',
			});

			const stream = this.openaiService.processTextMessageStream(
				currentMessages,
				message,
				this.abortController?.signal
			);

			let fullContent = '';
			for await (const chunk of stream) {
				if (this.abortController?.signal.aborted) {
					break;
				}
				fullContent += chunk;
				this.model.updateMessage(assistantMessageId, fullContent);
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				return;
			}
			this.model.addMessage({
				role: 'assistant',
				content: '오류가 발생했습니다. 다시 시도해 주세요.',
			});
		}
	}

	stopGeneration() {
		this.abortController?.abort();
	}
}
