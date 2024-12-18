// src/views/components/ChatInput.tsx
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Send, Paperclip, X, StopCircle } from 'lucide-react';
import { FileData } from '../../models/types';

interface Props {
	onSend: (message: string, fileData?: FileData) => Promise<void>;
	onStop: () => void;
	isGenerating: boolean;
}

export const ChatInput: React.FC<Props> = ({
	onSend,
	onStop,
	isGenerating,
}) => {
	const [input, setInput] = useState('');
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!input.trim() && !attachedFile) return;

		let fileData: FileData | undefined;
		if (attachedFile) {
			const content = await readFileContent(attachedFile);
			fileData = { file: attachedFile, content };
		}

		const currentInput = input;
		setInput('');

		if (isGenerating) {
			onStop();
		} else {
			await onSend(currentInput, fileData);
		}

		setAttachedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (input.trim() || attachedFile) {
				const form = e.currentTarget.form;
				if (form) form.requestSubmit();
			}
		}
	};

	const readFileContent = async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					resolve(event.target.result.toString());
				} else {
					reject(new Error('Failed to read file'));
				}
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsText(file);
		});
	};

	const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		e.target.style.height = 'inherit';
		e.target.style.height = `${e.target.scrollHeight}px`;
	};

	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const fileType = file.type;
			if (
				fileType === 'text/plain' ||
				fileType === 'text/csv' ||
				file.name.endsWith('.txt') ||
				file.name.endsWith('.csv')
			) {
				setAttachedFile(file);
			} else {
				alert('지원되는 파일 형식: txt, csv');
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
			}
		}
	};

	const removeAttachedFile = () => {
		setAttachedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<form onSubmit={handleSubmit} className='max-w-7xl mx-auto'>
			{attachedFile && (
				<div className='mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between'>
					<span className='text-sm text-gray-600 dark:text-gray-300'>
						{attachedFile.name}
					</span>
					<button
						type='button'
						onClick={removeAttachedFile}
						className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
					>
						<X className='w-4 h-4' />
					</button>
				</div>
			)}
			<div className='flex space-x-4'>
				<textarea
					value={input}
					onChange={handleTextareaChange}
					onKeyDown={handleKeyDown}
					placeholder='메시지를 입력하세요...'
					className='flex-1 p-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none min-h-[40px] max-h-[200px] overflow-y-auto'
					rows={1}
					style={{ height: 'auto' }}
				/>
				<label className='p-2 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'>
					<input
						type='file'
						className='hidden'
						onChange={handleFileSelect}
						ref={fileInputRef}
						accept='.txt,.csv'
					/>
					<Paperclip className='w-5 h-5 text-gray-500 dark:text-gray-400' />
				</label>
				<button
					type='submit'
					className={`px-4 py-2 rounded-lg ${
						isGenerating
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-blue-500 hover:bg-blue-600'
					} text-white transition-colors`}
				>
					{isGenerating ? (
						<StopCircle className='w-5 h-5' />
					) : (
						<Send className='w-5 h-5' />
					)}
				</button>
			</div>
		</form>
	);
};

export default ChatInput;
