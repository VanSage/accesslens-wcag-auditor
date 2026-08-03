import { test, expect } from "@playwright/test";

test("loads sample page, runs an audit, and renders scored results", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /see what your users can't/i })
  ).toBeVisible();

  await page.getByRole("button", { name: /load sample page/i }).click();
  await expect(page.getByLabel(/html to audit/i)).toContainText(
    "Rivermead Cafe"
  );

  await page.getByRole("button", { name: /run audit/i }).click();

  // The sandboxed audit posts results back asynchronously.
  await expect(
    page.getByRole("img", { name: /accessibility score/i })
  ).toBeVisible({ timeout: 15_000 });

  // The seeded sample page has known issues (missing alts, low contrast,
  // unlabeled form fields) — violations should render, not a clean pass.
  await expect(page.getByText(/elements? affected/i).first()).toBeVisible();

  await expect(
    page.getByText(/draft alt text/i)
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: /download report/i })
  ).toBeVisible();
});
