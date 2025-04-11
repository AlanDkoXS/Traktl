import { useTimerStore } from '../store/timerStore'

export const useTimerNotifications = () => {
	const showNotification = useTimerStore((state) => state.showNotification)

	const notifyTimerStopped = () => {
		showNotification('work')
	}

	const notifyTimeEntrySaved = () => {
		showNotification('work')
	}

	const notifyWorkSessionComplete = () => {
		showNotification('work')
	}

	const notifyBreakSessionComplete = () => {
		showNotification('break')
	}

	const notifyAllSessionsComplete = () => {
		showNotification('complete')
	}

	const notifyBreakCompleted = () => {
		showNotification('work')
	}

	return {
		notifyTimerStopped,
		notifyTimeEntrySaved,
		notifyWorkSessionComplete,
		notifyBreakSessionComplete,
		notifyAllSessionsComplete,
		notifyBreakCompleted,
	}
}
