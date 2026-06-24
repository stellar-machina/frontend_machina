import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import EventsPage from "./page";

type EventRow = {
  id: string;
  ts: number;
  type: string;
  payload: Record<string, unknown>;
};

const BASE_TIME = new Date("2026-06-23T12:00:00.000Z");

const FIRST_BATCH: EventRow[] = [
  {
    id: "evt-1",
    ts: BASE_TIME.getTime() - 60_000,
    type: "payment.created",
    payload: { amount: 10 },
  },
  {
    id: "evt-2",
    ts: BASE_TIME.getTime() - 120_000,
    type: "payment.failed",
    payload: { code: "declined" },
  },
  {
    id: "evt-3",
    ts: BASE_TIME.getTime() - 180_000,
    type: "agent.updated",
    payload: { agent: "A1" },
  },
];

const REFRESH_BATCH: EventRow[] = [
  {
    id: "evt-4",
    ts: BASE_TIME.getTime() - 30_000,
    type: "payment.created",
    payload: { amount: 20 },
  },
  {
    id: "evt-5",
    ts: BASE_TIME.getTime() - 15_000,
    type: "audit.logged",
    payload: { note: "refreshed" },
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("EventsPage", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(BASE_TIME);
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders events, filters by type, and shows an empty state when nothing matches", async () => {
    const fetchMock = jest.fn(async (url: RequestInfo | URL) => {
      expect(String(url)).toContain("/api/v1/events?limit=100");
      return jsonResponse({ items: FIRST_BATCH });
    });
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    const { container } = render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText("payment.created")).toBeInTheDocument();
      expect(screen.getByText("payment.failed")).toBeInTheDocument();
      expect(screen.getByText("agent.updated")).toBeInTheDocument();
    });

    expect(container.querySelectorAll("time")).toHaveLength(6);
    expect(screen.getByText("1m ago")).toBeInTheDocument();

    const filter = screen.getByRole("searchbox", {
      name: /filter events by type/i,
    });
    fireEvent.change(filter, { target: { value: "payment.failed" } });

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(screen.getByText("payment.failed")).toBeInTheDocument();
      expect(screen.queryByText("payment.created")).not.toBeInTheDocument();
      expect(screen.queryByText("agent.updated")).not.toBeInTheDocument();
    });

    expect(fetchMock.mock.calls[1][0]).toContain("type=payment.failed");

    fireEvent.change(filter, { target: { value: "does-not-exist" } });

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No events match "does-not-exist"\./i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /clear filter/i })
      ).toBeInTheDocument();
    });
  });

  it("starts and stops polling when auto-refresh is toggled", async () => {
    let call = 0;
    const fetchMock = jest.fn(async () => {
      call += 1;
      return call === 1
        ? jsonResponse({ items: FIRST_BATCH.slice(0, 1) })
        : jsonResponse({ items: REFRESH_BATCH });
    });
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText("payment.created")).toBeInTheDocument();
    });

    const toggle = screen.getByRole("button", { name: /auto-refresh event log/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByText("audit.logged")).toBeInTheDocument();
    });
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(3);

    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    const callsAfterOff = fetchMock.mock.calls.length;

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(fetchMock.mock.calls.length).toBe(callsAfterOff);
  });

  it("clears the polling interval on unmount", async () => {
    const fetchMock = jest.fn(async () => jsonResponse({ items: FIRST_BATCH }));
    const clearIntervalSpy = jest.spyOn(globalThis, "clearInterval");
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    const { unmount } = render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText("payment.created")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /auto-refresh event log/i }));

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();

    const callsBefore = fetchMock.mock.calls.length;
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(callsBefore);
  });

  it("surfaces malformed event payloads as an error", async () => {
    const fetchMock = jest.fn(async () => jsonResponse({ items: { nope: true } }));
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    render(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /malformed events payload/i
      );
    });
  });
});
