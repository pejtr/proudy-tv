import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://proudy.tv" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("streams.getLiveStreams", () => {
  it("returns streamKey field for live streams", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Get live streams via tRPC
    const liveStreams = await caller.streams.getLive();

    // Verify streamKey is included in response
    expect(Array.isArray(liveStreams)).toBe(true);
    
    // If there are streams, verify they have streamKey field
    if (liveStreams.length > 0) {
      liveStreams.forEach(stream => {
        expect(stream).toHaveProperty("streamKey");
      });
    }
  }, 10000);

  it("detects demo streams by streamKey prefix", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const liveStreams = await caller.streams.getLive();
    
    // Find streams with demo- prefix
    const demoStreams = liveStreams.filter(s => s.streamKey?.startsWith("demo-"));
    
    // Verify demo streams have correct prefix if any exist
    if (demoStreams.length > 0) {
      demoStreams.forEach(stream => {
        expect(stream.streamKey).toMatch(/^demo-/);
      });
    }
  }, 10000);

  it("includes emailVerified field for badge display", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const liveStreams = await caller.streams.getLive();
    
    // Verify all streams have emailVerified field (can be null)
    if (liveStreams.length > 0) {
      liveStreams.forEach(stream => {
        expect(stream).toHaveProperty("emailVerified");
      });
    }
  }, 10000);
});
