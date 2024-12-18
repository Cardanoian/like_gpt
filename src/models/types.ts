export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	file?: {
		name: string;
		content: string;
	};
}

export interface FileData {
	file: File;
	content: string;
}

export type MessageInput = Omit<Message, 'id'>;
