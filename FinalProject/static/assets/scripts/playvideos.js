const mainElement = document.getElementsByTagName("main")[0];
const inputElement = document.querySelector("input");

let myList = [];
let player;
let previousIndex = 0;

//Using function to load the youtube list and calling functions to see if player is ready or if there is a state of change
function onYouTubeIframeAPIReady() {

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        loadPlaylist: {
            listType: 'playlist',
            list: myList,
            index: parseInt(0),
            suggestedQuality: 'small'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

//The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.loadPlaylist(myList);
    event.target.playVideo();

}

//The API calls this function when the player's state changes.
//The function indicates that when playing a video (state=1),
var done = false;

function onPlayerStateChange(event) {
    console.log("getCurrentTime :" + event.target.getCurrentTime());

    if (event.data == YT.PlayerState.ENDED) {
        let index = player.getPlaylistIndex();

        if (player.getPlaylist().length != myList.length) {

            //update playlist and start playing at the proper index
            player.loadPlaylist(myList, previousIndex + 1);
        }

        /*
        keep track of the last index we got
        if videos are added while the last playlist item is playing,
        the next index will be zero and skip the new videos
        to make sure we play the proper video, we used "previousIndex + 1"
        */
        previousIndex = index;
    }
    event.target.setPlaybackRate(1);
}

//stopping video
function stopVideo() {
    player.stopVideo();
}

//converting list to data
const convertListToElement = (data) => {
    const template = document.getElementById("url-template");
    const clone = template.content.cloneNode(true);

    clone.querySelector("#url").textContent = data;
    return clone;
};

//add YoutubeURL link to existed queue in specific room
function addList(element) {
    let idIndex = element.lastIndexOf('/') + 1; //we are basically taking a look at the id code after the / in the youtube url and changing it to play the next youtube url
    if (element.lastIndexOf('=') + 1 > idIndex)
        idIndex = element.lastIndexOf('=') + 1;

    if (myList.length == 0)
        myList.push(element.substring(idIndex));
    else if (myList.find(ele => ele === element.substring(idIndex)) === undefined)
        myList.push(element.substring(idIndex));

}

function fetchStats(myRoom) {
    //This promise will resolve when the network call succeeds
    //Using a fetch here to append Youtube URL onto queue
    var dataPromise = fetch(`/stats/${myRoom}`)
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data) => {
            const listElement = document.querySelector("ul");
            while (listElement.childNodes.length > 2) {
                listElement.removeChild(listElement.lastChild);
            }
            data.YoutubeURL.split(',').forEach((element) => addList(element)); //have to use split to split string into array in order to append
            data.YoutubeURL.split(',')
                .map(convertListToElement)
                .forEach((element) => listElement.appendChild(element));
        })

    //This promise will resolve when 10 seconds have passed
    //The reason why we have this here is to keep everything in sync. So let's say the host adds a youtube url onto the queue... 
    //...The people that joined the specific room will see that specific added youtube url loaded in their queue. Same thing for when they add a video to the specific room...
    //...Everyone's queue list will be updated every 10 seconds. This will keep everyone's pages in sync, so they can all view the Youtube URLs.
    var timeOutPromise = new Promise(function(resolve, reject) {
        // 30 Second delay
        setTimeout(resolve, 30000, 'Timeout Done');
    });

    Promise.all(
        [dataPromise, timeOutPromise]).then(function(values) {
        //Repeat
        fetchStats(myRoom);
    });
}

window.onload = () => {

    const urlParams = new URLSearchParams(window.location.search);
    const myRoom = urlParams.get('room');

    //This is if there is a room
    if (!isNaN(myRoom) && myRoom != null) {
        fetchStats(myRoom);

        //for the add button to work on playvideos page
        document.getElementById("add").addEventListener("click", (event) => {
            const headers = new Headers();
            headers.set("content-type", "application/json");

            //this is to check if youtube url is inputed to add to queue. If not, will return error.
            if (document.getElementById("youtubeurl").value === "") {
                alert("youtube url is required");
            } else {
                const newURL = document.getElementById("youtubeurl").value;

                //fetching the room and posting youtube url into server for already created room
                //we've done this before for the todo list assignment, so this part is self explanatory
                fetch(`/api/${myRoom}`, {
                        headers,
                        method: "POST",
                        body: JSON.stringify({
                            YoutubeURL: `${newURL}`,
                        }),
                    })
                    .then((response) => {
                        return response.ok && response.status === 201 ?
                            response.json() :
                            Promise.reject(response.status);
                    })
                    .then((data) => {
                        inputElement.classList.remove("error");
                        inputElement.value = "";
                        const listElement = document.querySelector("ul");
                        listElement.append(convertListToElement(`${newURL}`));
                        addList(data.YoutubeURL);
                    })
                    .catch((status) => {
                        console.log(status);
                        const listElement = document.querySelector("ul");
                        const newItem = { YoutubeURL: `${newURL}` };
                        listElement.append(convertListToElement(newItem.YoutubeURL));
                        inputElement.classList.add("error");
                    });
            }
        });

        //This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        //uses youtube api script
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        //This function creates an <iframe> (and YouTube player)
        //after the API code downloads
        var player;

    }
}