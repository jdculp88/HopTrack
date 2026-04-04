/**
 * UserAvatar + AvatarStack Component Tests — Sprint 150 (The Playwright)
 *
 * Covers render variants, initials fallback, gradient background,
 * size variants, level badge, and avatar stacking.
 *
 * Dakota + Reese
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/image — renders as plain img in jsdom
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { UserAvatar, AvatarStack } from "@/components/ui/UserAvatar";

// ─── Test Data ──────────────────────────────────────────────────────────────

const profileWithAvatar = {
  display_name: "Joshua Culp",
  avatar_url: "https://example.com/avatar.jpg",
  xp: 500,
  username: "jculp",
};

const profileWithoutAvatar = {
  display_name: "Morgan Manager",
  avatar_url: null,
  xp: 1000,
  username: "morgan",
};

const profileMinimal = {
  display_name: null,
  avatar_url: null,
  username: "anon123",
};

// ─── UserAvatar Tests ───────────────────────────────────────────────────────

describe("UserAvatar", () => {
  it("renders an image when avatar_url is provided", () => {
    render(<UserAvatar profile={profileWithAvatar} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", expect.stringContaining("avatar.jpg"));
    expect(img).toHaveAttribute("alt", "Joshua Culp");
  });

  it("renders initials when no avatar_url", () => {
    render(<UserAvatar profile={profileWithoutAvatar} />);

    // No img tag
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    // Initials: "Morgan Manager" -> "MM"
    expect(screen.getByText("MM")).toBeInTheDocument();
  });

  it("derives initials from first and last name", () => {
    render(
      <UserAvatar
        profile={{ display_name: "Casey QA", avatar_url: null }}
      />
    );
    expect(screen.getByText("CQ")).toBeInTheDocument();
  });

  it("uses single initial for single name", () => {
    render(
      <UserAvatar
        profile={{ display_name: "Jordan", avatar_url: null }}
      />
    );
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("falls back to username when display_name is null", () => {
    render(<UserAvatar profile={profileMinimal} />);

    // Username "anon123" -> uses first char(s) via getInitials
    // getInitials("anon123") -> "A" (single word, first char)
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("falls back to '?' when no display_name or username", () => {
    render(
      <UserAvatar
        profile={{ display_name: null, avatar_url: null }}
      />
    );
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("shows level badge when showLevel is true", () => {
    // xp: 500 = Level 4 (Brew Buddy, xp_required: 500)
    render(<UserAvatar profile={profileWithAvatar} showLevel />);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("does not show level badge by default", () => {
    render(<UserAvatar profile={profileWithAvatar} />);

    // Level 4 text should NOT be present as a badge
    // (it might appear in other contexts, so check specifically for badge container)
    const badges = document.querySelectorAll("[class*='accent-gold']");
    expect(badges).toHaveLength(0);
  });

  it("uses explicit level when provided on profile", () => {
    render(
      <UserAvatar
        profile={{ ...profileWithAvatar, level: 10 }}
        showLevel
      />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders all size variants without error", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

    for (const size of sizes) {
      const { unmount } = render(
        <UserAvatar profile={profileWithAvatar} size={size} />
      );
      // Should render without throwing
      expect(screen.getByRole("img")).toBeInTheDocument();
      unmount();
    }
  });

  it("applies custom className", () => {
    const { container } = render(
      <UserAvatar profile={profileWithAvatar} className="my-custom-class" />
    );

    expect(container.firstElementChild).toHaveClass("my-custom-class");
  });
});

// ─── AvatarStack Tests ──────────────────────────────────────────────────────

describe("AvatarStack", () => {
  const profiles = [
    { display_name: "Alice", avatar_url: null },
    { display_name: "Bob", avatar_url: null },
    { display_name: "Casey", avatar_url: null },
    { display_name: "Drew", avatar_url: null },
    { display_name: "Eve", avatar_url: null },
    { display_name: "Finley", avatar_url: null },
  ];

  it("renders up to max avatars", () => {
    render(<AvatarStack profiles={profiles} max={4} />);

    // 4 visible avatars (A, B, C, D initials)
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();

    // Eve and Finley are overflowed
    expect(screen.queryByText("E")).not.toBeInTheDocument();
    expect(screen.queryByText("F")).not.toBeInTheDocument();
  });

  it("shows overflow count when more profiles than max", () => {
    render(<AvatarStack profiles={profiles} max={4} />);

    // 6 total - 4 shown = +2 overflow
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("does not show overflow when profiles fit within max", () => {
    render(<AvatarStack profiles={profiles.slice(0, 3)} max={4} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("defaults to max 4", () => {
    render(<AvatarStack profiles={profiles} />);

    // Should show +2 overflow (6 - 4)
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AvatarStack profiles={profiles.slice(0, 2)} className="stack-test" />
    );

    expect(container.firstElementChild).toHaveClass("stack-test");
  });
});
