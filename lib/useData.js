"use client";

import useSWR from "swr";
import { fetcher } from "./fetcher";

export const useTrips = () => useSWR("/api/trips", fetcher);
export const useTodos = () => useSWR("/api/todos", fetcher);
export const useEvents = () => useSWR("/api/events", fetcher);
export const useTransactions = () => useSWR("/api/transactions", fetcher);
export const useDocuments = () => useSWR("/api/documents", fetcher);
export const usePasswords = (unlocked) => useSWR(unlocked ? "/api/passwords" : null, fetcher);
export const useDashboard = () => useSWR("/api/dashboard", fetcher);
