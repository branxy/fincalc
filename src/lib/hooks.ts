/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/features/store";
import { createSelector } from "@reduxjs/toolkit";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const createAppSelector = createSelector.withTypes<RootState>();
