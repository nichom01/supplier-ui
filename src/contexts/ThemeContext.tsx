import { createContext, ReactNode, use, useEffect, useState } from "react"

type ThemeType = {
    theme: string
    setTheme: (theme: string) => void
    primaryColor: string
    setPrimaryColor: (color: string) => void
}

export const ThemeContext = createContext<ThemeType | null>(null)

const colorPresets = {
    red: {
        light: "oklch(0.637 0.237 25.331)",
        lightForeground: "oklch(0.971 0.013 17.38)",
        dark: "oklch(0.637 0.237 25.331)",
        darkForeground: "oklch(0.971 0.013 17.38)",
    },
    blue: {
        light: "oklch(0.552 0.196 254.604)",
        lightForeground: "oklch(0.985 0 0)",
        dark: "oklch(0.648 0.185 254.604)",
        darkForeground: "oklch(0.985 0 0)",
    },
    green: {
        light: "oklch(0.548 0.166 158.828)",
        lightForeground: "oklch(0.985 0 0)",
        dark: "oklch(0.648 0.166 158.828)",
        darkForeground: "oklch(0.985 0 0)",
    },
    purple: {
        light: "oklch(0.583 0.197 293.756)",
        lightForeground: "oklch(0.985 0 0)",
        dark: "oklch(0.683 0.197 293.756)",
        darkForeground: "oklch(0.985 0 0)",
    },
    orange: {
        light: "oklch(0.656 0.197 50.598)",
        lightForeground: "oklch(0.985 0 0)",
        dark: "oklch(0.756 0.197 50.598)",
        darkForeground: "oklch(0.141 0.005 285.823)",
    },
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "shadcn-ui-theme",
}: {
    children: ReactNode
    defaultTheme?: string
    storageKey?: string
}) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem(storageKey) ?? defaultTheme
    )

    const [primaryColor, setPrimaryColor] = useState(
        () => localStorage.getItem("shadcn-ui-primary-color") ?? "red"
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }, [theme])

    useEffect(() => {
        const root = window.document.documentElement
        const colors = colorPresets[primaryColor as keyof typeof colorPresets]

        if (colors) {
            root.style.setProperty("--primary", colors.light)
            root.style.setProperty("--primary-foreground", colors.lightForeground)
            root.style.setProperty("--sidebar-primary", colors.light)
            root.style.setProperty("--sidebar-primary-foreground", colors.lightForeground)
            root.style.setProperty("--sidebar-ring", colors.light)
            root.style.setProperty("--ring", colors.light)
        }
    }, [primaryColor])

    return (
        <ThemeContext
            value={{
                theme,
                setTheme: (theme: string) => {
                    localStorage.setItem(storageKey, theme)
                    setTheme(theme)
                },
                primaryColor,
                setPrimaryColor: (color: string) => {
                    localStorage.setItem("shadcn-ui-primary-color", color)
                    setPrimaryColor(color)
                },
            }}>
            {children}
        </ThemeContext>
    )
}

export function useTheme(): ThemeType {
    const context = use(ThemeContext)

    if (context === null) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}
