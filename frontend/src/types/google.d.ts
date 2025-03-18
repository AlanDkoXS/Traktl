// Define Google Identity Services types
interface GoogleCredentialResponse {
	credential: string
	clientId: string
	select_by: string
}

interface GoogleNotification {
	isDisplayed: () => boolean
	isNotDisplayed: () => boolean
	isSkippedMoment: () => boolean
	isDismissedMoment: () => boolean
	getNotDisplayedReason: () => string
	getSkippedReason: () => string
	getDismissedReason: () => string
}

interface GoogleButtonConfig {
	theme?: 'outline' | 'filled_blue' | 'filled_black'
	size?: 'large' | 'medium' | 'small'
	text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
	shape?: 'rectangular' | 'pill' | 'circle' | 'square'
	width?: string | number
	locale?: string
}

interface GoogleIdentityServices {
	accounts: {
		id: {
			initialize: (config: {
				client_id: string
				callback: (response: GoogleCredentialResponse) => void
				auto_select?: boolean
				cancel_on_tap_outside?: boolean
			}) => void
			prompt: (
				callback: (notification: GoogleNotification) => void,
			) => void
			renderButton: (
				element: HTMLElement,
				config: GoogleButtonConfig,
			) => void
			disableAutoSelect: () => void
		}
	}
}

// Extend Window interface to include Google Identity Services
declare global {
	interface Window {
		google?: GoogleIdentityServices
	}
}

export {}
