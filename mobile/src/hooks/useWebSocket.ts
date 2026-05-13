import { useEffect, useRef, useCallback, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useTradesStore } from '@/store/tradesStore';
import { apiClient } from '@/api/client';

const WS_URL = 'wss://api.tradelikeme.xyz/ws/live';
const POLL_INTERVAL_MS = 30_000;
const DISCONNECTED_POLL_THRESHOLD_MS = 30_000;
const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;

type PriceUpdatePayload = {
  positionId: string;
  currentPrice: number;
  unrealisedPnl: number;
};

export function useWebSocket(userId: string): {
  connected: boolean;
  reconnecting: boolean;
} {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const disconnectedAtRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const addEvent = useDashboardStore((s) => s.addEvent);
  const setPnl = useDashboardStore((s) => s.setPnl);
  const setWsConnected = useDashboardStore((s) => s.setWsConnected);
  const updatePositionPrice = useTradesStore((s) => s.updatePositionPrice);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current !== null) return;
    pollTimerRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const { data } = await apiClient.get(`/users/${userId}/pnl`);
        if (mountedRef.current) setPnl(data);
      } catch {
        // silently ignore poll failures
      }
    }, POLL_INTERVAL_MS);
  }, [userId, setPnl]);

  const handleMessage = useCallback(
    (raw: string) => {
      let msg: { type: string; payload: unknown; timestamp?: string };
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      const event = {
        type: msg.type,
        payload: msg.payload,
        timestamp: msg.timestamp ?? new Date().toISOString(),
      };

      addEvent(event);

      if (msg.type === 'PRICE_UPDATE') {
        const p = msg.payload as PriceUpdatePayload;
        if (
          p?.positionId &&
          p?.currentPrice !== undefined &&
          p?.unrealisedPnl !== undefined
        ) {
          updatePositionPrice(p.positionId, p.currentPrice, p.unrealisedPnl);
        }
      }

      if (msg.type === 'PNL_UPDATE') {
        setPnl(msg.payload as Parameters<typeof setPnl>[0]);
      }
    },
    [addEvent, updatePositionPrice, setPnl]
  );

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const url = `${WS_URL}?userId=${encodeURIComponent(userId)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      reconnectAttemptRef.current = 0;
      disconnectedAtRef.current = null;
      setConnected(true);
      setReconnecting(false);
      setWsConnected(true);
      stopPolling();
    };

    ws.onmessage = (e) => {
      handleMessage(typeof e.data === 'string' ? e.data : String(e.data));
    };

    ws.onerror = () => {
      // onclose always fires after onerror; handle reconnect there
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;

      setConnected(false);
      setWsConnected(false);

      if (disconnectedAtRef.current === null) {
        disconnectedAtRef.current = Date.now();
      }

      const elapsed = Date.now() - disconnectedAtRef.current;
      if (elapsed >= DISCONNECTED_POLL_THRESHOLD_MS) {
        startPolling();
      }

      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(
        BASE_BACKOFF_MS * Math.pow(2, attempt),
        MAX_BACKOFF_MS
      );
      reconnectAttemptRef.current += 1;
      setReconnecting(true);

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [userId, handleMessage, setWsConnected, stopPolling, startPolling]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      stopPolling();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { connected, reconnecting };
}
