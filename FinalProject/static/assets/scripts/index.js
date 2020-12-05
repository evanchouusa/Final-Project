const mainElement = document.getElementsByTagName("main")[0];
const inputElement = document.querySelector("input");

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

const convertListToElement = (data) => {
    const template = document.getElementById("url-template");
    const clone = template.content.cloneNode(true);

    //list.YoutubeURL.forEach(element => clone.querySelector("#url").textContent = element);
    clone.querySelector("#url").textContent = data;
    return clone;
};

window.onload = () => {

    const urlParams = new URLSearchParams(window.location.search);
    const myRoom = urlParams.get('room');

    console.log(myRoom);

    const joinpage = document.getElementById("join");
    const createpage = document.getElementById("create");

    //this is for playvideos
    if (!isNaN(myRoom) && myRoom != null) {
        fetch(`/room/${myRoom}`)
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((data) => {
                console.log(data);
                //inputElement.classList.remove("error");
                //inputElement.value = "";
                const listElement = document.querySelector("ul");
                //console(data.YoutubeURL.split(','));
                //let myList = data.YoutubeURL.split(',').forEach((element) => element.substring(element.lastIndexOf('/') + 1));
                //console.log(myList);
                localStorage.setItem('YoutubeURL', data.YoutubeURL);
                data.YoutubeURL.split(',')
                    //data.YoutubeURL
                    .map(convertListToElement)
                    .forEach((element) => listElement.appendChild(element));
            })
            .catch(failAllGet);

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

                        console.log(data);

                        inputElement.classList.remove("error");
                        inputElement.value = "";
                        const listElement = document.querySelector("ul");
                        listElement.append(convertListToElement(data.YoutubeURL));
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

    }
    //if joinpage is not undefined, click join button
    else if (joinpage != undefined) {
        document.getElementById("join").addEventListener("click", (event) => {
            const copyurl = document.getElementById("youtubeurl").value;
            window.location.href = copyurl;
        });
    }
    //if createpage is not undefined, click create button
    else if (createpage != undefined) {
        document.getElementById("create").addEventListener("click", (event) => {
            const headers = new Headers();
            headers.set("content-type", "application/json");

            if (document.getElementById("youtubeurl").value === "") {
                alert("youtube url is required");
            } else {
                const newURL = document.getElementById("youtubeurl").value;

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