import { create } from 'zustand';
import type { Position, Trade } from '../types/api';

type TradeFilter = 'all' | 'wins' | 'losses';

interface TradesState {
  positions: Position[];
  trades: Trade[];
  isLoadingPositions: boolean;
  isLoadingTrades: boolean;
  filter: TradeFilter;

  setPositions: (positions: Position[]) => void;
  setTrades: (trades: Trade[]) => void;
  updatePositionPrice: (
    positionId: string,
    currentPrice: number,
    unrealisedPnl: number
  ) => void;
  removePosition: (positionId: string) => void;
  setFilter: (filter: TradeFilter) => void;
  filteredTrades: () => Trade[];
}

export const useTradesStore = create<TradesState>()((set, get) => ({
  positions: [],
  trades: [],
  isLoadingPositions: false,
  isLoadingTrades: false,
  filter: 'all',

  setPositions: (positions: Position[]) => {
    set({ positions });
  },

  setTrades: (trades: Trade[]) => {
    set({ trades });
  },

  updatePositionPrice: (
    positionId: string,
    currentPrice: number,
    unrealisedPnl: number
  ) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === positionId ? { ...p, currentPrice, unrealisedPnl } : p
      ),
    }));
  },

  removePosition: (positionId: string) => {
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== positionId),
    }));
  },

  setFilter: (filter: TradeFilter) => {
    set({ filter });
  },

  filteredTrades: () => {
    const { trades, filter } = get();
    if (filter === 'wins') return trades.filter((t) => t.pnl > 0);
    if (filter === 'losses') return trades.filter((t) => t.pnl < 0);
    return trades;
  },
}));
