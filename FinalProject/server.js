// require() is used to load and cached Javascript modules. It is similar to C language's #include. It basically reads a Javascript file, executes the file, and then returns the object.
const express = require('express')
const fs = require('fs/promises')

//This is where we get the YoutubeURL or link and specifically filter out the specific room
const getYoutubeURL = (req, res) => {
    const roomID = req.params.roomID;
    const allRooms = res.app.locals.reactions;

    const room = allRooms.filter(element => element.roomID === roomID)[0];

    const obj = { YoutubeURL: `${room.YoutubeURL}` };

    if (res.statusCode >= 400) //above 400 means that there is an error
        res.status(res.statusCode).send(`${res.statusCode} ERROR`); //return error
    else {
        res.status(201).json(obj); //201 means success
    }
};

//function for posting specific room
//This is for create a room
const postNewRoom = (req, res) => {
    console.log("Posting New Room");
    const allRooms = res.app.locals.reactions;
    const newURL = req.body.YoutubeURL;
    console.log(newURL);
    const newID = allRooms.length + 1;

    const obj = { roomID: `${newID}`, YoutubeURL: [`${newURL}`] };

    //pushing obj into room
    allRooms.push(obj);
    console.log(allRooms);

    res.status(201).json(obj); //201 means success, so we write the file in
    fs.writeFile("./server.json", JSON.stringify(allRooms));
};

//function for posting specific Youtube URL link
//This is for playvideos 
const postYoutubeURL = (req, res) => {
    const roomID = req.params.roomID;
    const newURL = req.body.YoutubeURL;
    const allRooms = res.app.locals.reactions;

    if (roomID === undefined || newURL.length == 0) { //checking for errors, if there is no room or if there is not a url, then it will return an error
        res.status(400).send(`Your Youtube (${roomID}) does not exist`);
    } else { //else we post youtube video in that room
        allRooms.find(element => {
            if (element.roomID === roomID)
                element.YoutubeURL.push(newURL);
        });

        console.log(allRooms)

        res.status(201).send(req.body); //201 means success, so we write the file in
        fs.writeFile("./server.json", JSON.stringify(allRooms)); //write in YoutubeURL
    }
};

const main = () => {
    const app = express();
    //using port 3000, so main page would be http://localhost:3000/index.html
    //Note that need to run node server.js on terminal first or open server in order for page to load
    const port = 3000;

    //This line adds/uses express.json in every middleware layer.
    app.use(express.json());

    //express.static lets you serve static files back to people/users
    //we're serving files from the "static" directory on our file system
    //to be a little bit more clear, this is actually a path
    app.use(express.static("./static"));

    //get Youtube URL
    //curl localhost:3000/stats/1
    //result: {"YoutubeURL":"https://youtu.be/lJlEQim-yMo,https://youtu.be/P2wtyrjG3oU}
    app.get("/stats/:roomID", getYoutubeURL);

    //creating new room
    //curl -H "content-type: application/json" -d "{\"YoutubeURL\": \"https://youtu.be/lJlEQim-yMo\" }" localhost:3000/api/newroom
    //result: {"roomID":"1","YoutubeURL":["https://youtu.be/lJlEQim-yMo"]}
    app.post("/api/newroom", postNewRoom);

    //add new Youtube URL to already created room with roomID
    //curl -H "content-type: application/json" -d "{\"YoutubeURL\": \"https://youtu.be/P2wtyrjG3oU\" }" localhost:3000/api/1
    //result: {"YoutubeURL":"https://youtu.be/P2wtyrjG3oU"}
    app.post("/api/:roomID", postYoutubeURL);

    fs.readFile("./server.json", "utf-8")
        .then((fileContents) => JSON.parse(fileContents))
        .then((data) => {
            //Access local data. Local objects have the property of being local variables within the application.
            app.locals.reactions = data;

            //This prints out which youtubeurl it starts on. Specifically, app.listen is used to bind and listen the connections on the specified host and port.  
            app.listen(port, () => {
                console.log(`YoutubeURL started on http://localhost:${port}`);
            });
        });
};

main();