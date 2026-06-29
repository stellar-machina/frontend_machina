import { render, screen } from "@testing-library/react";
import AgentDetailPage from "./page";
import { apiGet } from "@/lib/apiClient";

jest.mock("@/lib/apiClient", () => ({
  apiGet: jest.fn(),
}));

jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    use: (usable: unknown) => {
      const u = usable as { _value?: unknown } | null | undefined;
      if (u && u._value) {
        return u._value;
      }
      return originalReact.use(usable);
    },
  };
});

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe("AgentDetailPage", () => {
  beforeEach(() => {
    mockApiGet.mockReset();
    mockApiGet.mockImplementation((url: string) => {
      if (url.endsWith("/total")) return Promise.resolve({ total: 42 }) as never;
      if (url.endsWith("/usage")) return Promise.resolve({ items: [] }) as never;
      return Promise.reject(new Error("Not found")) as never;
    });
  });

  function renderPage(agentId: string) {
    const params = Promise.resolve({ agent: agentId }) as Promise<{
      agent: string;
    }> & {
      _value: { agent: string };
    };
    params._value = { agent: agentId };
    return render(<AgentDetailPage params={params} />);
  }

  it("renders the Breadcrumb trail with an Agents link and a current-page item", async () => {
    renderPage("agent-alpha");

    await screen.findByText(/Lifetime total/i);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();

    const agentsLink = screen.getByRole("link", { name: "Agents" });
    expect(agentsLink).toBeInTheDocument();
    expect(agentsLink).toHaveAttribute("href", "/agents");

    const currentItem = screen.getByText("agent-alpha", { selector: '[aria-current="page"]' });
    expect(currentItem).toBeInTheDocument();
  });

  it("handles long agent identifiers correctly in breadcrumb", async () => {
    const longId = "a".repeat(200);
    renderPage(longId);

    await screen.findByText(/Lifetime total/i);

    const currentItem = screen.getByText(longId, { selector: '[aria-current="page"]' });
    expect(currentItem).toBeInTheDocument();
  });

  it("handles special characters in the agent identifier", async () => {
    const specialId = "agent/with/slashes";
    renderPage(specialId);

    await screen.findByText(/Lifetime total/i);

    const currentItem = screen.getByText(specialId, { selector: '[aria-current="page"]' });
    expect(currentItem).toBeInTheDocument();
  });

  it("formats a large lifetime total with thousands separators", async () => {
    mockApiGet.mockReset();
    mockApiGet.mockImplementation((url: string) => {
      if (url.endsWith("/total")) return Promise.resolve({ total: 1234567 }) as never;
      if (url.endsWith("/usage")) return Promise.resolve({ items: [] }) as never;
      return Promise.reject(new Error("Not found")) as never;
    });

    renderPage("agent-big");

    const strong = await screen.findByText("1,234,567");
    expect(strong.tagName).toBe("STRONG");
    expect(strong.parentElement).toHaveTextContent("1,234,567 requests");
  });

  it("formats per-service totals with thousands separators", async () => {
    mockApiGet.mockReset();
    mockApiGet.mockImplementation((url: string) => {
      if (url.endsWith("/total")) return Promise.resolve({ total: 0 }) as never;
      if (url.endsWith("/usage"))
        return Promise.resolve({
          items: [
            { serviceId: "svc-a", total: 999 },
            { serviceId: "svc-b", total: 1500000 },
          ],
        }) as never;
      return Promise.reject(new Error("Not found")) as never;
    });

    renderPage("agent-svc");

    await screen.findByText(/Lifetime total/i);

    expect(screen.getByText("999 requests")).toBeInTheDocument();
    expect(screen.getByText("1,500,000 requests")).toBeInTheDocument();
  });

  it("renders zero total without grouping", async () => {
    mockApiGet.mockReset();
    mockApiGet.mockImplementation((url: string) => {
      if (url.endsWith("/total")) return Promise.resolve({ total: 0 }) as never;
      if (url.endsWith("/usage")) return Promise.resolve({ items: [] }) as never;
      return Promise.reject(new Error("Not found")) as never;
    });

    renderPage("agent-zero");

    const strong = await screen.findByText("0");
    expect(strong.tagName).toBe("STRONG");
  });

  it("does not render lifetime total when the optional total fetch fails", async () => {
    mockApiGet.mockReset();
    mockApiGet.mockImplementation((url: string) => {
      if (url.endsWith("/total")) return Promise.reject(new Error("boom")) as never;
      if (url.endsWith("/usage")) return Promise.resolve({ items: [] }) as never;
      return Promise.reject(new Error("Not found")) as never;
    });

    renderPage("agent-no-total");

    await screen.findByText(/No services consumed yet/i);

    expect(screen.queryByText(/Lifetime total/i)).not.toBeInTheDocument();
  });
});
