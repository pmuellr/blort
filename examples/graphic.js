import { createModule  } from "../blort-cdn.js";

// create a new module
const module = createModule()

// add some text
module.addVariable(function text(md) {
  return md`
# graphic.html

Move the slider to change the radius of the circles.
`
})

// creates variable `radius` and adds the following view to change the value
module.addViewOf(function radius(html) {
  return html`<input type=range min=1 max=300 step=1 value=40>`
})

// returns an SVG image of three filled circles
module.addVariable(function graphic(html, radius) {
  return html`
    <svg width=400 height=400>
      <circle cx=190 cy=190 r=${radius} fill=green style="opacity: 0.25;" /> 
      <circle cx=200 cy=200 r=${radius} fill=red   style="opacity: 0.25;" />  
      <circle cx=210 cy=210 r=${radius} fill=blue  style="opacity: 0.25;" /> 
    </svg>
  `
})
