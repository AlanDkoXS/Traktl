import { useSocket } from '../context/SocketContext'
import { useTranslation } from 'react-i18next'
import { useTimerStore } from '../store/timerStore'

/**
 * Component that shows the connection status
 */
export const StatusIndicator = () => {
	const { isConnected } = useSocket()
	const { isSyncEnabled, setSyncEnabled } = useTimerStore()
	const { t } = useTranslation()

	// Get the status text and color
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

	// Toggle sync
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
