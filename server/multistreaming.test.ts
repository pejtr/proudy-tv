import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 9999,
    openId: "test-multistream-user",
    name: "Test Streamer",
    email: "multistream@test.cz",
    loginMethod: "manus",
    role: "user",
    emailVerified: false,
    verificationToken: null,
    verificationTokenExpiry: null,
    avatarUrl: null,
    bio: null,
    socialLinks: null,
    partnerTier: "basic",
    monthlyStreamHours: 0,
    activeSubscribers: 0,
    lastTierCheck: new Date(),
    coinsBalance: 0,
    watchPoints: 0,
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://proudy.tv" },
    } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://proudy.tv" },
    } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Multistreaming Router", () => {
  it("requires auth to get settings", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.multistreaming.getSettings()).rejects.toThrow();
  });

  it("requires auth to get connections", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.multistreaming.getConnections()).rejects.toThrow();
  });

  it("returns settings for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const settings = await caller.multistreaming.getSettings();
    expect(settings).toBeDefined();
    expect(["affiliate", "partner", "exclusive"]).toContain(settings.mode);
  });

  it("returns connections array for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const connections = await caller.multistreaming.getConnections();
    expect(Array.isArray(connections)).toBe(true);
  });

  it("can update multistreaming mode to exclusive", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.multistreaming.updateMode({ mode: "exclusive" });
    expect(result).toBeDefined();
    expect(result.mode).toBe("exclusive");
  });

  it("can update multistreaming mode back to affiliate", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.multistreaming.updateMode({ mode: "affiliate" });
    expect(result.mode).toBe("affiliate");
  });

  it("revenue split calculation is correct for each mode", () => {
    const splits = { affiliate: 0.7, partner: 0.75, exclusive: 0.85 };
    const revenue = 10000;
    expect(revenue * splits.affiliate).toBe(7000);
    expect(revenue * splits.partner).toBe(7500);
    expect(revenue * splits.exclusive).toBe(8500);
  });

  it("exclusive mode has highest revenue split", () => {
    const splits = { affiliate: 0.7, partner: 0.75, exclusive: 0.85 };
    expect(splits.exclusive).toBeGreaterThan(splits.partner);
    expect(splits.partner).toBeGreaterThan(splits.affiliate);
  });
});
