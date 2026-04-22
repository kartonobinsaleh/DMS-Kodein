import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Diaktifkan agar bisa dites di tahap development
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    /* options here */
  },
};

export default withPWA(nextConfig);
