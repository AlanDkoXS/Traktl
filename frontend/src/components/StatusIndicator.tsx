import { useSocket } from '../context/SocketContext'
import { useTranslation } from 'react-i18next'
import { useTimerStore } from '../store/timerStore'

export const StatusIndicator = () => {
	const { isConnected } = useSocket()
	const { isSyncEnabled, setSyncEnabled } = useTimerStore()
	const { t } = useTranslation()

	const getStatusInfo = () => {
		if (!isConnected) {
			return {
				text: t('timer.disconnected'),
				colorClass: 'text-red-500',
			}
		}

		return {
			text: isSyncEnabled
				? t('timer.syncEnabled')
				: t('timer.syncDisabled'),
			colorClass: isSyncEnabled ? 'text-green-500' : 'text-yellow-500',
		}
	}

	const { text, colorClass } = getStatusInfo()

	const handleToggleSync = () => {
		setSyncEnabled(!isSyncEnabled)
	}

	return (
		<div className="relative">
			<span
				onClick={handleToggleSync}
				className={`text-xs font-medium cursor-pointer ${colorClass} px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800`}
			>
				{text}
			</span>
		</div>
	)
}
