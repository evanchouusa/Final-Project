Interacting with each endpoint of our API examples:

1. For the app.post("/api/:newroom", postNewRoom) to create a new room, the example request would be done with the command curl -H "content-type: application/json" -d "{\"YoutubeURL\": \"https://youtu.be/lJlEQim-yMo\" }" localhost:3000/api/newroom. Using this command would return a result of {"roomID":"1","YoutubeURL":["https://youtu.be/lJlEQim-yMo"]} if done properly in terminal.

2. For the app.post("/api/:roomID", postYoutubeURL) to add a new Youtube URL to an already created room queue with a specific roomID, the example request would be done with the command curl -H "content-type: application/json" -d "{\"YoutubeURL\": \"https://youtu.be/P2wtyrjG3oU\" }" localhost:3000/api/1. In this case, we are using roomID 1. Using this command would return a result of {"YoutubeURL":"https://youtu.be/P2wtyrjG3oU"} if done properly in terminal.

3. For app.get("/stats/:roomID", getYoutubeURL) to get the youtube URL(s) in a specific room, the example request would be done with the command curl localhost:3000/stats/1. In this case, we are getting the Youtube URL in the room with roomID 1. Using this command would return a result of {"YoutubeURL":"https://youtu.be/lJlEQim-yMo,https://youtu.be/P2wtyrjG3oU} if done properly in terminal.
