import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import BigDreams from "./pages/BigDreams";
import Experiments from "./pages/Experiments";
import ExperimentView from "./pages/ExperimentView";
import JournalView from "./pages/JournalView";
import Events from "./pages/Events";
import Tribe from "./pages/Tribe";
import LoveBoard from "./pages/LoveBoard";
import Vault from "./pages/Vault";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Redirect / to Big Dreams (default home) */}
        <Route path="/" element={<BigDreams />} />
        <Route path="/big-dreams" element={<BigDreams />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiment/:experimentId" element={<ExperimentView />} />
        <Route path="/experiment/:experimentId/:lessonId" element={<ExperimentView />} />
        <Route path="/experiment/:experimentId/journal" element={<JournalView />} />
        <Route path="/events" element={<Events />} />
        <Route path="/tribe" element={<Tribe />} />
        <Route path="/love-board" element={<LoveBoard />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
