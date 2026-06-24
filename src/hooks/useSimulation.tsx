"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { buildTournamentState } from "@/lib/simulation";
import type {
  PickOutcome,
  RawApiGame,
  RawApiGroup,
  RawApiTeam,
  SimulationPick,
  TournamentState,
} from "@/lib/types";

const STORAGE_KEY = "fifa-simulator-picks";

interface RawData {
  games: RawApiGame[];
  groups: RawApiGroup[];
  teams: RawApiTeam[];
}

interface SimState {
  raw: RawData | null;
  picks: Record<string, SimulationPick>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; raw: RawData }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "SET_PICK"; gameId: string; outcome: PickOutcome }
  | { type: "CLEAR_PICK"; gameId: string }
  | { type: "RESET" };

function loadPicks(): Record<string, SimulationPick> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        raw: action.raw,
        lastUpdated: new Date(),
      };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SET_PICK": {
      const picks = {
        ...state.picks,
        [action.gameId]: { gameId: action.gameId, outcome: action.outcome },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
      return { ...state, picks };
    }
    case "CLEAR_PICK": {
      const picks = { ...state.picks };
      delete picks[action.gameId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
      return { ...state, picks };
    }
    case "RESET": {
      localStorage.removeItem(STORAGE_KEY);
      return { ...state, picks: {} };
    }
    default:
      return state;
  }
}

interface SimContextValue {
  state: SimState;
  tournament: TournamentState | null;
  refresh: () => Promise<void>;
  setPick: (gameId: string, outcome: PickOutcome) => void;
  clearPick: (gameId: string) => void;
  reset: () => void;
}

const SimContext = createContext<SimContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    raw: null,
    picks: loadPicks(),
    loading: true,
    error: null,
    lastUpdated: null,
  }));

  useEffect(() => {
    dispatch({ type: "LOAD_START" });
    fetch("/api/worldcup")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        dispatch({ type: "LOAD_SUCCESS", raw: data });
      })
      .catch((e) =>
        dispatch({
          type: "LOAD_ERROR",
          error: e instanceof Error ? e.message : "Failed to load",
        }),
      );
  }, []);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const res = await fetch("/api/worldcup", { cache: "no-store" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      dispatch({ type: "LOAD_SUCCESS", raw: data });
    } catch (e) {
      dispatch({
        type: "LOAD_ERROR",
        error: e instanceof Error ? e.message : "Failed to load",
      });
    }
  }, []);

  const setPick = useCallback((gameId: string, outcome: PickOutcome) => {
    dispatch({ type: "SET_PICK", gameId, outcome });
  }, []);

  const clearPick = useCallback((gameId: string) => {
    dispatch({ type: "CLEAR_PICK", gameId });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const tournament = useMemo(() => {
    if (!state.raw) return null;
    return buildTournamentState(
      state.raw.games,
      state.raw.teams,
      state.raw.groups,
      state.picks,
    );
  }, [state.raw, state.picks]);

  return (
    <SimContext.Provider
      value={{ state, tournament, refresh, setPick, clearPick, reset }}
    >
      {children}
    </SimContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
