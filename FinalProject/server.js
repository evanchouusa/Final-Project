// require() is used to load and cached Javascript modules. It is similar to C language's #include. It basically reads a Javascript file, executes the file, and then returns the object.
const express = require('express')
const fs = require('fs/promises')

const getYoutubeURL = (req, res) => {
    const roomID = req.params.roomID;
    const allRooms = res.app.locals.reactions;

    const room = allRooms.filter(element => element.roomID === roomID)[0];

    const obj = { YoutubeURL: `${room.YoutubeURL}` };

    if (res.statusCode >= 400) //above 400 means that there is an error
        res.status(res.statusCode).send(`${res.statusCode} ERROR`); //return error
    else {
        // res.writeHead(200, { 'Content-Type': "application/json" }); //200 menas success, so we'll write in specific gif under a certain mood
        // res.end(`{"allurl": "${currentVideo}"}`);
        res.status(201).json(obj);
    }
};

//function for posting specific room
//for create a room
const postNewRoom = (req, res) => {
    const allRooms = res.app.locals.reactions;
    const newURL = req.body.YoutubeURL;
    const newID = allRooms.length + 1;

    const obj = { roomID: `${newID}`, YoutubeURL: [`${newURL}`] };

    allRooms.push(obj);
    console.log(allRooms)

    res.status(201).json(obj);
    fs.writeFile("./server.json", JSON.stringify(allRooms));
};

//function for posting specific Youtube URL link
//for playvideos 
const postYoutubeURL = (req, res) => {
    const roomID = req.params.roomID;
    const newURL = req.body.YoutubeURL;
    const allRooms = res.app.locals.reactions;

    if (roomID === undefined || newURL.length == 0) { //checking for errors
        res.status(400).send(`Your Youtube (${roomID}) does not exist`);
    } else {
        allRooms.find(element => {
            if (element.roomID === roomID)
                element.YoutubeURL.push(newURL);
        });

        console.log(allRooms)

        res.status(201).send(req.body);
        fs.writeFile("./server.json", JSON.stringify(allRooms)); //write in YoutubeURL
    }
};

const main = () => {
    const app = express();
    const port = 3000;

    // This line adds/uses express.json in every middleware layer.
    app.use(express.json());

    // express.static lets you serve static files back to people/users
    // we're serving files from the "static" directory on our file system
    // to be a little bit more clear, this is actually apath
    app.use(express.static("./static"));

    app.get("/room/:roomID", getYoutubeURL);

    app.post("/api/newroom", postNewRoom);

    app.post("/api/:roomID", postYoutubeURL);

    fs.readFile("./server.json", "utf-8")
        .then((fileContents) => JSON.parse(fileContents))
        .then((data) => {
            // Access local data. Local objects have the property of being local variables within the application.
            app.locals.reactions = data;

            // This prints out which todo it starts on. Specifically, app.listen is used to bind and listen the connections on the specified host and port.  
            app.listen(port, () => {
                console.log(`YoutubeURL started on http://localhost:${port}`);
            });
        });
};

main();