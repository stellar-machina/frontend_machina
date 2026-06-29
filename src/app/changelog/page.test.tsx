import { render, screen } from "@testing-library/react";
import ChangelogPage from "./page";
import { apiGet } from "@/lib/apiClient";

jest.mock("@/lib/apiClient", () => ({
  apiGet: jest.fn(),
}));

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe("ChangelogPage", () => {
  beforeEach(() => {
    mockApiGet.mockReset();
  });

  it("renders the shared loading status while fetching", () => {
    mockApiGet.mockReturnValue(new Promise(() => {}));

    render(<ChangelogPage />);

    expect(mockApiGet).toHaveBeenCalledWith(
      "/api/v1/changelog",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading changelog");
  });

  it("aborts the shared changelog request on unmount", () => {
    mockApiGet.mockReturnValue(new Promise(() => {}));

    const { unmount } = render(<ChangelogPage />);
    const init = mockApiGet.mock.calls[0]?.[1] as RequestInit | undefined;
    const signal = init?.signal;

    expect(signal).toEqual(expect.any(AbortSignal));
    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it("renders changelog entries on success", async () => {
    mockApiGet.mockResolvedValue({
      entries: [
        {
          version: "v1.2.0",
          date: "2026-06-23",
          notes: ["Added usage exports"],
        },
      ],
    });

    render(<ChangelogPage />);

    expect(await screen.findByRole("heading", { name: /v1.2.0/i }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getByText("Added usage exports")).toBeInTheDocument();
  });

  it("renders an empty state when no changelog entries are returned", async () => {
    mockApiGet.mockResolvedValue({ entries: [] });

    render(<ChangelogPage />);

    expect(
      await screen.findByText("No changelog entries yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Release notes will appear here once updates are published."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders API errors as alerts", async () => {
    mockApiGet.mockRejectedValue(new Error("failed to load changelog"));

    render(<ChangelogPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "failed to load changelog",
    );
  });
});
