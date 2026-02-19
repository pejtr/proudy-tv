import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-1",
    email: "test@proudy.tv",
    name: "TestUser",
    loginMethod: "manus",
    role: "viewer",
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
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://proudy.tv" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const ctx = createUserContext({ name: "ProudyFan" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result!.name).toBe("ProudyFan");
    expect(result!.openId).toBe("test-user-1");
  });
});

describe("streams.getLive", () => {
  it("returns an array (possibly empty) of live streams", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.streams.getLive();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("chat.getHistory", () => {
  it("returns an array for chat history", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.chat.getHistory({ streamId: 1, limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("community.getPosts", () => {
  it("returns posts array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.community.getPosts({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("goals.getActive", () => {
  it("returns null or goal object for a streamer", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.goals.getActive({ streamerId: 999 });
    // Should return null for non-existent streamer
    expect(result === null || typeof result === "object").toBe(true);
  });
});

describe("goals.getHistory", () => {
  it("returns array of completed goals", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.goals.getHistory({ streamerId: 999, limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("payment.createCheckout - requires auth", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.payment.createCheckout({
        productType: "coins",
        coinAmount: 100,
        priceInCzk: 100,
      })
    ).rejects.toThrow();
  });
});

describe("follows.getFollowers", () => {
  it("returns array of followers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.follows.getFollowers({ userId: 999 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("follows.getFollowing", () => {
  it("returns array of following", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.follows.getFollowing({ userId: 999 });
    expect(Array.isArray(result)).toBe(true);
  });
});
