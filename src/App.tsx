import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layout";
import { StreamView } from "@/pages/stream-view/stream-view";
import { ParamsPage } from "@/pages/params/params-page";

function App() {
  return (
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
  );
}

export default App;
