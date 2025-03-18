import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeType = 'light' | 'dark' | 'system'

interface ThemeState {
	theme: ThemeType
	setTheme: (theme: ThemeType) => void
	toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: 'system', // Default theme
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set((state) => ({
					theme: state.theme === 'dark' ? 'light' : 'dark',
				})),
		}),
		{
			name: 'theme-storage', // Name for localStorage
		},
	),
)
