import { authSlice } from "@/features/auth/authSlice";
import { transactionsSlice } from "@/features/transactions/transactionsSlice";
import { periodsSlice } from "@/features/periods/periodsSlice";
import { transactionTemplateSlice } from "@/features/transaction-templates/transactionTemplateSlice";
import { apiSlice } from "@/features/api/apiSlice";

import {
  combineSlices,
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";

const rootReducer = combineSlices(
  authSlice,
  periodsSlice,
  transactionsSlice,
  transactionTemplateSlice,
  apiSlice,
);

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleWare) =>
    getDefaultMiddleWare().concat(apiSlice.middleware),
});

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
