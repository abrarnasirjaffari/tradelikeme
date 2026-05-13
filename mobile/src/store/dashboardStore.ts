import { create } from 'zustand';
import type { PnlSummary, WsEvent } from '../types/api';

const MAX_EVENTS = 10;

interface DashboardState {
  pnl: PnlSummary | null;
  recentEvents: WsEvent[];
  wsConnected: boolean;
  isLoading: boolean;

  setPnl: (pnl: PnlSummary) => void;
  setWsConnected: (connected: boolean) => void;
  addEvent: (event: WsEvent) => void;
  clearEvents: () => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  pnl: null,
  recentEvents: [],
  wsConnected: false,
  isLoading: false,

  setPnl: (pnl: PnlSummary) => {
    set({ pnl });
  },

  setWsConnected: (connected: boolean) => {
    set({ wsConnected: connected });
  },

  addEvent: (event: WsEvent) => {
    set((state) => ({
      recentEvents: [event, ...state.recentEvents].slice(0, MAX_EVENTS),
    }));
  },

  clearEvents: () => {
    set({ recentEvents: [] });
  },
}));
