var videoContainer = document.getElementById("video-compare-container"),
    leftVideo = document.getElementById("left-video"),
    rightVideo = document.getElementById("right-video"),
    leftVideoOverlay = document.getElementById("left-video-overlay"),
    rightVideoOverlay = document.getElementById("right-video-overlay");

    videoClipper = document.getElementById("video-clipper");
    clippedVideo = videoClipper.getElementsByTagName("video")[0];

const FRAME_RATE = 25;
const ICON_REPLAY = "assets/icons/replay.svg";
const ICON_PLAY = "assets/icons/play.svg";
const ICON_PAUSE = "assets/icons/pause.svg";

leftVideo.onloadedmetadata = function () { appendMetaData(leftVideo, leftVideo.children[0].src, leftVideoOverlay) }
rightVideo.onloadedmetadata = function () { appendMetaData(rightVideo, rightVideo.children[0].src, rightVideoOverlay) }

leftVideo.onpause = function () { syncPosition(0) }
rightVideo.onpause = function () { syncPosition(0) }

leftVideo.onplay = function () { syncPosition(0) }
rightVideo.onplay = function () { syncPosition(0) }

leftVideo.onended = function () {
    if (rightVideo.ended)
        document.getElementById("play-pause-button").src = ICON_REPLAY;
}

rightVideo.onended = function () {
    if (leftVideo.ended)
        document.getElementById("play-pause-button").src = ICON_REPLAY;
}
/*
videoContainer.onmousemove = function (event) {
    var rect = videoContainer.getBoundingClientRect(),
        position = ((event.pageX - rect.left) / videoContainer.offsetWidth) * 100;
    if (position <= 100) {
        videoClipper.style.width = position + "%";
        clippedVideo.style.width = ((100 / position) * 100) + "%";
        clippedVideo.style.zIndex = 3;
    }
}
*/
window.onkeyup = function (keyEvent) {
    if (keyEvent.key === "i" ||  keyEvent.key === "I") {
        leftVideoOverlay.hidden ? leftVideoOverlay.hidden = false : leftVideoOverlay.hidden = true;
        rightVideoOverlay.hidden ? rightVideoOverlay.hidden = false : rightVideoOverlay.hidden = true;
    }
    if (keyEvent.code === "Space") {
        togglePlayPause();
    }
    if (keyEvent.code === "ArrowRight") {
        seekFrames(1);
    }
    if (keyEvent.code === "ArrowLeft") {
        seekFrames(-1);
    }
}

function appendMetaData(video, source, overlay) {
    overlay.innerHTML =
        "Source: " + source + "<br>" +
        "Resolution: " + video.videoWidth + "x" + video.videoHeight;
}

function getCurrentFrame (video) {
    return video.currentTime * FRAME_RATE;
}

function getNewPosition (video, nrOfFrames) {
    return (getCurrentFrame(video) + nrOfFrames) / FRAME_RATE; //+ 0.00001
}

function syncVideoStart() {
    var mediaLoaded = [];
    var videos = Array.from(videoContainer.getElementsByTagName("video"));
    videos.forEach(function (video) {
        video.oncanplaythrough = function () {
            mediaLoaded.push(true);
            if (mediaLoaded.length === videos.length) {
                videos.forEach(function (video) {
                    video.play();
                })
            }
        }
    });

   compareImages(rightVideo);

	function compareImages(img) {
    var slider, img, clicked = 0, w, h;
    /* Get the width and height of the img element */
    w = img.offsetWidth;
    h = img.offsetHeight;
    /* Create slider: */
    slider = document.createElement("DIV");
    slider.setAttribute("class", "comp-slider");
    /* Insert slider */
    img.parentElement.insertBefore(slider, img);
    /* Position the slider in the middle: */
    slider.style.top = (h / 2) - (slider.offsetHeight / 2) + "px";
    slider.style.left = (w / 2) - (slider.offsetWidth / 2) + "px";
    /* Execute a function when the mouse button is pressed: */
    slider.addEventListener("mousedown", slideReady);
    /* And another function when the mouse button is released: */
    window.addEventListener("mouseup", slideFinish);
    /* Or touched (for touch screens: */
    slider.addEventListener("touchstart", slideReady);
     /* And released (for touch screens: */
    window.addEventListener("touchstop", slideFinish);
    slide(50)
    function slideReady(e) {
      /* Prevent any other actions that may occur when moving over the image: */
      e.preventDefault();
      /* The slider is now clicked and ready to move: */
      clicked = 1;
      /* Execute a function when the slider is moved: */
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }
    function slideFinish() {
      /* The slider is no longer clicked: */
      clicked = 0;
    }
    function slideMove(e) {
      var pos;
      /* If the slider is no longer clicked, exit this function: */
      if (clicked == 0) return false;
      var rect = videoContainer.getBoundingClientRect(),
      position = ((event.pageX - rect.left) / videoContainer.offsetWidth) * 100;
      /* Execute a function that will resize the overlay image according to the cursor: */
      slide(position);
    }
    function slide(position) {
      if (position <= 100 && position >= 0) {
            videoClipper.style.width = position + "%";
            clippedVideo.style.width = ((100 / position) * 100) + "%";
            clippedVideo.style.zIndex = 3;
            /* Position the slider: */
            slider.style.left = videoClipper.offsetWidth - (slider.offsetWidth / 2) + "px";
      }
    }
  }
}

// see: http://www.inconduit.com/smpte/
function seekFrames(nrOfFrames) {
    var playpause = document.getElementById("play-pause-button")
    if (!leftVideo.paused) 
        togglePause(playpause, leftVideo)
    if (!rightVideo.paused)
        togglePause(playpause, rightVideo);

    setNewPosition(nrOfFrames);
}

function setNewPosition(nrOfFrames) {
    var newPosLeft = getNewPosition(leftVideo, nrOfFrames);
    var newPosRight = getNewPosition(rightVideo, nrOfFrames);

    // use the most recent frame as the one to sync to
    if (newPosLeft > newPosRight) {
        leftVideo.currentTime = newPosLeft;
        rightVideo.currentTime = newPosLeft;
    } else {
        // the right video is at the latest frame OR they're equal and it doesn't matter
        leftVideo.currentTime = newPosRight;
        rightVideo.currentTime = newPosRight;
    }
}

function syncPosition(nrOfFrames) {
    if (getCurrentFrame(leftVideo) != getCurrentFrame(rightVideo))
        setNewPosition(nrOfFrames);
}

function togglePlayPause() {
    var playpause = document.getElementById("play-pause-button")
    leftVideo.paused ? togglePlay(playpause, leftVideo) : togglePause(playpause, leftVideo);
    rightVideo.paused ? togglePlay(playpause, rightVideo) : togglePause(playpause, rightVideo);
}

function togglePause(button, video) {
    button.src = ICON_PLAY;
    video.pause();
}

function togglePlay(button, video) {
    button.src = ICON_PAUSE;
    video.play()
}

// todo: add progress bar to controls (https://www.adobe.com/devnet/archive/html5/articles/html5-multimedia-pt3.html)

syncVideoStart();
