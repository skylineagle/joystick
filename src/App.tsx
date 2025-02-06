import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { StreamView } from "./pages/stream-view";
import { Layout } from "./layout";
// import { ParamsView } from "./pages/params-view";

import "./App.css";

function App() {
  return (
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
            {/* <Route path="/params" element={<ParamsView />} /> */}
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
