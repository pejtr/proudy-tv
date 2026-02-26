import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Bell, Heart, DollarSign, Users, Sparkles, Volume2 } from 'lucide-react';

const animations = [
  { value: 'bounce', label: 'Bounce' },
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'fireworks', label: 'Fireworks' },
] as const;

const defaultTexts = {
  follow: '{username} právě začal sledovat!',
  sub: '{username} se právě přihlásil k odběru! (Tier {tier})',
  donation: '{username} daroval {amount} coinů!',
  raid: '{username} právě raiduje s {viewerCount} diváky!',
};

export function AlertCustomization() {
  const { data: settings, isLoading } = trpc.alerts.getMySettings.useQuery();
  const updateSettings = trpc.alerts.updateSettings.useMutation({
    onSuccess: () => {
      toast.success('Nastavení alertů uloženo!');
    },
    onError: (error) => {
      toast.error('Chyba při ukládání', {
        description: error.message,
      });
    },
  });

  // Follow alert state
  const [followEnabled, setFollowEnabled] = useState(true);
  const [followAnimation, setFollowAnimation] = useState<'bounce' | 'slide' | 'fade' | 'confetti' | 'fireworks'>('bounce');
  const [followText, setFollowText] = useState(defaultTexts.follow);
  const [followDuration, setFollowDuration] = useState(5);

  // Sub alert state
  const [subEnabled, setSubEnabled] = useState(true);
  const [subAnimation, setSubAnimation] = useState<'bounce' | 'slide' | 'fade' | 'confetti' | 'fireworks'>('confetti');
  const [subText, setSubText] = useState(defaultTexts.sub);
  const [subDuration, setSubDuration] = useState(7);

  // Donation alert state
  const [donationEnabled, setDonationEnabled] = useState(true);
  const [donationAnimation, setDonationAnimation] = useState<'bounce' | 'slide' | 'fade' | 'confetti' | 'fireworks'>('fireworks');
  const [donationText, setDonationText] = useState(defaultTexts.donation);
  const [donationDuration, setDonationDuration] = useState(10);

  // Raid alert state
  const [raidEnabled, setRaidEnabled] = useState(true);
  const [raidAnimation, setRaidAnimation] = useState<'bounce' | 'slide' | 'fade' | 'confetti' | 'fireworks'>('slide');
  const [raidText, setRaidText] = useState(defaultTexts.raid);
  const [raidDuration, setRaidDuration] = useState(10);

  // Load settings from server
  useEffect(() => {
    if (settings) {
      setFollowEnabled(settings.followEnabled);
      setFollowAnimation(settings.followAnimation || 'bounce');
      setFollowText(settings.followTextTemplate || defaultTexts.follow);
      setFollowDuration(settings.followDuration || 5);

      setSubEnabled(settings.subEnabled);
      setSubAnimation(settings.subAnimation || 'confetti');
      setSubText(settings.subTextTemplate || defaultTexts.sub);
      setSubDuration(settings.subDuration || 7);

      setDonationEnabled(settings.donationEnabled);
      setDonationAnimation(settings.donationAnimation || 'fireworks');
      setDonationText(settings.donationTextTemplate || defaultTexts.donation);
      setDonationDuration(settings.donationDuration || 10);

      setRaidEnabled(settings.raidEnabled);
      setRaidAnimation(settings.raidAnimation || 'slide');
      setRaidText(settings.raidTextTemplate || defaultTexts.raid);
      setRaidDuration(settings.raidDuration || 10);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      followEnabled,
      followAnimation,
      followTextTemplate: followText,
      followDuration,
      subEnabled,
      subAnimation,
      subTextTemplate: subText,
      subDuration,
      donationEnabled,
      donationAnimation,
      donationTextTemplate: donationText,
      donationDuration,
      raidEnabled,
      raidAnimation,
      raidTextTemplate: raidText,
      raidDuration,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ProudyAlerts Customization</h1>
        <p className="text-muted-foreground mt-2">
          Přizpůsobte si zvuky, animace a texty pro follow, sub, donation a raid alerty
        </p>
      </div>

      <div className="space-y-6">
        {/* Follow Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Follow Alert
            </CardTitle>
            <CardDescription>Nastavení alertu pro nové followery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="follow-enabled">Povolit alert</Label>
              <Switch
                id="follow-enabled"
                checked={followEnabled}
                onCheckedChange={setFollowEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Animace</Label>
              <Select value={followAnimation} onValueChange={(v: any) => setFollowAnimation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animations.map((anim) => (
                    <SelectItem key={anim.value} value={anim.value}>
                      {anim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text šablona</Label>
              <Input
                value={followText}
                onChange={(e) => setFollowText(e.target.value)}
                placeholder="{username} právě začal sledovat!"
              />
              <p className="text-xs text-muted-foreground">
                Použijte {'{username}'} pro jméno uživatele
              </p>
            </div>

            <div className="space-y-2">
              <Label>Délka zobrazení: {followDuration}s</Label>
              <Slider
                value={[followDuration]}
                onValueChange={([v]) => setFollowDuration(v)}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Subscription Alert
            </CardTitle>
            <CardDescription>Nastavení alertu pro nové předplatitele</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sub-enabled">Povolit alert</Label>
              <Switch
                id="sub-enabled"
                checked={subEnabled}
                onCheckedChange={setSubEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Animace</Label>
              <Select value={subAnimation} onValueChange={(v: any) => setSubAnimation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animations.map((anim) => (
                    <SelectItem key={anim.value} value={anim.value}>
                      {anim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text šablona</Label>
              <Input
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="{username} se právě přihlásil k odběru! (Tier {tier})"
              />
              <p className="text-xs text-muted-foreground">
                Použijte {'{username}'} a {'{tier}'} pro dynamické hodnoty
              </p>
            </div>

            <div className="space-y-2">
              <Label>Délka zobrazení: {subDuration}s</Label>
              <Slider
                value={[subDuration]}
                onValueChange={([v]) => setSubDuration(v)}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Donation Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Donation Alert
            </CardTitle>
            <CardDescription>Nastavení alertu pro donace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="donation-enabled">Povolit alert</Label>
              <Switch
                id="donation-enabled"
                checked={donationEnabled}
                onCheckedChange={setDonationEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Animace</Label>
              <Select value={donationAnimation} onValueChange={(v: any) => setDonationAnimation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animations.map((anim) => (
                    <SelectItem key={anim.value} value={anim.value}>
                      {anim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text šablona</Label>
              <Input
                value={donationText}
                onChange={(e) => setDonationText(e.target.value)}
                placeholder="{username} daroval {amount} coinů!"
              />
              <p className="text-xs text-muted-foreground">
                Použijte {'{username}'} a {'{amount}'} pro dynamické hodnoty
              </p>
            </div>

            <div className="space-y-2">
              <Label>Délka zobrazení: {donationDuration}s</Label>
              <Slider
                value={[donationDuration]}
                onValueChange={([v]) => setDonationDuration(v)}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Raid Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Raid Alert
            </CardTitle>
            <CardDescription>Nastavení alertu pro raidy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="raid-enabled">Povolit alert</Label>
              <Switch
                id="raid-enabled"
                checked={raidEnabled}
                onCheckedChange={setRaidEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Animace</Label>
              <Select value={raidAnimation} onValueChange={(v: any) => setRaidAnimation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animations.map((anim) => (
                    <SelectItem key={anim.value} value={anim.value}>
                      {anim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text šablona</Label>
              <Input
                value={raidText}
                onChange={(e) => setRaidText(e.target.value)}
                placeholder="{username} právě raiduje s {viewerCount} diváky!"
              />
              <p className="text-xs text-muted-foreground">
                Použijte {'{username}'} a {'{viewerCount}'} pro dynamické hodnoty
              </p>
            </div>

            <div className="space-y-2">
              <Label>Délka zobrazení: {raidDuration}s</Label>
              <Slider
                value={[raidDuration]}
                onValueChange={([v]) => setRaidDuration(v)}
                min={1}
                max={30}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="min-w-32"
          >
            {updateSettings.isPending ? 'Ukládání...' : 'Uložit Nastavení'}
          </Button>
        </div>
      </div>
    </div>
  );
}
