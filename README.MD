# SignalR Client Example v0.0.1

- **Client** example for **ASP.NET Core** `SignalR` | ***(.NET 6)***

## Hub Connection Builder

```js

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5098/myhub")
    // Automatic Reconnect => There is a connection, but it is used in cases where it is broken
    .withAutomaticReconnect([1000, 1000, 2000, 3000, 5000, 10000]) // Automatic reconnect times in order in ms
    // Default 0s. - 2s. - 10s. - 30s.
    .build();

```

### Automatic Reconnect

- There is a `connection`, but it is used in cases where it is `broken`

```js

.withAutomaticReconnect([1000, 1000, 2000, 3000, 5000, 10000]) // Automatic reconnect times in order in ms

```

- This function is used in cases where the `connection could not be established` **before**.

```js

async function start() {
    try {
        await connection.start();
    } catch (error) {
        setTimeout(() => start(), 2000);
    }
}

```

- `onreconnecting:` Event `fired`/`triggered` before starting `reconnect attempts`.
- `onreconnected:` It is the function that is `triggered` when the `reconnection occurs`.
- `onclose:` Thrown when `reconnection attempts` **`fail`**.
