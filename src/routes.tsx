import { MemoryRouter, Route, Routes } from "react-router";
import App from "./App";
import InfoPage from "./components/Info_Page";

export default function PopupRoutes() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/">
          <Route index element={<App />} />
        </Route>
        <Route path="/Info">
          <Route index element={<InfoPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
