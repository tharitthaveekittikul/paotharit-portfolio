import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPaletteContext } from "../CommandPaletteProvider";
import { SearchButton } from "../SearchButton";

function renderWithContext(setOpen: ReturnType<typeof vi.fn>) {
  return render(
    <CommandPaletteContext.Provider value={{ open: false, setOpen }}>
      <SearchButton />
    </CommandPaletteContext.Provider>,
  );
}

describe("SearchButton", () => {
  it("renders a button with accessible label", () => {
    renderWithContext(vi.fn());
    expect(screen.getByRole("button", { name: /open search/i })).toBeTruthy();
  });

  it("calls setOpen(true) when clicked", () => {
    const setOpen = vi.fn();
    renderWithContext(setOpen);
    fireEvent.click(screen.getByRole("button"));
    expect(setOpen).toHaveBeenCalledWith(true);
  });
});
