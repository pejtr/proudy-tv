import { Card } from './ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, MessageSquare, Users, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface StreamAnalyticsProps {
  streamId: number;
}

// Mock data - replace with real tRPC queries
const generateMockViewerData = () => {
  const now = Date.now();
  const data = [];
  for (let i = 60; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 60 * 1000).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      viewers: Math.floor(Math.random() * 50) + 20,
      chatMessages: Math.floor(Math.random() * 30) + 5,
    });
  }
  return data;
};

const generateMockChatActivity = () => {
  return [
    { hour: '00:00', messages: 12 },
    { hour: '01:00', messages: 8 },
    { hour: '02:00', messages: 5 },
    { hour: '03:00', messages: 3 },
    { hour: '04:00', messages: 15 },
    { hour: '05:00', messages: 25 },
    { hour: '06:00', messages: 45 },
    { hour: '07:00', messages: 67 },
    { hour: '08:00', messages: 89 },
    { hour: '09:00', messages: 102 },
    { hour: '10:00', messages: 95 },
    { hour: '11:00', messages: 78 },
  ];
};

export function StreamAnalytics({ streamId }: StreamAnalyticsProps) {
  const viewerData = useMemo(() => generateMockViewerData(), []);
  const chatActivityData = useMemo(() => generateMockChatActivity(), []);

  const stats = useMemo(() => {
    const currentViewers = viewerData[viewerData.length - 1]?.viewers || 0;
    const peakViewers = Math.max(...viewerData.map(d => d.viewers));
    const avgViewers = Math.floor(viewerData.reduce((sum, d) => sum + d.viewers, 0) / viewerData.length);
    const totalChatMessages = chatActivityData.reduce((sum, d) => sum + d.messages, 0);

    return {
      currentViewers,
      peakViewers,
      avgViewers,
      totalChatMessages,
    };
  }, [viewerData, chatActivityData]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Viewers</p>
              <p className="text-2xl font-bold">{stats.currentViewers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Viewers</p>
              <p className="text-2xl font-bold">{stats.peakViewers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Viewers</p>
              <p className="text-2xl font-bold">{stats.avgViewers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chat Messages</p>
              <p className="text-2xl font-bold">{stats.totalChatMessages}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Viewer Count Over Time */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Viewer Count (Last Hour)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={viewerData}>
            <defs>
              <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="viewers" 
              stroke="hsl(var(--primary))" 
              fill="url(#viewerGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Chat Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Chat Activity (Today)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chatActivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="hour" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="messages" 
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Combined View */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Viewers vs Chat Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="viewers" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Viewers"
            />
            <Line 
              type="monotone" 
              dataKey="chatMessages" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Chat Messages"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
