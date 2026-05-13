import { useState, useCallback } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const PHANTOM_APP_URL = 'https://phantom.app';

export interface PhantomDeepLinkHook {
  isLoading: boolean;
  deposit: (amount?: number) => Promise<void>;
  withdraw: (amount?: number) => Promise<void>;
}

export function usePhantomDeepLink(): PhantomDeepLinkHook {
  const [isLoading, setIsLoading] = useState(false);

  const openPhantom = useCallback(async (action: 'deposit' | 'withdraw', amount?: number) => {
    setIsLoading(true);
    try {
      const returnUrl = Linking.createURL(`phantom-callback/${action}`);
      const phantomDeepLink = `phantom://v1/connect?redirect_link=${encodeURIComponent(returnUrl)}&app_url=${encodeURIComponent(PHANTOM_APP_URL)}`;

      const canOpen = await Linking.canOpenURL(phantomDeepLink);
      if (canOpen) {
        await Linking.openURL(phantomDeepLink);
      } else {
        await WebBrowser.openBrowserAsync(
          `https://phantom.app/ul/v1/connect?redirect_link=${encodeURIComponent(returnUrl)}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deposit = useCallback(
    (amount?: number) => openPhantom('deposit', amount),
    [openPhantom]
  );

  const withdraw = useCallback(
    (amount?: number) => openPhantom('withdraw', amount),
    [openPhantom]
  );

  return { isLoading, deposit, withdraw };
}
