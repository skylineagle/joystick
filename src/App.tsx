import { ParamsPage } from "@/pages/params/params-page";
import { StreamView } from "@/pages/stream-view/stream-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <StreamView />
                </Layout>
              }
            />
            <Route
              path="/params"
              element={
                <Layout>
                  <ParamsPage />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
