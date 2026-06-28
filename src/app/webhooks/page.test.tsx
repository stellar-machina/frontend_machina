import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import WebhooksPage from "./page";

const mockItems = [
  { id: "wh_1", url: "https://example.com/hook", events: ["usage.recorded"], createdAt: 1700000000 },
];

function mockFetchSuccess() {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ items: mockItems }),
  } as unknown as Response);
}

afterEach(() => jest.restoreAllMocks());

it("does not delete immediately when Remove is clicked", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");
  const fetchMock = globalThis.fetch as jest.Mock;
  fetchMock.mockClear();

  fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
  expect(fetchMock).not.toHaveBeenCalled();
});

it("shows confirm dialog when Remove is clicked", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");

  fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText(/remove webhook/i)).toBeInTheDocument();
});

it("cancels without deleting when Cancel is clicked", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");
  const fetchMock = globalThis.fetch as jest.Mock;
  fetchMock.mockClear();

  fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("calls DELETE and closes dialog when confirmed", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");

  // stub DELETE + reload
  (globalThis.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response)
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [] }) } as unknown as Response);

  fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
  const dialog = screen.getByRole("dialog");
  const confirmBtn = within(dialog).getByRole("button", { name: /^remove$/i });
  fireEvent.click(confirmBtn);

  await waitFor(() => {
    const calls = (globalThis.fetch as jest.Mock).mock.calls;
    expect(calls.some((c: string[]) => c[0].includes("/api/v1/webhooks/wh_1"))).toBe(true);
  });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("shows loading spinner on initial load", async () => {
  let resolveFetch: (value: unknown) => void;
  const fetchPromise = new Promise((resolve) => {
    resolveFetch = resolve;
  });
  globalThis.fetch = jest.fn().mockReturnValue(fetchPromise);

  render(<WebhooksPage />);
  expect(screen.getByRole("status")).toBeInTheDocument();
  expect(screen.getByText(/loading webhooks/i)).toBeInTheDocument();

  resolveFetch!({
    ok: true,
    status: 200,
    json: async () => ({ items: [] }),
  });
  await screen.findByText(/no webhooks registered yet/i);
});

it("shows empty state when no webhooks are registered", async () => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ items: [] }),
  } as unknown as Response);

  render(<WebhooksPage />);
  await screen.findByText(/no webhooks registered yet/i);
  expect(screen.getByText(/register a webhook url to start receiving real-time event notifications/i)).toBeInTheDocument();
});

it("shows list inside accessible region when webhooks exist", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");
  expect(screen.getByRole("region", { name: /registered webhooks/i })).toBeInTheDocument();
});

it("handles creation error", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");

  globalThis.fetch = jest.fn().mockRejectedValue(new Error("Failed to create"));

  fireEvent.change(screen.getByPlaceholderText(/https:\/\/example.com\/agentpay-hook/i), {
    target: { value: "https://new.com/hook" },
  });
  fireEvent.click(screen.getByRole("button", { name: /register/i }));

  await screen.findByText("Failed to create");
});

it("handles deletion error", async () => {
  mockFetchSuccess();
  render(<WebhooksPage />);
  await screen.findByText("https://example.com/hook");

  globalThis.fetch = jest.fn().mockRejectedValue(new Error("Failed to delete"));

  fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
  // Target the confirm button inside the dialog specifically
  const dialog = screen.getByRole("dialog");
  const confirmBtn = within(dialog).getByRole("button", { name: /^remove$/i });
  fireEvent.click(confirmBtn);

  await screen.findByText("Failed to delete");
});

it("handles fetch error", async () => {
  globalThis.fetch = jest.fn().mockRejectedValue(new Error("Failed to fetch"));
  render(<WebhooksPage />);
  await screen.findByText("Failed to fetch");
});
