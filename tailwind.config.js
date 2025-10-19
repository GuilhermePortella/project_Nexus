/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
- "./src/app/**/*.{ts,tsx,js,jsx,md,mdx}",
- "./src/components/**/*.{ts,tsx,js,jsx,md,mdx}",
- "./src/content/articles/**/*.{md,mdx}"
+ "./src/app/**/*.{ts,tsx,js,jsx}",
+ "./src/components/**/*.{ts,tsx,js,jsx}",
+ "./src/content/articles/**/*.{md}",
+ "./src/**/*.{ts,tsx,js,jsx,md}",
+ "./src/styles/**/*.css"
],
  darkMode: "class",
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: {
          lg: "860px",
          xl: "960px",
          "2xl": "1120px"
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
