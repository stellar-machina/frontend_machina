import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "../SearchBar";

const searchInput = (name: string | RegExp = "Search") =>
  screen.getByRole("searchbox", { name }) as HTMLInputElement;

describe("SearchBar", () => {
  it("uses Search as the default accessible name", () => {
    render(<SearchBar value="" onChange={jest.fn()} />);

    expect(searchInput()).toBeInTheDocument();
  });

  it("uses the custom label as the accessible name", () => {
    render(
      <SearchBar
        value=""
        onChange={jest.fn()}
        label="Search services"
        placeholder="Search services..."
      />
    );

    expect(searchInput("Search services")).toHaveAttribute(
      "placeholder",
      "Search services..."
    );
  });

  it("calls onChange with the next value when typing", () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} label="Filter endpoints" />);

    fireEvent.change(searchInput("Filter endpoints"), {
      target: { value: "usage" },
    });

    expect(onChange).toHaveBeenCalledWith("usage");
  });

  it("preserves type=search and passes through input attributes", () => {
    render(
      <SearchBar
        value=""
        onChange={jest.fn()}
        label="Search services"
        name="service-search"
        autoComplete="off"
      />
    );

    const input = searchInput("Search services");
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("name", "service-search");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("does not show the clear button for an empty value", () => {
    render(<SearchBar value="" onChange={jest.fn()} clearable />);

    expect(
      screen.queryByRole("button", { name: "Clear search" })
    ).not.toBeInTheDocument();
  });

  it("shows a keyboard-operable clear button for a non-empty value", () => {
    render(<SearchBar value="agent" onChange={jest.fn()} clearable />);

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    expect(clearButton).toHaveAttribute("type", "button");
  });

  it("clears the value and returns focus to the input", () => {
    const onChange = jest.fn();
    render(
      <SearchBar
        value="agent"
        onChange={onChange}
        label="Search services"
        clearable
      />
    );

    const input = searchInput("Search services");
    screen.getByRole("button", { name: "Clear search" }).focus();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("");
    expect(input).toHaveFocus();
  });
});
