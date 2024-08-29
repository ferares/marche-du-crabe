import { describe, expect, test, vi } from "vitest"
import { axe } from "vitest-axe"
import { render } from "@testing-library/react"
import { nextIntlWrapper } from "@/test-utils"

import Alert from "./Alert"

function setup() {
  return render(<Alert removeAlert={vi.fn} type="info">Test!</Alert>, { wrapper: nextIntlWrapper() })
}

describe("Alert", () => {
  test("passes basic accessibility tests", async () => {
    const { container } = setup()
		const results = await axe(container)
		expect(results).toHaveNoViolations()
  })
})