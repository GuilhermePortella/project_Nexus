import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata = {
  title: "Guilherme Portella",
  description: "Engenheiro de Software | Java | Spring Boot | Cloud | DDD | Arquitetura",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
