import counter
import gleam/json
import lustre
import lustre/server_component

@external(javascript, "../../../../main.js", "sendToClient")
fn send_to_client(id: String, message: String) -> Nil

pub type CounterSocket {
  CounterSocket(
    id: String,
    component: lustre.Runtime(counter.Msg),
  )
}

pub fn init_counter_socket(id: String) -> CounterSocket {
  let counter_app = counter.component()
  let assert Ok(component) = lustre.start_server_component(counter_app, Nil)

  let callback = fn(client_message) {
    client_message
    |> server_component.client_message_to_json
    |> json.to_string
    |> send_to_client(id, _)
  }

  server_component.register_callback(callback)
  |> lustre.send(to: component)

  CounterSocket(id:, component: component)
}

pub fn handle_websocket_message(socket: CounterSocket, message: String) -> CounterSocket {
  case json.parse(message, server_component.runtime_message_decoder()) {
    Ok(runtime_message) -> {
      lustre.send(socket.component, runtime_message)
      socket
    }

    Error(_) -> {
      socket
    }
  }
}
