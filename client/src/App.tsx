import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initGA, trackPageView } from "./lib/analytics";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import StreamPage from "./pages/StreamPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ForYouFeed from "./pages/ForYouFeed";
import Community from "./pages/Community";
import CoinsPage from "./pages/CoinsPage";
import VirtualStreamers from "./pages/VirtualStreamers";
import EmoteManagement from "./pages/EmoteManagement";
import VerifyEmail from "./pages/VerifyEmail";
import TopStreamers from "./pages/TopStreamers";
import CategoryPage from "./pages/CategoryPage";
import { AlertCustomization } from "./pages/AlertCustomization";
import StreamDashboard from "./pages/StreamDashboard";
import MultistreamingDashboard from "./pages/MultistreamingDashboard";
import StreamAnalytics from "./pages/StreamAnalytics";
import ClipGallery from "./pages/ClipGallery";
import OnboardingWizard from "./pages/OnboardingWizard";
import SubscriptionTiers from "./pages/SubscriptionTiers";
import StreamerProfile from "./pages/StreamerProfile";
import MultiStreamControlCenter from "./pages/MultiStreamControlCenter";
import EmoteStore from "./pages/EmoteStore";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Initialize GA4 on first load
    initGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location);
  }, [location]);

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/browse"} component={Browse} />
      <Route path={"/stream/:id"} component={StreamPage} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/stream"} component={StreamDashboard} />
      <Route path={"/dashboard/multistreaming"} component={MultistreamingDashboard} />
      <Route path={"/profile/:id"} component={Profile} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/feed"} component={ForYouFeed} />
      <Route path={"/community"} component={Community} />
      <Route path={"/coins"} component={CoinsPage} />
      <Route path={"/admin/virtual-streamers"} component={VirtualStreamers} />
      <Route path={"/dashboard/emotes"} component={EmoteManagement} />
      <Route path={"/dashboard/alerts"} component={AlertCustomization} />
      <Route path={"/verify-email"} component={VerifyEmail} />
      <Route path={"/top-streamers"} component={TopStreamers} />
      <Route path={"/category/:category"} component={CategoryPage} />
      <Route path={"/dashboard/analytics"} component={StreamAnalytics} />
      <Route path={"/clips"} component={ClipGallery} />
      <Route path={"/onboarding"} component={OnboardingWizard} />
      <Route path={"/subscriptions"} component={() => <SubscriptionTiers />} />
      <Route path={"/streamer/:username"} component={StreamerProfile} />
      <Route path={"/dashboard/multistream-center"} component={MultiStreamControlCenter} />
      <Route path={"/emote-store"} component={EmoteStore} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
