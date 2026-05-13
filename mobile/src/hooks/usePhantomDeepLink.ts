import { useState, useCallback, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const CALLBACK_SCHEME = 'tradelikeme';
const CALLBACK_PATH = 'phantom-callback';
const PHANTOM_SIGN_URL = 'phantom://ul/v1/signAndSendTransaction';
const PHANTOM_SIGN_HTTPS = 'https://phantom.app/ul/v1/signAndSendTransaction';

function encodeBase58(bytes: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = BigInt('0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''));
  let result = '';
  while (value > 0n) {
    result = ALPHABET[Number(value % 58n)] + result;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte === 0) result = '1' + result;
    else break;
  }
  return result;
}

function serializeToBase58(serializedTx: string | Uint8Array): string {
  if (typeof serializedTx === 'string') {
    try {
      const bytes = Uint8Array.from(atob(serializedTx), (c) => c.charCodeAt(0));
      return encodeBase58(bytes);
    } catch {
      return serializedTx;
    }
  }
  return encodeBase58(serializedTx);
}

function buildPhantomUrl(vaultId: string, serializedTx: string | Uint8Array): string {
  const redirectLink = Linking.createURL(CALLBACK_PATH, {
    queryParams: { vaultId },
    scheme: CALLBACK_SCHEME,
  });
  const txBase58 = serializeToBase58(serializedTx);
  const params = new URLSearchParams({
    transaction: txBase58,
    redirect_link: redirectLink,
  });
  return `${PHANTOM_SIGN_URL}?${params.toString()}`;
}

async function openPhantomUrl(url: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    const httpsUrl = url.replace('phantom://ul/v1/', PHANTOM_SIGN_HTTPS.replace('signAndSendTransaction', '').slice(0, -1) + '/');
    await WebBrowser.openBrowserAsync(
      `${PHANTOM_SIGN_HTTPS}?${url.split('?')[1] ?? ''}`
    );
  }
}

export interface PhantomDeepLinkHook {
  deposit: (vaultId: string, serializedTx: string | Uint8Array) => Promise<void>;
  withdraw: (vaultId: string, serializedTx: string | Uint8Array) => Promise<void>;
  lastSignature: string | null;
  isProcessing: boolean;
}

export function usePhantomDeepLink(): PhantomDeepLinkHook {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!mountedRef.current) return;
      try {
        const parsed = Linking.parse(url);
        if (
          parsed.scheme === CALLBACK_SCHEME &&
          parsed.path === CALLBACK_PATH
        ) {
          const sig =
            (parsed.queryParams?.signature as string | undefined) ?? null;
          setLastSignature(sig);
          setIsProcessing(false);
        }
      } catch {
        // ignore malformed URLs
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
    };
  }, []);

  const deposit = useCallback(
    async (vaultId: string, serializedTx: string | Uint8Array) => {
      setIsProcessing(true);
      try {
        const url = buildPhantomUrl(vaultId, serializedTx);
        await openPhantomUrl(url);
      } catch {
        setIsProcessing(false);
      }
    },
    []
  );

  const withdraw = useCallback(
    async (vaultId: string, serializedTx: string | Uint8Array) => {
      setIsProcessing(true);
      try {
        const url = buildPhantomUrl(vaultId, serializedTx);
        await openPhantomUrl(url);
      } catch {
        setIsProcessing(false);
      }
    },
    []
  );

  return { deposit, withdraw, lastSignature, isProcessing };
}
