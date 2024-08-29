import { expect } from "vitest"

import * as matchers from "vitest-axe/matchers"

import "vitest-canvas-mock"

// This is to keep the linter happy
declare module "vitest" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export interface Assertion extends matchers.AxeMatchers {}
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export interface AsymmetricMatchersContaining extends matchers.AxeMatchers {}
}

expect.extend(matchers)