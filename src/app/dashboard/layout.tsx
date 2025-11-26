'use client'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./globals.css";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/App-sidebar";
import { TopSide } from "../components/dashboard/TopSide";
import { Provider } from "@/utils/Provider";
import { Toaster } from "react-hot-toast";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { useSessionSync } from "@/hooks/useSessionSync";

const queryClient = new QueryClient();

// Separate component that uses the session hook
const SessionSyncWrapper = ({ children }: { children: React.ReactNode }) => {
  useSessionSync(10000); // Check every 10 seconds
  return <>{children}</>;
};

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <div className="transition-all duration-500 filter select-none">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <TopSide />
            <div className="flex flex-1 flex-col gap-4 px-4 pt-0 bg-gray-50">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Provider>
            {/* SessionSyncWrapper must be inside Provider (which has SessionProvider) */}
            <SessionSyncWrapper>
              <DashboardContent>
                <OfflineIndicator/>
                {children}
              </DashboardContent>
            </SessionSyncWrapper>
          </Provider>
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}