import { transactionsSlice } from "@/features/transactions/transactionsSlice";
import { periodsSlice } from "@/features/periods/periodsSlice";
import {
  Action,
  combineSlices,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import { transactionTemplateSlice } from "./transaction-templates/transactionTemplateSlice";

const rootReducer = combineSlices(
  periodsSlice,
  transactionsSlice,
  transactionTemplateSlice,
);

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
});

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
