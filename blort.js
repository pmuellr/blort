import { Runtime, Inspector } from "./node_modules/@observablehq/runtime/dist/runtime.js";


export function createModule(params) {
  const defaultRuntime = new Runtime()
  const defaultObserver = name => {
    const el = document.querySelector(`#blort-var-${name}`)
    if (el == null) return

    return new Inspector(el)
  }

  params = Object.assign({}, params, {
    runtime: defaultRuntime,
    observer: defaultObserver,
  })
  const { runtime, observer } = params
  return new Module({ runtime, observer })
}

class Module {
  constructor ({ runtime, observer}) {
    this._runtime = runtime
    this._observer = observer
    this._module = runtime.module(() => {}, observer)
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
    const viewName = `${fnName}View`
    const params = getFnParams(fn)
    const viewVariable = this._module.variable(this._observer(viewName))
    viewVariable.define(viewName, params, fn)

    const fnVariable = this._module.variable(this._observer(fnName))

    fnVariable.define(fnName, ['Generators', viewName], (Generators, viewVariable) => 
      Generators.input(viewVariable)
    )
  }

  addMutable (name, initialValue) {
    const mutableName = `${name}Mutable`

    const mutableVariable = this._module.variable(this._observer(mutableName))
    mutableVariable.define(
      mutableName,
      ['Mutable'],
      Mutable => new Mutable(initialValue)
    )

    const fnVariable = this._module.variable(this._observer(name))
    fnVariable.define(
      name, 
      [mutableName],
      mutable => mutable.generator
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
