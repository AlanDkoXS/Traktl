import React from 'react'

interface AppIconProps {
	className?: string
}

export const AppIcon: React.FC<AppIconProps> = ({ className = '' }) => {
	return (
		<svg
			className={`w-6 h-6 dynamic-color ${className}`}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g id="Iconly/Curved/Time Square">
				<g id="Time Square">
					<path
						id="Stroke 1"
						fillRule="evenodd"
						clipRule="evenodd"
						d="M2.75 12C2.75 18.937 5.063 21.25 12 21.25C18.937 21.25 21.25 18.937 21.25 12C21.25 5.063 18.937 2.75 12 2.75C5.063 2.75 2.75 5.063 2.75 12Z"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						id="Stroke 3"
						d="M15.39 14.018L11.999 11.995V7.63403"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</g>
		</svg>
	)
}
