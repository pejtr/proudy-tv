import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MessageSquare, TrendingUp, Heart, DollarSign, Clock, ArrowLeft, Activity } from "lucide-react";

// Generate demo analytics data for a stream
function generateDemoData(durationMinutes: number, peakViewers: number) {
  const data = [];
  for (let i = 0; i <= durationMinutes; i += 5) {
    const progress = i / durationMinutes;
    const bell = Math.sin(progress * Math.PI);
    const noise = (Math.random() - 0.5) * 0.15;
    const viewers = Math.max(0, Math.round(peakViewers * (bell + noise) * 0.9 + peakViewers * 0.1));
    const chat = Math.round(viewers * (0.05 + Math.random() * 0.08));
    data.push({
      time: `${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}`,
      viewers,
      chat,
      followers: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
      donations: Math.random() > 0.85 ? Math.floor(Math.random() * 500) : 0,
    });
  }
  return data;
}

// Stat card component
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="bg-zinc-900/80 border-zinc-800">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-zinc-400 text-xs">{label}</p>
          <p className="text-white text-xl font-bold">{value}</p>
          {sub && <p className="text-zinc-500 text-xs">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StreamAnalytics() {
  const { user } = useAuth();
  const [selectedStreamId, setSelectedStreamId] = useState<string>("latest");

  // Fetch user's streams
  const { data: myStreams } = trpc.streams.getMyStreams.useQuery(undefined, {
    enabled: !!user,
  });

  // Get selected stream data
  const selectedStream = useMemo(() => {
    if (!myStreams?.length) return null;
    if (selectedStreamId === "latest") return myStreams[0];
    return myStreams.find(s => String(s.id) === selectedStreamId) || myStreams[0];
  }, [myStreams, selectedStreamId]);

  // Generate demo analytics data based on stream
  const analyticsData = useMemo(() => {
    if (!selectedStream) return generateDemoData(120, 500);
    const peak = selectedStream.peakViewerCount || selectedStream.viewerCount || 100;
    return generateDemoData(selectedStream.isLive ? 60 : 120, Math.max(peak, 50));
  }, [selectedStream]);

  // Compute summary stats
  const stats = useMemo(() => {
    if (!analyticsData.length) return null;
    const peakViewers = Math.max(...analyticsData.map(d => d.viewers));
    const avgViewers = Math.round(analyticsData.reduce((s, d) => s + d.viewers, 0) / analyticsData.length);
    const totalChat = analyticsData.reduce((s, d) => s + d.chat, 0);
    const totalFollowers = analyticsData.reduce((s, d) => s + d.followers, 0);
    const totalDonations = analyticsData.reduce((s, d) => s + d.donations, 0);
    const peakMinute = analyticsData.reduce((best, d) => d.viewers > best.viewers ? d : best, analyticsData[0]);
    return { peakViewers, avgViewers, totalChat, totalFollowers, totalDonations, peakMinute };
  }, [analyticsData]);

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Pro zobrazení analytiky se přihlaste.</p>
          <Link href="/"><Button>Zpět na hlavní stránku</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Stream Analytika
              </h1>
              <p className="text-zinc-400 text-sm">Real-time statistiky a přehledy streamů</p>
            </div>
          </div>

          {/* Stream selector */}
          <div className="flex items-center gap-3">
            {selectedStream?.isLive && (
              <Badge className="bg-red-600 text-white animate-pulse">● LIVE</Badge>
            )}
            <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
              <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Vyberte stream" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="latest" className="text-white">Poslední stream</SelectItem>
                {myStreams?.map(s => (
                  <SelectItem key={s.id} value={String(s.id)} className="text-white">
                    {s.title.slice(0, 30)}{s.title.length > 30 ? "…" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stream title */}
        {selectedStream && (
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{selectedStream.title}</h2>
            {selectedStream.category && (
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                {selectedStream.category}
              </Badge>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Users}
              label="Peak diváků"
              value={stats.peakViewers.toLocaleString()}
              sub={`v čase ${stats.peakMinute.time}`}
              color="bg-blue-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Průměr diváků"
              value={stats.avgViewers.toLocaleString()}
              color="bg-purple-600"
            />
            <StatCard
              icon={MessageSquare}
              label="Zprávy v chatu"
              value={stats.totalChat.toLocaleString()}
              color="bg-green-600"
            />
            <StatCard
              icon={Heart}
              label="Noví sledující"
              value={`+${stats.totalFollowers}`}
              color="bg-pink-600"
            />
            <StatCard
              icon={DollarSign}
              label="Donace"
              value={`${stats.totalDonations} Kč`}
              color="bg-yellow-600"
            />
          </div>
        )}

        {/* Viewer Count Chart */}
        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Počet diváků v čase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="viewersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                  labelStyle={{ color: "#e4e4e7" }}
                  itemStyle={{ color: "#a78bfa" }}
                />
                <Area type="monotone" dataKey="viewers" stroke="#6366f1" fill="url(#viewersGrad)" strokeWidth={2} name="Diváci" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chat Activity + Followers side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Aktivita chatu (zprávy/min)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                    labelStyle={{ color: "#e4e4e7" }}
                    itemStyle={{ color: "#4ade80" }}
                  />
                  <Bar dataKey="chat" fill="#22c55e" radius={[3, 3, 0, 0]} name="Zprávy/min" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Noví sledující &amp; Donace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                    labelStyle={{ color: "#e4e4e7" }}
                  />
                  <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
                  <Line type="monotone" dataKey="followers" stroke="#ec4899" strokeWidth={2} dot={false} name="Sledující" />
                  <Line type="monotone" dataKey="donations" stroke="#f59e0b" strokeWidth={2} dot={false} name="Donace (Kč)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Peak Moments Table */}
        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Top 5 momentů streamu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium">#</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium">Čas</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium">Diváci</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium">Chat/min</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium">Donace</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analyticsData]
                    .sort((a, b) => b.viewers - a.viewers)
                    .slice(0, 5)
                    .map((row, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-2 px-3 text-zinc-500">{i + 1}</td>
                        <td className="py-2 px-3 text-white font-mono">{row.time}</td>
                        <td className="py-2 px-3">
                          <span className="text-blue-400 font-semibold">{row.viewers.toLocaleString()}</span>
                        </td>
                        <td className="py-2 px-3 text-green-400">{row.chat}</td>
                        <td className="py-2 px-3 text-yellow-400">
                          {row.donations > 0 ? `${row.donations} Kč` : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
