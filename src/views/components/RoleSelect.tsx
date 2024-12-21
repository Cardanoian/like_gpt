import React from 'react';
import { Message, UserRole } from '../../models/types';

interface Props {
	currentRole: UserRole;
	onRoleChange: (role: UserRole) => void;
	setMessages: (messages: Message[]) => void;
}

export const RoleSelect: React.FC<Props> = ({
	currentRole,
	onRoleChange,
	setMessages,
}) => {
	return (
		<select
			value={currentRole}
			onChange={(e) => {
				onRoleChange(e.target.value as UserRole);
				setMessages([]);
			}}
			className='px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
		>
			<option value='선생님'>👨‍🏫 선생님</option>
			<option value='학생'>👨‍🎓 학생</option>
			<option value='개발자'>👨‍💻 개발자</option>
		</select>
	);
};
