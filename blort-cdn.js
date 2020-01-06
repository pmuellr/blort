import { Runtime, Inspector } from 'https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js';
import { createModule as createModuleBase } from "./blort.js"

export function createModule(params) {
  return createModuleBase({ Runtime, Inspector}, params)
}
