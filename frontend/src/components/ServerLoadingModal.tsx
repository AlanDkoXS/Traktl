import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

const ServerLoadingModal = () => {
	const { t } = useTranslation()
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		// Check if the modal has already been shown in this session
		const hasShownModal = localStorage.getItem('serverLoadingModalShown')

		if (hasShownModal) {
			setIsVisible(false)
		} else {
			// Mark that the modal has been shown after a small delay
			setTimeout(() => {
				localStorage.setItem('serverLoadingModalShown', 'true')
			}, 100)
		}
	}, [])

	const handleClose = () => {
		setIsVisible(false)
	}

	const handleContinue = () => {
		setIsVisible(false)
	}

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
				>
					{/* Overlay */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-black/60 overlay-blur-global"
						onClick={handleClose}
					/>

					{/* Modal */}
					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.9, opacity: 0, y: 20 }}
						transition={{ type: 'spring', duration: 0.5 }}
						className="relative bg-white/90 dark:bg-[rgb(var(--color-bg-overlay))]/90 rounded-lg shadow-xl max-w-md w-full mx-4 backdrop-blur-global"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
							<div className="flex items-center space-x-3">
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
										<svg
											className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
									</div>
								</div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-[rgb(var(--color-fg-default))]">
									{t(
										'serverLoading.title',
										'Aviso Importante',
									)}
								</h3>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
								aria-label={t('common.close', 'Cerrar')}
								title={t('common.close', 'Cerrar')}
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							<div className="space-y-4">
								<p className="text-gray-700 dark:text-[rgb(var(--color-fg-muted))] leading-relaxed">
									{t(
										'serverLoading.message',
										'Debido a que utilizamos servidores de prueba, la aplicación puede tardar unos segundos en cargar completamente.',
									)}
								</p>

								<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0">
											<svg
												className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</div>
										<div className="text-sm text-blue-800 dark:text-blue-200">
											<p className="font-medium mb-1">
												{t(
													'serverLoading.tipTitle',
													'Consejo:',
												)}
											</p>
											<p>
												{t(
													'serverLoading.tipMessage',
													'Si la aplicación no responde inmediatamente, por favor espera unos momentos mientras los servidores se activan.',
												)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-[rgb(var(--color-border-primary))]">
							<button
								type="button"
								onClick={handleContinue}
								className="btn btn-primary"
							>
								{t(
									'serverLoading.continue',
									'Entendido, continuar',
								)}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default ServerLoadingModal
