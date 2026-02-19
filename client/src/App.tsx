import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/browse"} component={Browse} />
      <Route path={"/stream/:id"} component={StreamPage} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile/:id"} component={Profile} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/feed"} component={ForYouFeed} />
      <Route path={"/community"} component={Community} />
      <Route path={"/coins"} component={CoinsPage} />
      <Route path={"/admin/virtual-streamers"} component={VirtualStreamers} />
      <Route path={"/dashboard/emotes"} component={EmoteManagement} />
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
