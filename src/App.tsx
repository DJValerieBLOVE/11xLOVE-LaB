// NOTE: This file should normally not be modified unless you are adding a new provider.
// To add new routes, edit the AppRouter.tsx file.

import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHead, UnheadProvider } from '@unhead/react/client';
import { InferSeoMetaPlugin } from '@unhead/addons';
import { Suspense } from 'react';
import NostrProvider from '@/components/NostrProvider';
import { NostrSync } from '@/components/NostrSync';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NostrLoginProvider } from '@nostrify/react/login';
import { AppProvider } from '@/components/AppProvider';
import { NWCProvider } from '@/contexts/NWCContext';
import { AppConfig } from '@/contexts/AppContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AppRouter from './AppRouter';

// Add environment variables (in production these would be in env files)
const RELAY_URL = 'wss://nostr-rs-relay-production-1569.up.railway.app';
const ADMIN_PUBKEY = '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const head = createHead({
  plugins: [
    InferSeoMetaPlugin(),
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: Infinity,
    },
  },
});

const defaultConfig: AppConfig = {
  theme: "light",
  relayMetadata: {
    relays: [
      { url: 'wss://nostr-rs-relay-production-1569.up.railway.app', read: true, write: true },
    ],
    updatedAt: 0,
  },
};



export function App() {
  return (
    <UnheadProvider head={head}>
      <AppProvider storageKey="nostr:app-config" defaultConfig={defaultConfig}>
        <QueryClientProvider client={queryClient}>
          <NostrLoginProvider storageKey='nostr:login'>
            <NostrProvider>
              <NostrSync />
              <NWCProvider>
                <TooltipProvider>
                  <Toaster />
                  <Suspense>
                    <AppRouter />
                  </Suspense>
                </TooltipProvider>
              </NWCProvider>
            </NostrProvider>
          </NostrLoginProvider>
        </QueryClientProvider>
      </AppProvider>
    </UnheadProvider>
  );
}

export default App;
