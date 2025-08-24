import gleam/int
import lustre.{type App}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event

pub fn component() -> App(_, Model, Msg) {
  lustre.simple(init, update, view)
}

pub type Model =
  Int

fn init(_) -> Model {
  0
}

pub opaque type Msg {
  Inc
  Dec
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    Inc -> model + 1
    Dec -> model - 1
  }
}

fn view(model: Model) -> Element(Msg) {
  let count = int.to_string(model)
  let styles = [
    #("display", "flex"),
    #("justify-content", "space-between"),
    #("align-items", "center"),
    #("max-width", "400px"),
    #("margin", "0 auto"),
    #("padding", "20px"),
    #("border", "1px solid #ccc"),
    #("border-radius", "8px"),
    #("font-family", "Arial, sans-serif")
  ]

  let button_styles = [
    #("padding", "10px 20px"),
    #("font-size", "18px"),
    #("border", "1px solid #007cba"),
    #("border-radius", "4px"),
    #("background-color", "#007cba"),
    #("color", "white"),
    #("cursor", "pointer")
  ]

  let count_styles = [
    #("font-size", "24px"),
    #("font-weight", "bold"),
    #("margin", "0 20px")
  ]

  element.fragment([
    html.h1([attribute.styles([#("text-align", "center")])], [html.text("Lustre Server Component Counter")]),
    html.div([attribute.styles(styles)], [
      view_button(label: "-", on_click: Dec, styles: button_styles),
      html.p([attribute.styles(count_styles)], [html.text("Count: "), html.text(count)]),
      view_button(label: "+", on_click: Inc, styles: button_styles),
    ]),
  ])
}

fn view_button(
  label label: String,
  on_click handle_click: msg,
  styles styles: List(#(String, String))
) -> Element(msg) {
  html.button([
    event.on_click(handle_click),
    attribute.styles(styles)
  ], [html.text(label)])
}
