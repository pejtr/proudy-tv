import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Sparkles, Crown, Globe } from 'lucide-react';

// Platform-wide animated emotes (Twitch-style)
const GLOBAL_EMOTES = [
  { code: ':proudyHype:', label: 'Hype', emoji: '🎉', animation: 'animate-bounce' },
  { code: ':proudyLove:', label: 'Love', emoji: '💖', animation: 'animate-pulse' },
  { code: ':proudyPog:', label: 'Pog', emoji: '😮', animation: 'animate-shake' },
  { code: ':proudyLUL:', label: 'LUL', emoji: '😂', animation: 'animate-wiggle' },
  { code: ':proudyGG:', label: 'GG', emoji: '🏆', animation: 'animate-spin-slow' },
  { code: ':proudyRage:', label: 'Rage', emoji: '😡', animation: 'animate-shake' },
  { code: ':proudySad:', label: 'Sad', emoji: '😢', animation: 'animate-pulse' },
  { code: ':proudyFire:', label: 'Fire', emoji: '🔥', animation: 'animate-bounce' },
  { code: ':proudyCool:', label: 'Cool', emoji: '😎', animation: 'animate-wiggle' },
  { code: ':proudyWave:', label: 'Wave', emoji: '👋', animation: 'animate-wave' },
  { code: ':proudyStar:', label: 'Star', emoji: '⭐', animation: 'animate-spin-slow' },
  { code: ':proudyHeart:', label: 'Heart', emoji: '❤️', animation: 'animate-heartbeat' },
  { code: ':proudyClap:', label: 'Clap', emoji: '👏', animation: 'animate-bounce' },
  { code: ':proudyThink:', label: 'Think', emoji: '🤔', animation: 'animate-wiggle' },
  { code: ':proudyCry:', label: 'Cry', emoji: '😭', animation: 'animate-shake' },
  { code: ':proudyDance:', label: 'Dance', emoji: '💃', animation: 'animate-bounce' },
  { code: ':proudyKappa:', label: 'Kappa', emoji: '😏', animation: 'animate-wiggle' },
  { code: ':proudyEZ:', label: 'EZ', emoji: '😌', animation: 'animate-pulse' },
  { code: ':proudyRIP:', label: 'RIP', emoji: '⚰️', animation: 'animate-shake' },
  { code: ':proudyCheer:', label: 'Cheer', emoji: '🥳', animation: 'animate-bounce' },
  { code: ':proudyMonka:', label: 'Monka', emoji: '😰', animation: 'animate-shake' },
  { code: ':proudyPepe:', label: 'Pepe', emoji: '🐸', animation: 'animate-wiggle' },
  { code: ':proudyCZ:', label: 'CZ', emoji: '🇨🇿', animation: 'animate-wave' },
  { code: ':proudyGift:', label: 'Gift', emoji: '🎁', animation: 'animate-bounce' },
  { code: ':proudyDiamond:', label: 'Diamond', emoji: '💎', animation: 'animate-spin-slow' },
  { code: ':proudyRocket:', label: 'Rocket', emoji: '🚀', animation: 'animate-bounce' },
  { code: ':proudySkull:', label: 'Skull', emoji: '💀', animation: 'animate-shake' },
  { code: ':proudy100:', label: '100', emoji: '💯', animation: 'animate-bounce' },
  { code: ':proudyZZZ:', label: 'ZZZ', emoji: '😴', animation: 'animate-pulse' },
  { code: ':proudyAngel:', label: 'Angel', emoji: '😇', animation: 'animate-float' },
];

// Sub-only emotes (premium)
const SUB_EMOTES = [
  { code: ':subHype:', label: 'Sub Hype', emoji: '🌟', animation: 'animate-rainbow' },
  { code: ':subLove:', label: 'Sub Love', emoji: '💝', animation: 'animate-heartbeat' },
  { code: ':subFlex:', label: 'Sub Flex', emoji: '💪', animation: 'animate-bounce' },
  { code: ':subVIP:', label: 'Sub VIP', emoji: '👑', animation: 'animate-spin-slow' },
  { code: ':subPride:', label: 'Sub Pride', emoji: '🌈', animation: 'animate-rainbow' },
  { code: ':subGem:', label: 'Sub Gem', emoji: '💎', animation: 'animate-spin-slow' },
  { code: ':subThunder:', label: 'Sub Thunder', emoji: '⚡', animation: 'animate-shake' },
  { code: ':subCrown:', label: 'Sub Crown', emoji: '👑', animation: 'animate-float' },
];

interface EmotePickerProps {
  onEmoteSelect: (emoteCode: string) => void;
  isSubscriber?: boolean;
}

export default function EmotePicker({ onEmoteSelect, isSubscriber = false }: EmotePickerProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('global');

  const filteredGlobal = useMemo(() => {
    if (!search) return GLOBAL_EMOTES;
    return GLOBAL_EMOTES.filter(e => 
      e.label.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredSub = useMemo(() => {
    if (!search) return SUB_EMOTES;
    return SUB_EMOTES.filter(e => 
      e.label.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="w-[340px] bg-background border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat emotes..."
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full rounded-none border-b border-border bg-transparent h-10">
          <TabsTrigger value="global" className="flex-1 gap-1 text-xs">
            <Globe className="h-3 w-3" />
            Global
          </TabsTrigger>
          <TabsTrigger value="sub" className="flex-1 gap-1 text-xs">
            <Crown className="h-3 w-3" />
            Sub
          </TabsTrigger>
          <TabsTrigger value="streamer" className="flex-1 gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            Streamer
          </TabsTrigger>
        </TabsList>

        {/* Global Emotes */}
        <TabsContent value="global" className="m-0">
          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-6 gap-1 p-2">
              {filteredGlobal.map((emote) => (
                <Button
                  key={emote.code}
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 hover:bg-primary/20 rounded-lg group relative"
                  onClick={() => onEmoteSelect(emote.code)}
                  title={emote.label}
                >
                  <span className={`text-2xl ${emote.animation} group-hover:${emote.animation}`}>
                    {emote.emoji}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Sub Emotes */}
        <TabsContent value="sub" className="m-0">
          <ScrollArea className="h-[280px]">
            {isSubscriber ? (
              <div className="grid grid-cols-6 gap-1 p-2">
                {filteredSub.map((emote) => (
                  <Button
                    key={emote.code}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 hover:bg-primary/20 rounded-lg group relative"
                    onClick={() => onEmoteSelect(emote.code)}
                    title={emote.label}
                  >
                    <span className={`text-2xl ${emote.animation} group-hover:${emote.animation}`}>
                      {emote.emoji}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <Crown className="h-12 w-12 text-yellow-500 mb-4" />
                <p className="font-bold text-lg mb-2">Sub-only emotes</p>
                <p className="text-sm text-muted-foreground">
                  Kupte si předplatné za 88 coins/měsíc a odemkněte exkluzivní animované emotes!
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Streamer Emotes */}
        <TabsContent value="streamer" className="m-0">
          <ScrollArea className="h-[280px]">
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
              <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
              <p className="font-bold text-lg mb-2">Streamer Emotes</p>
              <p className="text-sm text-muted-foreground">
                Streamer zatím nemá vlastní emotes. Streameři mohou vytvářet custom emotes pomocí AI generátoru!
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Emote code to rendered element mapping
export function renderEmotesInMessage(message: string): (string | React.ReactElement)[] {
  const emoteMap = new Map<string, { emoji: string; animation: string }>();
  
  [...GLOBAL_EMOTES, ...SUB_EMOTES].forEach(e => {
    emoteMap.set(e.code, { emoji: e.emoji, animation: e.animation });
  });

  const emoteRegex = /:([\w]+):/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = emoteRegex.exec(message)) !== null) {
    const fullCode = `:${match[1]}:`;
    const emote = emoteMap.get(fullCode);

    if (emote) {
      // Add text before emote
      if (match.index > lastIndex) {
        parts.push(message.substring(lastIndex, match.index));
      }
      // Add animated emote
      parts.push(
        <span
          key={`${match.index}-${fullCode}`}
          className={`inline-block text-xl ${emote.animation}`}
          title={fullCode}
        >
          {emote.emoji}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
  }

  // Add remaining text
  if (lastIndex < message.length) {
    parts.push(message.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [message];
}
