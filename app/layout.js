import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Lifebase — Personal Life Manager",
  description: "Trips, todos, events, passwords, documents and expenses in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
