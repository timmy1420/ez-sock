# EZ-Sock

**EZ-Sock** is an easy-to-use library for implementing WebSocket functionality with `socket.io`. It provides basic WebSocket features like client connections, disconnections, and custom event handling, making it simple to integrate real-time communication into your projects.

## Features
- **on_connect**: Detects when a client connects to a WebSocket channel.
- **on_disconnect**: Detects when a client disconnects from a WebSocket channel.
- **my_custom_event**: Sends custom events between clients over a WebSocket channel.

## Installation

To install the necessary dependencies, run:

```bash
npm install
```

# Usage Example

Below is a basic HTML example demonstrating how to connect, disconnect, and emit events to a WebSocket server.

## HTML Client Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <button onclick="disconnect()">DISCONNECT</button>
    <button onclick="connect()">CONNECT</button>
    <button onclick="client_emit()">CLIENT EMIT</button>
    <ul id="events"></ul>

    <script src="socket.io.min.js"></script>
    <script>
        const $events = document.getElementById('events');
        const newItem = (content) => {
            const item = document.createElement('li');
            item.innerText = content;
            return item;
        };

        const socket = io.connect('http://localhost:3000'),
              channel = Math.random().toString(36).substr(2, 5),
              identifier = Math.random().toString(36).substr(2, 5);

        socket.on('connect', function() {
            $events.appendChild(newItem('connect: ' + channel));
            connect();
        });

        socket.on('on_connect', data => {
            $events.appendChild(newItem(`${data}`));
        });

        socket.on('on_disconnect', data => {
            $events.appendChild(newItem(`${data}`));
        });

        socket.on('my_custom_event', data => {
            $events.appendChild(newItem(`my_custom_event - ${data}`));
        });

        const disconnect = () => {
            socket.emit('leave_channel', channel);
        };

        const connect = () => {
            socket.emit('join_channel', channel, identifier);
        };

        const client_emit = () => {
            socket.emit('my_custom_event', channel, "I'm typing here");
        };
    </script>
</body>
</html>
```

## React Example

Here’s an example using React to handle WebSocket connections:

```js
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const WebSocketExample = () => {
  const [events, setEvents] = useState([]);
  const socket = io('http://localhost:3000');
  const channel = Math.random().toString(36).substr(2, 5);
  const identifier = Math.random().toString(36).substr(2, 5);

  useEffect(() => {
    socket.emit('join_channel', channel, identifier);

    socket.on('on_connect', (data) => {
      setEvents((prevEvents) => [...prevEvents, data]);
    });

    socket.on('on_disconnect', (data) => {
      setEvents((prevEvents) => [...prevEvents, data]);
    });

    socket.on('my_custom_event', (data) => {
      setEvents((prevEvents) => [...prevEvents, data]);
    });

    return () => {
      socket.emit('leave_channel', channel);
      socket.disconnect();
    };
  }, [channel, identifier, socket]);

  const handleClientEmit = () => {
    socket.emit('my_custom_event', channel, "I'm typing here");
  };

  return (
    <div>
      <button onClick={() => socket.disconnect()}>DISCONNECT</button>
      <button onClick={() => socket.connect()}>CONNECT</button>
      <button onClick={handleClientEmit}>CLIENT EMIT</button>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketExample;
```

## React Native Example
```javascript
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Button, View, Text, FlatList } from 'react-native';

const WebSocketExample = () => {
  const [events, setEvents] = useState([]);
  const socket = io('http://localhost:3000');
  const channel = Math.random().toString(36).substr(2, 5);
  const identifier = Math.random().toString(36).substr(2, 5);

  useEffect(() => {
    socket.emit('join_channel', channel, identifier);

    socket.on('on_connect', (data) => {
      setEvents((prevEvents) => [...prevEvents, data]);
    });

    socket.on('on_disconnect', (data) => {
      setEvents((prevEvents) => [...prevEvents, data]);
    });

    socket.on('my_custom_event', (data) => {
      setEvents((prevEvents) => [...prevEvents, data]);
    });

    return () => {
      socket.emit('leave_channel', channel);
      socket.disconnect();
    };
  }, [channel, identifier, socket]);

  const handleClientEmit = () => {
    socket.emit('my_custom_event', channel, "I'm typing here");
  };

  return (
    <View>
      <Button onPress={() => socket.disconnect()} title="DISCONNECT" />
      <Button onPress={() => socket.connect()} title="CONNECT" />
      <Button onPress={handleClientEmit} title="CLIENT EMIT" />
      <FlatList
        data={events}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
  );
};

export default WebSocketExample;
```

## Python Example

```python
import socketio

# standard Python
sio = socketio.Client()

channel = 'test_channel'

@sio.event
def connect():
    print('connection established')
    sio.emit('join_channel', channel)

@sio.event
def on_connect(data):
    print(f'Connected to {data}')

@sio.event
def on_disconnect(data):
    print(f'Disconnected from {data}')

@sio.event
def my_custom_event(data):
    print(f'Received custom event: {data}')

def start():
    sio.connect('http://localhost:3000')
    sio.emit('my_custom_event', {'message': 'Hello from Python!'})
    sio.wait()

if __name__ == '__main__':
    start()
```

# Run backend
```bash
node src/index.js
```

# Contributing
There are no specific contribution guidelines at this time. Please follow standard coding principles. For questions or issues, reach out via GitHub.

# Contact
For questions or suggestions, please contact me via <a href="https://github.com/timmy1420">Github</a>.