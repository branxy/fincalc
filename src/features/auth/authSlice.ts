import { supabase } from "@/db/supabaseClient";
import { type User } from "@supabase/supabase-js";

import { createAppSlice } from "@/features/createAppSlice";

export type Auth = {
  status: "idle" | "loading" | "failed" | "succeeded";
  userId: User["id"] | null;
  error: string | null;
};

const initialState: Auth = {
  status: "idle",
  userId: null,
  error: null,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    login: create.asyncThunk(
      async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        return user.id;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          state.error = "Unauthorized activity";
        },
        fulfilled: (state, action) => {
          state.userId = action.payload;
          state.status = "succeeded";
        },
      },
    ),
  }),
});

export const { login } = authSlice.actions;

export default authSlice.reducer;
