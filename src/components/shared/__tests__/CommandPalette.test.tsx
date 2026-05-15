import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CommandPaletteContext } from "../CommandPaletteProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { CommandPalette } from "../CommandPalette";

const mockEntries = [
  {
    type: "blog",
    title: "Hello World",
    description: "A post",
    href: "/en/blog/hello",
    tags: [],
  },
  {
    type: "project",
    title: "Zentri",
    description: "Finance app",
    href: "/en/projects/zentri",
    tags: ["Next.js"],
  },
  {
    type: "doc",
    title: "Overview",
    href: "/en/docs/zentri/overview",
    breadcrumb: "Zentri",
  },
  {
    type: "section",
    title: "Introduction",
    href: "/en/docs/zentri/overview#introduction",
    breadcrumb: "Zentri > Overview",
  },
];

function renderOpen(setOpen = vi.fn()) {
  mockFetch.mockResolvedValue({ json: async () => mockEntries });
  return render(
    <CommandPaletteContext.Provider value={{ open: true, setOpen }}>
      <CommandPalette />
    </CommandPaletteContext.Provider>,
  );
}

describe("CommandPalette", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders nothing when closed", () => {
    mockFetch.mockResolvedValue({ json: async () => [] });
    render(
      <CommandPaletteContext.Provider value={{ open: false, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    expect(
      screen.queryByPlaceholderText("Search or type a command..."),
    ).toBeNull();
  });

  it("renders search input when open", async () => {
    renderOpen();
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search or type a command..."),
      ).toBeTruthy();
    });
  });

  it("shows Actions group with Toggle Theme", async () => {
    renderOpen();
    await waitFor(() => {
      expect(screen.getByText("Toggle Theme")).toBeTruthy();
    });
  });

  it("shows blog results after fetch", async () => {
    renderOpen();
    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeTruthy();
    });
  });

  it("shows section results with breadcrumb", async () => {
    renderOpen();
    await waitFor(() => {
      expect(screen.getByText("Introduction")).toBeTruthy();
      expect(screen.getByText("Zentri > Overview")).toBeTruthy();
    });
  });

  it("fetches index only once across multiple opens", async () => {
    mockFetch.mockResolvedValue({ json: async () => mockEntries });
    const { rerender } = render(
      <CommandPaletteContext.Provider value={{ open: true, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    rerender(
      <CommandPaletteContext.Provider value={{ open: false, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    rerender(
      <CommandPaletteContext.Provider value={{ open: true, setOpen: vi.fn() }}>
        <CommandPalette />
      </CommandPaletteContext.Provider>,
    );
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  });
});
