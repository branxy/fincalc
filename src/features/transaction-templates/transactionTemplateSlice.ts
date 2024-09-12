import { toast } from "sonner";

import { createAppSlice } from "@/features/createAppSlice";
import { createEntityAdapter, EntityState, Update } from "@reduxjs/toolkit";

import {
  deleteTransactionTemplate,
  fetchTransactionTemplatesFromDB,
  insertTransactionTemplate,
  updateTransactionTemplate,
} from "@/features/transaction-templates/transactionTemplateApi";
import { performAuthCheck } from "@/lib/utils";
import { getTodayDate } from "@/lib/date-utils";

import { TTransactionTemplate, zTTransactionTemplate } from "@/features/types";
import { RootState } from "@/features/store";

const transactionTemplateAdapter = createEntityAdapter<TTransactionTemplate>({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

type InitialState = EntityState<TTransactionTemplate, string> & {
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
      async (template: zTTransactionTemplate) => {
        const userId = await performAuthCheck();

        const newTemplate: Omit<TTransactionTemplate, "id"> = {
          ...template,
          user_id: userId,
          date: getTodayDate(),
        };

        const receivedTemplate: TTransactionTemplate =
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
          Pick<TTransactionTemplate, "title" | "amount" | "type">,
          TTransactionTemplate["id"]
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
          toast.error("Failed to update a template");
        },
        fulfilled: (state, action) => {
          state.status === "succeeded";
          transactionTemplateAdapter.updateOne(state, action.payload);
        },
      },
    ),
    transactionTemplateDeleted: create.asyncThunk(
      async (transactionId: TTransactionTemplate["id"]) => {
        await deleteTransactionTemplate(transactionId);

        return transactionId;
      },
      {
        pending: (state) => {
          state.status === "loading";
        },
        rejected: (state) => {
          state.status === "failed";
          toast.error("Failed to delete a template");
        },
        fulfilled: (state, action) => {
          state.status === "succeeded";
          transactionTemplateAdapter.removeOne(state, action.payload);
        },
      },
    ),
  }),
  selectors: {
    selectTransactionTemplatesStatus: (state) => state.status,
  },
});

export const {
  fetchTransactionTemplates,
  transactionTemplateAdded,
  transactionTemplateUpdated,
  transactionTemplateDeleted,
} = transactionTemplateSlice.actions;

export const {
  selectAll: selectAllTransactionTemplates,
  selectById: selectTransactionTemplateById,
} = transactionTemplateAdapter.getSelectors(
  (state: RootState) => state.transactionTemplates,
);

export const { selectTransactionTemplatesStatus } =
  transactionTemplateSlice.selectors;

export type UpdateTransactionTemplate = {
  id: TTransactionTemplate["id"];
  changes: zTTransactionTemplate;
};
