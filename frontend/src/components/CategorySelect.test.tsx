import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import CategorySelect from "./CategorySelect";

function Harness({
  initial = "",
  options = ["Groceries", "Bills", "Transport"],
  budgetCategories,
  onChange,
}: {
  initial?: string;
  options?: string[];
  budgetCategories?: string[];
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CategorySelect
        id="category"
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
        options={options}
        budgetCategories={budgetCategories}
        emptyLabel="Select a category"
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

const select = () => screen.getByLabelText("Category") as HTMLSelectElement;
const optionTexts = (el: HTMLElement) =>
  within(el).getAllByRole("option").map((o) => o.textContent);

describe("CategorySelect", () => {
  it("renders empty option, standard categories and Custom…", () => {
    render(<Harness />);

    expect(optionTexts(select())).toEqual([
      "Select a category",
      "Groceries",
      "Bills",
      "Transport",
      "Custom…",
    ]);
    expect(screen.getByRole("group", { name: "Categories" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Your budgets" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Custom category")).not.toBeInTheDocument();
  });

  it("lists budget categories first and removes them from the standard list", () => {
    render(<Harness budgetCategories={["bills", "Pets", " pets "]} />);

    const budgets = screen.getByRole("group", { name: "Your budgets" });
    const others = screen.getByRole("group", { name: "Other categories" });
    expect(optionTexts(budgets)).toEqual(["bills", "Pets"]);
    expect(optionTexts(others)).toEqual(["Groceries", "Transport"]);
  });

  it("calls onChange with the chosen category", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);

    await user.selectOptions(select(), "Bills");

    expect(onChange).toHaveBeenLastCalledWith("Bills");
    expect(select().value).toBe("Bills");
  });

  it("shows a text input in custom mode and passes typed text up", async () => {
    const user = userEvent.setup();
    render(<Harness initial="Bills" />);

    await user.selectOptions(select(), "Custom…");

    const input = screen.getByLabelText("Custom category");
    expect(input).toHaveValue("");
    expect(screen.getByTestId("value")).toHaveTextContent("");
    await user.type(input, "Pet food");
    expect(screen.getByTestId("value")).toHaveTextContent("Pet food");
    expect(select().value).toBe("__custom__");
  });

  it("leaves custom mode when a listed category is picked again", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.selectOptions(select(), "Custom…");
    expect(screen.getByLabelText("Custom category")).toBeInTheDocument();

    await user.selectOptions(select(), "Transport");

    expect(screen.queryByLabelText("Custom category")).not.toBeInTheDocument();
    expect(screen.getByTestId("value")).toHaveTextContent("Transport");
  });

  it("starts in custom mode when the value is not a listed option", () => {
    render(<Harness initial="Vet bills" />);

    expect(select().value).toBe("__custom__");
    expect(screen.getByLabelText("Custom category")).toHaveValue("Vet bills");
  });
});
