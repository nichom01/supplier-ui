type AppConfigType = {
    name: string,
    github: {
        title: string,
        url: string
    },
    author: {
        name: string,
        url: string
    },
    currency: {
        code: string,
        symbol: string,
        locale: string
    }
}

export const appConfig: AppConfigType = {
    name: import.meta.env.VITE_APP_NAME ?? "UI Builder",
    github: {
        title: "React Shadcn Starter",
        url: "https://github.com/nichom01/base-ui",
    },
    author: {
        name: "nichom01",
        url: "https://github.com/nichom01",
    },
    currency: {
        code: "GBP",
        symbol: "£",
        locale: "en-GB"
    }
}

export const baseUrl = import.meta.env.VITE_BASE_URL ?? ""
