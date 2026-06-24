import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApiKeysPage from "./page";

const FAKE_KEY = "sk_live_abc123secretvalue";
const mockItems = [{ prefix: "abc123", label: "my-key", createdAt: 1700000000 }];

function mockFetchSuccess() {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ items: mockItems }),
  } as unknown as Response);
}

afterEach(() => jest.restoreAllMocks());

it("does not delete immediately when Revoke is clicked", async () => {
  mockFetchSuccess();
  render(<ApiKeysPage />);
  await screen.findByText("my-key");
  const fetchMock = globalThis.fetch as jest.Mock;
  fetchMock.mockClear();

  fireEvent.click(screen.getByRole("button", { name: /^revoke$/i }));
  expect(fetchMock).not.toHaveBeenCalled();
});

it("shows confirm dialog when Revoke is clicked", async () => {
  mockFetchSuccess();
  render(<ApiKeysPage />);
  await screen.findByText("my-key");

  fireEvent.click(screen.getByRole("button", { name: /^revoke$/i }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText(/revoke api key/i)).toBeInTheDocument();
});

it("cancels without deleting when Cancel is clicked", async () => {
  mockFetchSuccess();
  render(<ApiKeysPage />);
  await screen.findByText("my-key");
  const fetchMock = globalThis.fetch as jest.Mock;
  fetchMock.mockClear();

  fireEvent.click(screen.getByRole("button", { name: /^revoke$/i }));
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("calls DELETE and closes dialog when confirmed", async () => {
  mockFetchSuccess();
  render(<ApiKeysPage />);
  await screen.findByText("my-key");

  // stub DELETE + reload
  (globalThis.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as unknown as Response)
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [] }) } as unknown as Response);

  fireEvent.click(screen.getByRole("button", { name: /^revoke$/i }));
  // click the Revoke confirm button inside the dialog
  const confirmBtn = screen.getAllByRole("button", { name: /^revoke$/i })[0];
  fireEvent.click(confirmBtn);

  await waitFor(() => {
    const calls = (globalThis.fetch as jest.Mock).mock.calls;
    expect(calls.some((c: string[]) => c[0].includes("/api/v1/api-keys/abc123"))).toBe(true);
  });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

// --- reveal-once panel ---

function mockFetchCreate() {
  globalThis.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [] }) } as unknown as Response)
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ key: FAKE_KEY }) } as unknown as Response)
    .mockResolvedValue({ ok: true, status: 200, json: async () => ({ items: [] }) } as unknown as Response);
}

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

it("shows the panel masked after key creation", async () => {
  mockFetchCreate();
  render(<ApiKeysPage />);
  fireEvent.change(screen.getByLabelText("Label"), { target: { value: "test" } });
  fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form")!);
  await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
  expect(screen.getByRole("status")).not.toHaveTextContent(FAKE_KEY);
  expect(screen.getByRole("status")).toHaveTextContent("****");
});

it("reveals the full key when Reveal is clicked", async () => {
  mockFetchCreate();
  render(<ApiKeysPage />);
  fireEvent.change(screen.getByLabelText("Label"), { target: { value: "test" } });
  fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form")!);
  await waitFor(() => screen.getByRole("button", { name: "Reveal" }));
  fireEvent.click(screen.getByRole("button", { name: "Reveal" }));
  expect(screen.getByRole("status")).toHaveTextContent(FAKE_KEY);
  expect(screen.getByRole("button", { name: "Hide" })).toHaveAttribute("aria-pressed", "true");
});

it("hides the key again when Hide is clicked", async () => {
  mockFetchCreate();
  render(<ApiKeysPage />);
  fireEvent.change(screen.getByLabelText("Label"), { target: { value: "test" } });
  fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form")!);
  await waitFor(() => screen.getByRole("button", { name: "Reveal" }));
  fireEvent.click(screen.getByRole("button", { name: "Reveal" }));
  fireEvent.click(screen.getByRole("button", { name: "Hide" }));
  expect(screen.getByRole("status")).not.toHaveTextContent(FAKE_KEY);
});

it("copies the full key to clipboard", async () => {
  mockFetchCreate();
  render(<ApiKeysPage />);
  fireEvent.change(screen.getByLabelText("Label"), { target: { value: "test" } });
  fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form")!);
  await waitFor(() => screen.getByRole("button", { name: "Copy" }));
  fireEvent.click(screen.getByRole("button", { name: "Copy" }));
  await waitFor(() =>
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FAKE_KEY)
  );
});

it("removes the panel when Done is clicked", async () => {
  mockFetchCreate();
  render(<ApiKeysPage />);
  fireEvent.change(screen.getByLabelText("Label"), { target: { value: "test" } });
  fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form")!);
  await waitFor(() => screen.getByRole("button", { name: /done/i }));
  fireEvent.click(screen.getByRole("button", { name: /done/i }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("handles clipboard unavailable without throwing", async () => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockRejectedValue(new Error("no clipboard")) },
  });
  mockFetchCreate();
  render(<ApiKeysPage />);
  fireEvent.change(screen.getByLabelText("Label"), { target: { value: "test" } });
  fireEvent.submit(screen.getByRole("button", { name: "Create" }).closest("form")!);
  await waitFor(() => screen.getByRole("button", { name: "Copy" }));
  expect(() => fireEvent.click(screen.getByRole("button", { name: "Copy" }))).not.toThrow();
});
