// IMPORTS ---------------------------------------------------------------------

import counter
import gleam/json
import lustre
import lustre/attribute
import lustre/element
import lustre/element/html.{html}
import lustre/server_component

// MAIN ------------------------------------------------------------------------

// EXTERNAL JAVASCRIPT INTERFACE ----------------------------------------------

@external(javascript, "../../../../main.js", "sendToClient")
fn send_to_client(message: String) -> Nil

// RUNTIME SERVING -------------------------------------------------------------

/// Path to the Lustre client runtime JavaScript
pub fn get_runtime_path() -> String {
  // In a real application, you'd serve this from node_modules or a static directory
  // For now, we'll assume it's available at this path
  "/node_modules/lustre/priv/static/lustre-server-component.mjs"
}

// WEBSOCKET HANDLING ----------------------------------------------------------

/// State for our WebSocket connection
pub type CounterSocket {
  CounterSocket(
    component: lustre.Runtime(counter.Msg),
    registered: Bool
  )
}

/// Initialize a new counter component for a WebSocket connection
pub fn init_counter_socket() -> CounterSocket {
  echo "BEGIN `init_counter_socket`"
  let counter_app = counter.component()
  echo "SUCCEEDED `counter.component()`"
  echo counter_app
  let assert Ok(component) = lustre.start_server_component(counter_app, Nil)
  echo "SUCCEEDED `lustre.start_server_component`"

  // Register callback to handle messages from the server component runtime
  let callback = fn(client_message) {
    echo "CALLBACK ENTERED"
    client_message
    |> server_component.client_message_to_json
    |> json.to_string
    |> send_to_client
  }
  echo "BUILT CALLBACK"

  let result = server_component.register_callback(callback)
  echo "REGISTERED CALLBACK"
  echo result

  result
  |> lustre.send(to: component)
  echo "SENT TO COMPONENT"

  CounterSocket(component: component, registered: True)
}

/// Handle incoming WebSocket messages
pub fn handle_websocket_message(socket: CounterSocket, message: String) -> CounterSocket {
  case json.parse(message, server_component.runtime_message_decoder()) {
    Ok(runtime_message) -> {
      echo "RUNTIME MESSAGE PARSED IN `handle_websocket_message`"
      echo runtime_message
      lustre.send(socket.component, runtime_message)
      socket
    }
    Error(_) -> {
      // Invalid message, ignore
      socket
    }
  }
}

/// Cleanup when WebSocket connection closes
pub fn close_counter_socket(socket: CounterSocket) -> Nil {
  case socket.registered {
    True -> {
      // Note: We would need to deregister the callback here, but since we can't
      // store the exact callback function reference, we'll rely on the component
      // cleanup when the runtime stops
      Nil
    }
    False -> Nil
  }
}
