import { Runtime, Inspector } from "./node_modules/@observablehq/runtime/dist/runtime.js";

const defaultRuntime = new Runtime()
const defaultObserver = Inspector.into(document.body)

export function createModule(params) {
  params = Object.assign({}, params, {
    runtime: new Runtime(),
    observer: Inspector.into(document.body),
  })
  const { runtime, observer } = params
  return new Module({ runtime, observer })
}

class Module {
  constructor ({ runtime, observer}) {
    this._runtime = runtime || defaultRuntime
    this._observer = observer || defaultObserver
    this._module = runtime.module(observer)
  }

  addVariable (fn) {
    const fnName = fn.name
    const params = getFnParams(fn)
    const variable = this._module.variable(this._observer(fnName))
    variable.define(fnName, params, fn)

    return variable
  }

  addViewOf (fn) {
    const fnName = fn.name
    const viewName = `viewof ${fnName}`
    const params = getFnParams(fn)
    const viewVariable = this._module.variable(this._observer(viewName))
    viewVariable.define(viewName, params, fn)

    const fnVariable = this._module.variable(this._observer(fnName))

    fnVariable.define(fnName, ['Generators', viewName], (Generators, viewVariable) => 
      Generators.input(viewVariable)
    )
  }
}

function getFnParams (fn) {
  const fnString = `${fn}`.replace(/\n/g, ' ')
  const params = fnString
    .match(/.*?\((.*?)\)/)[1]
    .split(/,/g)
    .map(param => param.trim())

  if (params.length === 1 && params[0] === '') {
    return []
  }
  return params
}
