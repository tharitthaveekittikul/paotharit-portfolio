import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

let mockTheme = "light";
const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
    delete (document as any).startViewTransition;
  });

  it("renders a switch button after mount", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("switch", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("has aria-checked false in light mode", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("has aria-checked true in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls setTheme with dark when clicked in light mode", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with light when clicked in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("wraps setTheme in startViewTransition when available", () => {
    const mockTransition = vi.fn((cb: () => void) => cb());
    (document as any).startViewTransition = mockTransition;

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));

    expect(mockTransition).toHaveBeenCalled();
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme directly when startViewTransition is unavailable", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
