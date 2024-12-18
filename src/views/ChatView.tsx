import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatController } from '../controllers/ChatController';
import { Message } from '../models/types';
import { ThemeToggle } from './components/ThemeToggle';

export const ChatView: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const controller = useRef(new ChatController()).current;
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = controller.subscribe(() => {
			setMessages(controller.getMessages());
		});
		return () => {
			unsubscribe();
		};
	}, [controller]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSend = async (
		...args: Parameters<typeof controller.sendMessage>
	) => {
		setIsGenerating(true);
		try {
			await controller.sendMessage(...args);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleStop = () => {
		controller.stopGeneration();
		setIsGenerating(false);
	};

	return (
		<div className='flex flex-col h-screen bg-gray-50 dark:bg-gray-900'>
			<div className='bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4'>
				<div className='max-w-4xl mx-auto flex items-center'>
					<div className='flex-1 flex justify-center items-center gap-2'>
						<img
							src='/chatg1pt.svg'
							alt='ChatG1PT Logo'
							className='h-12 w-12'
						/>
						<h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
							ChatG1PT
						</h1>
					</div>
					<div className='flex items-center'>
						<ThemeToggle />
					</div>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom'>
				{messages.map((message) => (
					<ChatMessage key={message.id} message={message} />
				))}
				<div ref={messagesEndRef} />
			</div>

			<div className='border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4'>
				<ChatInput
					onSend={handleSend}
					onStop={handleStop}
					isGenerating={isGenerating}
				/>
			</div>
		</div>
	);
};

export default ChatView;
