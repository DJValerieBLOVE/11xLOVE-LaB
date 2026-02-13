import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Home from "./pages/Home";
import BigDreams from "./pages/BigDreams";
import Experiments from "./pages/Experiments";
import Events from "./pages/Events";
import Tribe from "./pages/Tribe";
import Vault from "./pages/Vault";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/big-dreams" element={<BigDreams />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/events" element={<Events />} />
        <Route path="/tribe" element={<Tribe />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
