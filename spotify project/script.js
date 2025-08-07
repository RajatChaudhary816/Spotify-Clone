var songs;
let currFolder;

function secondstominutes(totalSeconds) {
    const total = Math.floor(totalSeconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}




let currentsong = new Audio();

async function getsongs(folder) {
    //get all the songs
    currFolder = folder;
    let a = await fetch(`http://192.168.29.18:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    let songlist = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songlist.innerHTML = "";
    for (const song of songs) {
        // show all the songs
        songlist.innerHTML = songlist.innerHTML + `<li>  
        <img src="img/music.svg" class="invert musicicon">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Rajat</div>
                        </div>
                        <div class="playnow">
                        <div>Play now</div>
                            <img src="img/play.svg"  class="invert">
                        </div>
         </li>`
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    });
    return songs;
}
function playmusic(track, pause = false) {
    currentsong.src = (`/${currFolder}/` + track)
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".duration").innerHTML = "0:00 / 0:00"
}

async function displayalbums() {
    let a = await fetch(`http://192.168.29.18:3000/songs`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer");
    console.log(cardcontainer)

    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            // get metadata of folder
            let a = await fetch(`http://192.168.29.18:3000/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder ="${folder}" class="card">
                        <div class="cardimg">
                            <img src="/songs/${folder}/cover.jpg" alt="">
                        </div>
                        <h2>${response.title}</h2>
                        <span class="writer">${response.description} </span>
                        <div class="play">
                            <img src="img/play.svg" alt="">
                        </div>
                    </div>
                   `
        }
    }
     Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);

        })
    })
    
   
}
async function main() {

    await getsongs("songs/honey");
    playmusic(songs[0], true);
    // console.log(songs);

    //  display all the albums
    displayalbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = `${secondstominutes(currentsong.currentTime)} / ${secondstominutes(currentsong.duration)
            }`
        document.querySelector(".circle").style.left = ((currentsong.currentTime / currentsong.duration) * 100 + "%")
    })
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = -100 + "%";;
    })
    pre.addEventListener("click", (e) => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) > 0) {
            playmusic(songs[index - 1])
        }

    })
    next.addEventListener("click", () => {
        console.log("Next clicked")

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    // attach an event listner to mute the sound 
    document.querySelector(".volume>img").addEventListener("click",(e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
            currentsong.volume = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 20;
            currentsong.volume = .20;

        }
    }))
console.log("currentsong:", currentsong);
console.log("currentsong.src:", currentsong?.src);

   

}
main();