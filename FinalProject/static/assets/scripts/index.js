const mainElement = document.getElementsByTagName("main")[0];
const inputElement = document.querySelector("input");

//to check if server is up an running or can't fetch anything
const failAllGet = () => {
    const errorElement = document.createElement("section");
    errorElement.classList.add("error");
    errorElement.innerText =
        "Couldn't fetch anything, is the server up and running?";
    mainElement.appendChild(errorElement);
};

const convertURLToElement = (list) => {
    const template = document.getElementById("url-template");
    const clone = template.content.cloneNode(true);

    //printing unique url on playvideos page to give to friends
    prompt("Copy the URL to give to friends:", "http://localhost:3000/playvideos.html?room=" + list.roomID);
    console.log(list);

    window.location.href = "http://localhost:3000/playvideos.html?room=" + list.roomID;

    //clone.querySelector("#url").textContent = "http://localhost:3000/room/" + list.roomID;
    //return clone;
};


window.onload = () => {

    const urlParams = new URLSearchParams(window.location.search);
    const myRoom = urlParams.get('room');

    const joinpage = document.getElementById("join");
    const createpage = document.getElementById("create");


    //if joinpage is not undefined, click join button
    if (joinpage != undefined) {
        //for the join button to work on join page
        document.getElementById("join").addEventListener("click", (event) => {
            const copyurl = document.getElementById("youtubeurl").value;
            window.location.href = copyurl;
        });
    }
    //if createpage is not undefined, click create button
    else if (createpage != undefined) {
        //for the create button to work on create a room page
        document.getElementById("create").addEventListener("click", (event) => {
            const headers = new Headers();
            headers.set("content-type", "application/json");

            //this is to check if youtube url is inputed. If not, will return error.
            if (document.getElementById("youtubeurl").value === "") {
                alert("youtube url is required");
            } else {
                const newURL = document.getElementById("youtubeurl").value;

                //fetching the room and posting youtube url into server for newroom
                //we've done this before for the todo list assignment, so this part is self explanatory
                fetch("/api/newroom", {
                        headers,
                        method: "POST",
                        body: JSON.stringify({
                            YoutubeURL: `${newURL}`,
                        }),
                    })
                    .catch((status) => {
                        console.log(status);
                        const newItem = { YoutubeURL: `${newURL}` };

                        return {
                            ok: true,
                            json: () => (
                                newItem
                            ),
                        }
                    })
                    .then((response) => {
                        return response.ok && response.status === 201 ?
                            response.json() :
                            Promise.reject(response.status);
                    })
                    .then((data) => {

                        console.log(data);

                        inputElement.classList.remove("error");
                        inputElement.value = "";
                        const listElement = document.querySelector("ul");
                        listElement.append(convertURLToElement(data));
                    })
                    .catch((status) => {
                        console.log(status);
                        const listElement = document.querySelector("ul");
                        const newItem = { YoutubeURL: `${newURL}` };
                        listElement.append(convertURLToElement(newItem));
                        inputElement.classList.add("error");
                    });
            }
        });
    }
};