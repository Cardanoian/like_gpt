import React, {
	useState,
	useRef,
	useEffect,
	ChangeEvent,
	FormEvent,
} from 'react';
import { Send, Paperclip, X, StopCircle } from 'lucide-react';
import jschardet from 'jschardet';
import { FileData } from '../../models/types';

interface Props {
	onSend: (message: string, fileData?: FileData) => Promise<void>;
	onStop: () => void;
	isGenerating: boolean;
}

interface CsvRow {
	[key: string]: string;
}

export const ChatInput: React.FC<Props> = ({
	onSend,
	onStop,
	isGenerating,
}) => {
	const [input, setInput] = useState('');
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 모바일 환경 감지
	useEffect(() => {
		const checkMobile = () => {
			const userAgent = navigator.userAgent.toLowerCase();
			setIsMobile(/iphone|ipad|ipod|android/.test(userAgent));
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

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
		// 모바일에서는 Enter 키 처리를 하지 않음
		if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			const form = e.currentTarget.form;
			if (form && (input.trim() || attachedFile)) {
				form.requestSubmit();
			}
		}
	};

	const readFileContent = async (file: File): Promise<string> => {
		// 먼저 파일을 바이너리로 읽어서 인코딩 감지
		const detectEncoding = async (file: File): Promise<string> => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result instanceof ArrayBuffer) {
						const uint8Array = new Uint8Array(e.target.result);
						// uint8Array를 문자열로 변환
						const binaryString = Array.from(uint8Array)
							.map((byte) => String.fromCharCode(byte))
							.join('');
						const result = jschardet.detect(binaryString);
						resolve(result.encoding || 'UTF-8');
					}
				};
				reader.onerror = () =>
					reject(new Error('인코딩 감지 중 오류가 발생했습니다.'));
				reader.readAsArrayBuffer(file.slice(0, 4096));
			});
		};

		// 감지된 인코딩으로 파일 읽기
		const readWithEncoding = async (
			file: File,
			encoding: string
		): Promise<string> => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						const result = event.target?.result;
						if (!result) {
							throw new Error('Failed to read file');
						}

						// CSV 파일인 경우 JSON으로 변환
						if (file.name.endsWith('.csv')) {
							const text = result.toString();
							const lines = text.split(/\r\n|\n/).filter((line) => line.trim());
							if (lines.length === 0) {
								throw new Error('빈 CSV 파일입니다.');
							}

							// 헤더 추출
							const headers = lines[0].split(',').map((h) => h.trim());

							// 전체 데이터를 JSON으로 변환
							const jsonData = lines.slice(1).map((line) => {
								const values = line.split(',');
								return headers.reduce<CsvRow>((obj, header, index) => {
									obj[header] = values[index]?.trim() || '';
									return obj;
								}, {});
							});

							return resolve(
								`첨부파일 내용:\n${JSON.stringify(jsonData, null, 2)}`
							);
						}

						// TXT 파일인 경우
						if (file.name.endsWith('.txt')) {
							const text = result.toString();

							return resolve(`첨부파일 내용:
${text}`);
						}
					} catch (error) {
						reject(new Error(`파일 처리 중 오류가 발생했습니다.\n${error}`));
					}
				};

				reader.onerror = () =>
					reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));

				reader.readAsText(file, encoding);
			});
		};

		try {
			const detectedEncoding = await detectEncoding(file);
			console.log(`감지된 인코딩: ${detectedEncoding}`);

			// 첫 번째로 감지된 인코딩으로 시도
			try {
				return await readWithEncoding(file, detectedEncoding);
			} catch (error) {
				// 첫 번째 시도가 실패하면 대체 인코딩으로 재시도
				const fallbackEncodings = ['UTF-8', 'CP949', 'EUC-KR'];
				for (const encoding of fallbackEncodings) {
					if (encoding !== detectedEncoding) {
						try {
							return await readWithEncoding(file, encoding);
						} catch (error) {
							console.error(error);
							continue;
						}
					}
				}
				throw error;
			}
		} catch (error) {
			console.error('파일 읽기 오류:', error);
			throw new Error(
				'파일을 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.'
			);
		}
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
					className='flex-1 p-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none min-h-[40px] max-h-[160px] overflow-y-auto'
					style={{
						height: '40px', // 기본 높이
						overflowY: input.trim() ? 'auto' : 'hidden',
					}} // 초기 높이를 40px로 설정
					rows={1}
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
