import App from "@/components/app";

import { createRootRoute } from "@tanstack/react-router";

import useSupabaseSession from "@/db/useSupabaseSession";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/db/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";



export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const [session, isLoading] = useSupabaseSession();

  if (isLoading) return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="w-full min-w-80 px-3 sm:mx-auto sm:w-96">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  inputText: "bg-foreground",
                },
              },
            },
          }}
          providers={["google"]}
        />
      </div>
    );
  } else {
    return <App />;
  }
}
