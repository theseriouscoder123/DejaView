"use client";
import { createContext, useContext } from "react";

export const DashboardContext = createContext<any>(null);
export const useDashboard = () => useContext(DashboardContext);
