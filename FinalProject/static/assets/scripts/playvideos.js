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
	event.target.playVideo();
	
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
	console.log("getCurrentTime :" +event.target.getCurrentTime());

    if (event.data == YT.PlayerState.PLAYING && !done) {
        //setTimeout(stopVideo, 6000);
        //done = true;
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
	event.target.setPlaybackRate(1);
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
    
	if (myList.length==0)
		myList.push(element.substring(idIndex));
	else if (myList.find(ele => ele===element.substring(idIndex))=== undefined)
			myList.push(element.substring(idIndex));
	
}


function fetchStats(myRoom){
//This promise will resolve when the network call succeeds
//Feel free to make a REST fetch using promises and assign it to networkPromise
	var dataPromise =fetch(`/stats/${myRoom}`)
		.then((response) => (response.ok ? response.json() : Promise.reject()))
		.then((data) => {
			const listElement = document.querySelector("ul");
			while (listElement.childNodes.length>2) {
				listElement.removeChild(listElement.lastChild);
			}
			data.YoutubeURL.split(',').forEach((element) => addList(element));
			data.YoutubeURL.split(',')
				.map(convertListToElement)
				.forEach((element) => listElement.appendChild(element));
		})

	//This promise will resolve when 10 seconds have passed
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

    if (!isNaN(myRoom) && myRoom != null) {
		fetchStats(myRoom);

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
