import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "../CommandPaletteProvider";

function TestConsumer() {
  const { open, setOpen } = useCommandPalette();
  return (
    <div>
      <span data-testid="state">{open ? "open" : "closed"}</span>
      <button onClick={() => setOpen(true)}>open</button>
    </div>
  );
}

describe("CommandPaletteProvider", () => {
  it("provides open=false by default", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("setOpen(true) updates state", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.click(screen.getByText("open"));
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  it("Cmd+K toggles open", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state").textContent).toBe("open");
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });

  it("Ctrl+K toggles open", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  it("Escape closes palette", () => {
    render(
      <CommandPaletteProvider>
        <TestConsumer />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state").textContent).toBe("open");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("state").textContent).toBe("closed");
  });
});
