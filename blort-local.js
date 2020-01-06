import { Runtime, Inspector } from "./node_modules/@observablehq/runtime/dist/runtime.js";
import { createModule as createModuleBase } from "./blort.js"

export function createModule(params) {
  return createModuleBase({ Runtime, Inspector }, params)
}
