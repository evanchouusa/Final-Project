const mainElement = document.getElementsByTagName("main")[0];
const inputElement = document.querySelector("input");
let myList = [];
let player;
let previousIndex = 0;

function onYouTubeIframeAPIReady() {

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        loadPlaylist: {
            listType: 'playlist',
            list: myList,
            //list: ['lJlEQim-yMo'],
            index: parseInt(0),
            suggestedQuality: 'small'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.loadPlaylist(myList);
    //event.target.loadPlaylist(['lJlEQim-yMo']);
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    } else if (event.data == YT.PlayerState.ENDED) {
        let index = player.getPlaylistIndex();
        if (player.getPlaylist().length != myList.length) {

            // update playlist and start playing at the proper index
            player.loadPlaylist(myList, previousIndex + 1);
        }

        /*
        keep track of the last index we got
        if videos are added while the last playlist item is playing,
        the next index will be zero and skip the new videos
        to make sure we play the proper video, we use "last index + 1"
        */
        previousIndex = index;
    }
}

function stopVideo() {
    player.stopVideo();
}


const convertListToElement = (data) => {
    const template = document.getElementById("url-template");
    const clone = template.content.cloneNode(true);

    //list.YoutubeURL.forEach(element => clone.querySelector("#url").textContent = element);
    clone.querySelector("#url").textContent = data;
    return clone;
};

function addList(element) {
    let idIndex = element.lastIndexOf('/') + 1;
    if (element.lastIndexOf('=') + 1 > idIndex)
        idIndex = element.lastIndexOf('=') + 1;
    myList.push(element.substring(idIndex));
}

window.onload = () => {

    const urlParams = new URLSearchParams(window.location.search);
    const myRoom = urlParams.get('room');
    localStorage.removeItem('YoutubeURL');

    if (!isNaN(myRoom) && myRoom != null) {
        fetch(`/stats/${myRoom}`)
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((data) => {
                console.log(data);
                const listElement = document.querySelector("ul");
                console.log(data.YoutubeURL.split(','));
                data.YoutubeURL.split(',').forEach((element) => addList(element));
                console.log(myList);
                data.YoutubeURL.split(',')
                    .map(convertListToElement)
                    .forEach((element) => listElement.appendChild(element));
            })

        document.getElementById("add").addEventListener("click", (event) => {
            const headers = new Headers();
            headers.set("content-type", "application/json");

            if (document.getElementById("youtubeurl").value === "") {
                alert("youtube url is required");
            } else {
                const newURL = document.getElementById("youtubeurl").value;

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
                        listElement.append(convertListToElement(data.YoutubeURL));
                        addList(data.YoutubeURL);
                        console.log(data.YoutubeURL);
                        //console.log(myList);
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

        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // 3. This function creates an <iframe> (and YouTube player)
        //    after the API code downloads.
        var player;

    }
}
