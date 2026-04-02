// Brand team activity log unit tests — Avery + Reese, Sprint 122 (The Crew)
import { describe, it, expect, vi } from "vitest";
import { logTeamActivity } from "@/lib/brand-team-activity";

describe("logTeamActivity", () => {
  it("inserts an activity record with correct fields", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    await logTeamActivity(
      mockSupabase as any,
      "brand-123",
      "actor-456",
      "target-789",
      "added",
      null,
      "regional_manager"
    );

    expect(mockSupabase.from).toHaveBeenCalledWith("brand_team_activity");
    expect(mockInsert).toHaveBeenCalledWith({
      brand_id: "brand-123",
      actor_id: "actor-456",
      target_user_id: "target-789",
      action: "added",
      old_value: null,
      new_value: "regional_manager",
    });
  });

  it("handles role_changed action with old and new values", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    await logTeamActivity(
      mockSupabase as any,
      "brand-1",
      "actor-1",
      "target-1",
      "role_changed",
      "regional_manager",
      "brand_manager"
    );

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "role_changed",
        old_value: "regional_manager",
        new_value: "brand_manager",
      })
    );
  });

  it("handles scope_changed action", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    await logTeamActivity(
      mockSupabase as any,
      "brand-1",
      "actor-1",
      "target-1",
      "scope_changed",
      "all locations",
      "2 locations"
    );

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "scope_changed",
        old_value: "all locations",
        new_value: "2 locations",
      })
    );
  });

  it("handles removed action with null new_value", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    await logTeamActivity(
      mockSupabase as any,
      "brand-1",
      "actor-1",
      "target-1",
      "removed",
      "brand_manager",
      null
    );

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "removed",
        old_value: "brand_manager",
        new_value: null,
      })
    );
  });

  it("does not throw on insert error (warns instead)", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: { message: "RLS denied" } });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await logTeamActivity(
      mockSupabase as any,
      "brand-1",
      "actor-1",
      "target-1",
      "added",
      null,
      "owner"
    );

    expect(warnSpy).toHaveBeenCalledWith(
      "[brand-team-activity] Failed to log activity:",
      "RLS denied"
    );
    warnSpy.mockRestore();
  });

  it("defaults null for undefined old/new values", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    await logTeamActivity(
      mockSupabase as any,
      "brand-1",
      "actor-1",
      "target-1",
      "added"
    );

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        old_value: null,
        new_value: null,
      })
    );
  });
});
