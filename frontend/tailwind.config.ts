import type { Config } from 'tailwindcss';
export default {
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
    theme: {
        extend: {
        colors: {
            bg: "#0E141B",
            card: "#121C24",
            text: "#D8E1E8",
            mute: "#7A8A99",
            accent: "#7c3aed"
        },
        borderRadius: { lg: "14px" }
        },
    },
    plugins: [],
} satisfies Config;
