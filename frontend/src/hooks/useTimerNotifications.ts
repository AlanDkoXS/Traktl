import { useTranslation } from 'react-i18next'
import { useTimerStore } from '../store/timerStore'

export const useTimerNotifications = () => {
  const { t } = useTranslation()
  const showNotification = useTimerStore(state => state.showNotification)

  const notifyTimerStopped = () => {
    showNotification('work', t('timer.timerStopped'))
  }

  const notifyTimeEntrySaved = () => {
    showNotification('work', t('timer.timeEntrySaved'))
  }

  const notifyWorkSessionComplete = () => {
    showNotification('work', t('timer.workSessionComplete'))
  }

  const notifyBreakSessionComplete = () => {
    showNotification('break', t('timer.breakSessionComplete'))
  }

  const notifyAllSessionsComplete = () => {
    showNotification('work', t('timer.allSessionsComplete'))
  }

  const notifyBreakCompleted = () => {
    showNotification('work', t('timer.breakCompleted'))
  }

  return {
    notifyTimerStopped,
    notifyTimeEntrySaved,
    notifyWorkSessionComplete,
    notifyBreakSessionComplete,
    notifyAllSessionsComplete,
    notifyBreakCompleted
  }
}
