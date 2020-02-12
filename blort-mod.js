//@ts-ignore
import { Runtime, Inspector } from 'https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js'

function defaultObserver(name) {
  const el = document.querySelector(`#blort-var-${name}`)
  if (el == null) return

  return new Inspector(el)
}

export async function createModuleFromClass(cls, options) {
  let { runtime, observer } = options || {}
  runtime = runtime || new Runtime()
  observer = observer || defaultObserver

  const blMod = new Module({ runtime, observer })

  const object = new cls()
  const vars = Object.getOwnPropertyNames(Object.getPrototypeOf(object))
    .filter(name => name != 'constructor')

  for (const varName of vars) {
    const varValue = object[varName]
    const [ type, name ] = getTypeNameFromName(varName)

    switch(type) {
      case 'Variable': blMod.addVariable(name, varValue); break
      case 'View': blMod.addViewOf(name, varValue); break
      case 'Mutable': blMod.addMutable(name, varValue); break
      default: throw new Error(`unexpected export type ${type}`)
    }
  }

  return blMod
}

class Module {
  constructor ({ runtime, observer }) {
    this._runtime = runtime
    this._observer = observer
    this._module = runtime.module(() => {}, observer)
  }

  addVariable (name, fn) {
    const params = getFnParams(fn)
    const variable = this._module.variable(this._observer(name))
    variable.define(name, params, fn)

    return variable
  }

  addViewOf (name, fn) {
    const viewName = `${name}View`
    const params = getFnParams(fn)

    const variable = this._module.variable(this._observer(name))
    const viewVariable = this._module.variable(this._observer(viewName))

    viewVariable.define(viewName, params, fn)
    variable.define(
      name, 
      [ 'Generators', viewName ], 
      (Generators, viewVariable) => Generators.input(viewVariable)
    )
  }

  addMutable (name, initialValue) {
    const mutableName = `${name}Mutable`

    const variable = this._module.variable(this._observer(name))
    const mutableVariable = this._module.variable(this._observer(mutableName))

    mutableVariable.define(
      mutableName,
      [ 'Mutable' ],
      Mutable => new Mutable(initialValue)
    )

    variable.define(
      name, 
      [ mutableName ],
      mutable => mutable.generator
    )
  }
}

function getTypeNameFromName(name) {
  let match

  match = name.match(/^(.*)View$/)
  if (match) return ['View', match[1]]

  match = name.match(/^(.*)Mutable$/)
  if (match) return ['Mutable', match[1]]

  return ['Variable', name]
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

const ModuleCache = new Map()

async function importModule(url) {
  if (ModuleCache.has(url)) return ModuleCache.get(url)

  const mod = await import(url)
  ModuleCache.set(url, mod)
  return mod
}