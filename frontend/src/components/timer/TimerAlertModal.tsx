import React from 'react'
import { useNotificationStore } from '../../services/notificationService'
import { Toast } from '../ui/Toast'

export const TimerAlertModal: React.FC = () => {
	const { showToast, toastType } = useNotificationStore()

	return <Toast show={showToast} type={toastType} />
}
