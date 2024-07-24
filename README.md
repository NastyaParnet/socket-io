# Task for Socket.io theme
Please, create server part of chat application that uses Socket.io

Users should communicate in the room named "chat".
Server should handle the next events:
 - "connection" - event listeners to the newly created connection should be added here
 - "join" - is called when user jouns the chat. Receives string name payload - name of joined user.
 - "chat message" - is called when message from user is sent to the wohole chat. Payload - string message.
 - "personal message" - is called when message from user to the specific another user. Payload - object of the next structure: 
 ``` 
  {  
    to: // name of user that has to receive the message  
    message: ...  
  }
  ``` 
 - "disconnect"

Server should emit the next events to the client(s):
 - "name taken" - to current socket connection if chosen name is empty or belongs already to another user (in "join" handler)
 - "user joined" - to all socket connections in the "chat" room when user joins to the "chat" room
 - "user left" - to all socket connections in the "chat" room when user disconnects, with payload - name of disconnected user
 - "user list" - to all socket connections in the "chat" room when user joins to the "chat" room with payload - array of user names (strings).
 - "chat message" - to all socket connections in the "chat" room except sender. Should be emitted in "chat message" handler. Should send a payload of the next structure:
 ```
  {
    name: // sender name,
    message: ...,
  }
  ```
 - "personal message" to socket connection that corresponds to the name of receiver. Should be emitted in "personal message" handler. Should send a payload of the next structure:
 ```
  {
    name: // sender name,
    message: ...,
  }
  ```

Please, refer to client/src/chat.js if you need more information regarding events that client handles and emits.  
To connect client application  with your server you need to provide its url in client/.env file. Read client/README.md for more details.
  
Demonstration of working application:
<img src="readme-files/socket.io demo.gif">