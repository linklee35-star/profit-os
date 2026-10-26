/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静态导出（GitHub Pages 托管）：整站纯静态，无服务端依赖
  output: "export",
  // GitHub Pages 项目页路径：https://<user>.github.io/profit-os/
  basePath: "/profit-os",
};

export default nextConfig;
