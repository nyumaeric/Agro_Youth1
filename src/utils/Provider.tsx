// "use client";
// import { ReactNode } from "react";
// import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { SessionProvider } from "next-auth/react";

// export function Provider({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const queryClient = new QueryClient();
  
//   return (
//     <SessionProvider>
//       <QueryClientProvider client={queryClient}>
//         {children}
//       </QueryClientProvider>
//     </SessionProvider>
//   );
// }

"use client";
import { ReactNode, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export function Provider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            networkMode: "offlineFirst", // This enables offline support
          },
          mutations: {
            retry: 3,
            networkMode: "offlineFirst", // This enables offline support
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}