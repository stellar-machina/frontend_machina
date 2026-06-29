import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchPage from "./page";
import { apiGet } from "@/lib/apiClient";

jest.mock("@/lib/apiClient");

jest.mock("@/lib/useDebounce", () => ({
  useDebounce: jest.fn((value: string) => value),
}));

const apiGetMock = apiGet as jest.MockedFunction<typeof apiGet>;

describe("SearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search heading and search bar", () => {
    render(<SearchPage />);

    expect(screen.getByRole("heading", { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /Search/i })).toBeInTheDocument();
  });

  it("renders an aria-live region with polite setting", () => {
    render(<SearchPage />);

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  it("does not announce results for empty query", () => {
    render(<SearchPage />);

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent("");
  });

  it("announces single result after search settles", async () => {
    const mockServices = [
      { serviceId: "service-1", priceStroops: 100 },
    ];
    apiGetMock.mockResolvedValue({ services: mockServices });

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('1 result for "test"');
    });
  });

  it("announces multiple results after search settles", async () => {
    const mockServices = [
      { serviceId: "service-1", priceStroops: 100 },
      { serviceId: "service-2", priceStroops: 200 },
      { serviceId: "service-3", priceStroops: 300 },
    ];
    apiGetMock.mockResolvedValue({ services: mockServices });

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    fireEvent.change(searchInput, { target: { value: "api" } });

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('3 results for "api"');
    });
  });

  it("announces no matches when search returns empty results", async () => {
    apiGetMock.mockResolvedValue({ services: [] });

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('No matches for "nonexistent"');
    });
  });

  it("announces no matches when API call fails", async () => {
    apiGetMock.mockRejectedValue(new Error("API error"));

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    fireEvent.change(searchInput, { target: { value: "error" } });

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('No matches for "error"');
    });
  });

  it("clears live region when query is cleared", async () => {
    const mockServices = [{ serviceId: "service-1", priceStroops: 100 }];
    apiGetMock.mockResolvedValue({ services: mockServices });

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    
    // Type a search
    fireEvent.change(searchInput, { target: { value: "test" } });
    
    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('1 result for "test"');
    });

    // Clear the search
    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent("");
    });
  });

  it("renders result links when results are found", async () => {
    const mockServices = [
      { serviceId: "service-1", priceStroops: 100 },
      { serviceId: "service-2", priceStroops: 200 },
    ];
    apiGetMock.mockResolvedValue({ services: mockServices });

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("service-1")).toBeInTheDocument();
      expect(screen.getByText("service-2")).toBeInTheDocument();
      // Check that stroops text appears (price display)
      expect(screen.getAllByText(/stroops/i)).toHaveLength(2);
    });
  });

  it("renders no matches message when results are empty", async () => {
    apiGetMock.mockResolvedValue({ services: [] });

    render(<SearchPage />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    fireEvent.change(searchInput, { target: { value: "empty" } });

    await waitFor(() => {
      expect(screen.getByText("No matches.")).toBeInTheDocument();
    });
  });

  it("does not render results or no matches message when query is empty", () => {
    render(<SearchPage />);

    expect(screen.queryByText("No matches.")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("live region is visually hidden but accessible to screen readers", () => {
    render(<SearchPage />);

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveClass("sr-only");
  });
});
