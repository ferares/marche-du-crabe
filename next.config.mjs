import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Localized route mapping
      // {
      //   source: "/es/:code*",
      //   destination: "/es/:code*",
      // },
    ]
  },
}

export default withNextIntl(nextConfig)
