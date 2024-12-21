import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { Message } from '../../models/types';

interface Props {
	message: Message;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
	console.log(message);
	// message.content = message.content.replace('\\', '\\\\');
	return (
		<div
			className={`fade-in flex ${
				message.role === 'user' ? 'justify-end' : 'justify-start'
			}`}
		>
			<div
				className={`max-w-[80%] p-3 rounded-lg ${
					message.role === 'user'
						? 'bg-blue-500 text-white'
						: 'bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white'
				}`}
			>
				{message.role === 'user' ? (
					<div className='text-[15px] whitespace-pre-wrap'>
						{message.content}
					</div>
				) : (
					<ReactMarkdown
						className='prose prose-base dark:prose-invert max-w-none text-[15px]'
						rehypePlugins={[rehypeKatex]}
						remarkPlugins={[remarkMath]}
						components={{
							pre: (props) => (
								<pre
									className='bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto'
									{...props}
								/>
							),
							code: ({ className, children, ...props }) => {
								const match = /language-(\w+)/.exec(className || '');
								return (
									<code
										className={
											match
												? `language-${match[1]} bg-gray-100 dark:bg-gray-700 block p-2 rounded`
												: 'bg-gray-100 dark:bg-gray-700 px-1 rounded'
										}
										{...props}
									>
										{children}
									</code>
								);
							},
							p: (props) => (
								<p
									className='mb-4 last:mb-0 dark:text-gray-200 text-[15px]'
									{...props}
								/>
							),
							ul: (props) => (
								<ul
									className='list-disc list-inside mb-4 dark:text-gray-200 text-[15px]'
									{...props}
								/>
							),
							ol: (props) => (
								<ol
									className='list-decimal list-inside mb-4 dark:text-gray-200 text-[15px]'
									{...props}
								/>
							),
							li: (props) => (
								<li
									className='mb-2 last:mb-0 dark:text-gray-200 text-[15px]'
									{...props}
								/>
							),
							blockquote: (props) => (
								<blockquote
									className='border-l-4 border-gray-200 dark:border-gray-600 pl-4 my-4 italic dark:text-gray-300 text-[15px]'
									{...props}
								/>
							),
							a: (props) => (
								<a
									className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-[15px]'
									{...props}
								/>
							),
							h1: (props) => (
								<h1
									className='text-2xl font-bold mb-4 dark:text-gray-100 text-[15px]'
									{...props}
								/>
							),
							h2: (props) => (
								<h2
									className='text-xl font-bold mb-3 dark:text-gray-100 text-[15px]'
									{...props}
								/>
							),
							h3: (props) => (
								<h3
									className='text-lg font-bold mb-3 dark:text-gray-100 text-[15px]'
									{...props}
								/>
							),
							table: (props) => (
								<div className='overflow-x-auto mb-4'>
									<table
										className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-[15px]'
										{...props}
									/>
								</div>
							),
							th: (props) => (
								<th
									className='px-4 py-2 bg-gray-50 dark:bg-gray-700 text-left dark:text-gray-200 text-[15px]'
									{...props}
								/>
							),
							td: (props) => (
								<td
									className='px-4 py-2 border-t border-gray-200 dark:border-gray-700 dark:text-gray-200 text-[15px]'
									{...props}
								/>
							),
						}}
					>
						{message.content || '▋'}
					</ReactMarkdown>
				)}
				{message.file && (
					<div className='text-sm mt-2 opacity-75 dark:text-gray-300'>
						{message.file.name}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatMessage;
