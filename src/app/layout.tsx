import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskVibe — Turn actions into rewards",
  description: "A social-task marketplace connecting advertisers and earners.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
