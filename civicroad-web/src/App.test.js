import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the CivicRoad login screen", async () => {
  render(<App />);

  expect(
    await screen.findByText(/municipality dashboard/i)
  ).toBeInTheDocument();
});
