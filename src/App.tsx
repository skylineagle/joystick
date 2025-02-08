import { ParamsPage } from "@/pages/params/params-page";
import { StreamView } from "@/pages/stream-view/stream-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { useState } from "react";
import { CommittedRoiProperties, RoiProvider } from "react-roi";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layout";

const queryClient = new QueryClient();

function App() {
  const [roiData, setRoiData] = useState<CommittedRoiProperties<unknown>[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <RoiProvider
          initialConfig={{
            commitRoiBoxStrategy: "exact",
            resizeStrategy: "none",
            rois: roiData,
          }}
          onAfterDraw={(roi) => {
            setRoiData((prev) => [...prev, roi]);
          }}
          onAfterMove={(selectedRoiId, roi) => {
            setRoiData((prev) =>
              prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
            );
          }}
          onAfterResize={(selectedRoiId, roi) => {
            setRoiData((prev) =>
              prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
            );
          }}
          onAfterRotate={(selectedRoiId, roi) => {
            setRoiData((prev) =>
              prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
            );
          }}
        >
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
        </RoiProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
