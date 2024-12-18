import React from 'react';
import { Paperclip, X } from 'lucide-react';

interface Props {
	file: File | null;
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFileRemove: () => void;
}

export const FileUpload: React.FC<Props> = ({
	file,
	onFileSelect,
	onFileRemove,
}) => (
	<>
		{file && (
			<div className='mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between'>
				<span className='text-sm text-gray-600'>{file.name}</span>
				<button
					type='button'
					onClick={onFileRemove}
					className='text-gray-500 hover:text-gray-700'
				>
					<X className='w-4 h-4' />
				</button>
			</div>
		)}
		<label className='p-2 border rounded-lg cursor-pointer hover:bg-gray-50'>
			<input
				type='file'
				className='hidden'
				onChange={onFileSelect}
				accept='.txt,.csv'
			/>
			<Paperclip className='w-5 h-5 text-gray-500' />
		</label>
	</>
);
