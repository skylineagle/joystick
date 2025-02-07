import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { StreamView } from "./pages/stream-view/stream-view";
import { Layout } from "./layout";
// import { ParamsView } from "./pages/params-view";

import "./App.css";
import { ParamsPage } from "./pages/params/params-page";

function App() {
  return (
    <NuqsAdapter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <div className="min-h-screen bg-background">
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
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </NuqsAdapter>
  );
}

export default App;
