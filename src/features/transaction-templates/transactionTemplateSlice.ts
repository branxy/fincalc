import { createEntityAdapter, EntityState, Update } from "@reduxjs/toolkit";
import { createAppSlice } from "@/features/createAppSlice";
import { RootState } from "@/features/store";

import {
  fetchTransactionTemplatesFromDB,
  insertTransactionTemplate,
  updateTransactionTemplate,
} from "./transactionTemplateApi";

import { performAuthCheck } from "@/lib/utils";
import { TransactionTemplate } from "@/features/types";
import { toast } from "sonner";

const transactionTemplateAdapter = createEntityAdapter<TransactionTemplate>({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

type InitialState = EntityState<TransactionTemplate, string> & {
  status: "idle" | "loading" | "failed" | "succeeded";
  error: string | null;
};

const initialState: InitialState = transactionTemplateAdapter.getInitialState({
  status: "idle",
  error: null,
});

export const transactionTemplateSlice = createAppSlice({
  name: "transactionTemplates",
  initialState,
  reducers: (create) => ({
    fetchTransactionTemplates: create.asyncThunk(
      async () => {
        const templates = await fetchTransactionTemplatesFromDB();

        return templates;
      },
      {
        pending: (state) => {
          state.status === "loading";
        },
        rejected: (state) => {
          state.status === "failed";
          toast.error("Failed to add a template");
        },
        fulfilled: (state, action) => {
          state.status === "succeeded";
          transactionTemplateAdapter.setAll(state, action.payload);
        },
      },
    ),
    transactionTemplateAdded: create.asyncThunk(
      async (template: Omit<TransactionTemplate, "id" | "user_id">) => {
        const userId = await performAuthCheck();

        const newTemplate: Omit<TransactionTemplate, "id"> = {
          ...template,
          user_id: userId,
        };

        const receivedTemplate: TransactionTemplate =
          await insertTransactionTemplate(newTemplate);

        return receivedTemplate;
      },
      {
        pending: (state) => {
          state.status === "loading";
        },
        rejected: (state) => {
          state.status === "failed";
          toast.error("Failed to add a template");
        },
        fulfilled: (state, action) => {
          state.status === "succeeded";
          transactionTemplateAdapter.addOne(state, action.payload);
        },
      },
    ),
    transactionTemplateUpdated: create.asyncThunk(
      async ({ id, changes }: UpdateTransactionTemplate) => {
        const received = await updateTransactionTemplate(id, changes);

        const toRedux: Update<
          Pick<TransactionTemplate, "title" | "amount" | "type">,
          TransactionTemplate["id"]
        > = {
          id: received.id,
          changes: {
            title: received.title,
            amount: received.amount,
            type: received.type,
          },
        };

        return toRedux;
      },
      {
        pending: (state) => {
          state.status === "loading";
        },
        rejected: (state) => {
          state.status === "failed";
          toast.error("Failed to add a template");
        },
        fulfilled: (state, action) => {
          state.status === "succeeded";
          transactionTemplateAdapter.updateOne(state, action.payload);
        },
      },
    ),
  }),
});

export const {
  fetchTransactionTemplates,
  transactionTemplateAdded,
  transactionTemplateUpdated,
} = transactionTemplateSlice.actions;

export const {
  selectAll: selectAllTransactionTemplates,
  selectById: selectTransactionTemplateById,
} = transactionTemplateAdapter.getSelectors(
  (state: RootState) => state.transactionTemplates,
);

export type UpdateTransactionTemplate = {
  id: TransactionTemplate["id"];
  changes: {
    title: TransactionTemplate["title"];
    amount: TransactionTemplate["amount"];
    type: TransactionTemplate["type"];
  };
};
