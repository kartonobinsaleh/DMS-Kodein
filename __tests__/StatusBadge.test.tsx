import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../components/ui/status-badge";
import "@testing-library/jest-dom";

describe("StatusBadge Component", () => {
  it("renders with CORRECT state labels", () => {
    const { rerender } = render(<StatusBadge status="AVAILABLE" />);
    expect(screen.getByText("Available")).toBeInTheDocument();

    rerender(<StatusBadge status="BORROWED" />);
    expect(screen.getByText("Borrowed")).toBeInTheDocument();

    rerender(<StatusBadge status="MAINTENANCE" />);
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
  });

  it("applies the correct CSS classes based on status", () => {
    const { container } = render(<StatusBadge status="AVAILABLE" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-emerald-500/10");
    expect(badge).toHaveClass("text-emerald-500");
  });
});
