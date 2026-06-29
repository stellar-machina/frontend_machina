import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { apiPost } from "@/lib/apiClient";
import NewServicePage from "./page";

// Mock the API client
jest.mock("@/lib/apiClient", () => ({
  apiPost: jest.fn(),
}));

// Mock the Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

const apiPostMock = apiPost as jest.MockedFunction<typeof apiPost>;

describe("NewServicePage", () => {
  beforeEach(() => {
    apiPostMock.mockReset();
    mockPush.mockReset();
  });

  it("renders the form components successfully", () => {
    render(<NewServicePage />);

    expect(screen.getByRole("heading", { name: /new service/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Service ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Price (stroops / request)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register service/i })).toBeInTheDocument();
  });

  it("marks Service ID as required and limits its length", () => {
    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    expect(serviceIdInput).toBeRequired();
    expect(serviceIdInput).toHaveAttribute("maxLength", "128");
  });

  it("marks Price as required and numeric", () => {
    render(<NewServicePage />);

    const priceInput = screen.getByLabelText("Price (stroops / request)");
    expect(priceInput).toBeRequired();
    expect(priceInput).toHaveAttribute("inputMode", "numeric");
  });

  it("shows validation error on negative price", async () => {
    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    const priceInput = screen.getByLabelText("Price (stroops / request)");

    fireEvent.change(serviceIdInput, { target: { value: "test-service" } });
    fireEvent.change(priceInput, { target: { value: "-5" } });

    fireEvent.submit(screen.getByRole("button", { name: /register service/i }));

    expect(apiPostMock).not.toHaveBeenCalled();

    // Verify error attaches to the price field
    expect(priceInput).toHaveAttribute("aria-invalid", "true");
    const descId = priceInput.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();

    const errorElement = document.getElementById(descId!);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("Price must be a non-negative integer.");

    // The page-level alert should not be displayed
    expect(screen.queryByRole("alert", { name: /Price must be/i })).toBeNull();
  });

  it("shows validation error on decimal price", async () => {
    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    const priceInput = screen.getByLabelText("Price (stroops / request)");

    fireEvent.change(serviceIdInput, { target: { value: "test-service" } });
    fireEvent.change(priceInput, { target: { value: "12.34" } });

    fireEvent.submit(screen.getByRole("button", { name: /register service/i }));

    expect(apiPostMock).not.toHaveBeenCalled();

    // Verify error attaches to the price field
    expect(priceInput).toHaveAttribute("aria-invalid", "true");
    const descId = priceInput.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();

    const errorElement = document.getElementById(descId!);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("Price must be a non-negative integer.");
  });

  it("shows validation error on empty price", async () => {
    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    const priceInput = screen.getByLabelText("Price (stroops / request)");

    fireEvent.change(serviceIdInput, { target: { value: "test-service" } });
    fireEvent.change(priceInput, { target: { value: "   " } });

    fireEvent.submit(screen.getByRole("button", { name: /register service/i }));

    expect(apiPostMock).not.toHaveBeenCalled();

    // Verify error attaches to the price field
    expect(priceInput).toHaveAttribute("aria-invalid", "true");
    const descId = priceInput.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();

    const errorElement = document.getElementById(descId!);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent("Price must be a non-negative integer.");
  });

  it("submits the form successfully with valid inputs and redirects", async () => {
    apiPostMock.mockResolvedValueOnce({} as never);

    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    const priceInput = screen.getByLabelText("Price (stroops / request)");

    fireEvent.change(serviceIdInput, { target: { value: "test-service" } });
    fireEvent.change(priceInput, { target: { value: "100" } });

    fireEvent.submit(screen.getByRole("button", { name: /register service/i }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith("/api/v1/services", {
        serviceId: "test-service",
        priceStroops: 100,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/services");
    });
  });

  it("displays backend error (invalid_request) in a page-level alert", async () => {
    apiPostMock.mockRejectedValueOnce(new Error("invalid_request: Service ID already exists"));

    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    const priceInput = screen.getByLabelText("Price (stroops / request)");

    fireEvent.change(serviceIdInput, { target: { value: "existing-service" } });
    fireEvent.change(priceInput, { target: { value: "50" } });

    fireEvent.submit(screen.getByRole("button", { name: /register service/i }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith("/api/v1/services", {
        serviceId: "existing-service",
        priceStroops: 50,
      });
    });

    // Check page-level alert
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveClass("text-rose-600");
    expect(alert).toHaveTextContent("invalid_request: Service ID already exists");
  });

  it("disables the submit button and displays Saving... while submitting", async () => {
    let resolvePost: (value: unknown) => void = () => {};
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    apiPostMock.mockReturnValueOnce(postPromise as never);

    render(<NewServicePage />);

    const serviceIdInput = screen.getByLabelText("Service ID");
    const priceInput = screen.getByLabelText("Price (stroops / request)");
    const submitButton = screen.getByRole("button", { name: /register service/i });

    fireEvent.change(serviceIdInput, { target: { value: "test-service" } });
    fireEvent.change(priceInput, { target: { value: "10" } });

    fireEvent.submit(submitButton);

    // Button should show loading state immediately
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Saving…");

    // Resolve post request
    resolvePost({});

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/services");
    });
  });
});
