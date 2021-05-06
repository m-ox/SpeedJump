const videoTag = document.querySelector('video')

function inPlaybackRange(rate) {
    if (rate > 0.2 && rate < 15.9) return true;
    else videoTag.playbackRate = 1
        return false;
}

function updateSpeed(){
    document.getElementById('current-rate').innerHTML = videoTag.playbackRate.toFixed(2)

}

function checkKey(key) { 
    //console.log(key) // we now console log each key press!
    switch(key){
        case 'w':
            inPlaybackRange(videoTag.playbackRate) // faster playback
            ? (videoTag.playbackRate += 0.1)
            : key;
            console.log(`Current rate: ${videoTag.playbackRate.toFixed(2)}`)
            break;
        case 's':
            inPlaybackRange(videoTag.playbackRate)
            ? (videoTag.playbackRate -= 0.1)
            : key;
            console.log(`Current rate: ${videoTag.playbackRate.toFixed(2)}`) // slower playback
            break;
        case 'r':
            videoTag.playbackRate = 1
            console.log(`Reset current rate: ${videoTag.playbackRate.toFixed(2)}`) // reset playback
            break;
        case 'a':
            videoTag.currentTime -= 5; // rewinds by 5s
            console.log('Scooched behind 5 seconds!')
            break;
        case 'd':
            videoTag.currentTime += 5; // forward by 5s
            console.log('Skipped ahead 5 seconds!')
            break;
        default:
            return videoTag.playbackRate //console logs playback rate
    }
    updateSpeed()
}

function createButtons(){
    // establishing our items we want to work with
    const speedDownButton = document.createElement("button")
    const speedUpButton = document.createElement("button")
    const videoContainer = document.querySelector('video').parentNode // the video container we latch onto
    const myPersonalVideoControls = document.createElement('div')
    const countSpan = document.createElement('span')
    const rateTextNode = document.createTextNode(videoTag.playbackRate.toFixed(2))
    const buttonArray = [speedDownButton, speedUpButton]

    countSpan.id = 'current-rate'
    countSpan.appendChild(rateTextNode)

    const buttonStyles = `
        position: relative;
        width: 50px;
        height: 50px;
        border: 0px none;
        padding: 10px;
        margin: 5px;
        color: white;
        background: rgb(66 70 66);
        border-radius: 5px 10px;
        font-weight: 600;
        cursor: pointer;
        bottom: 100px;
        opacity: 30%;
    `

    const parentDivStyle = `
    display: grid;
    width: 50px;
    height: 200px;
    grid-template-columns: 1fr 1fr;
    position: relative;
    bottom: 100px;
    `

    buttonArray.forEach(button => {
        let currentTextNode;
        button.style = buttonStyles

        if (button === speedUpButton) {
            currentTextNode = document.createTextNode("speed up")
            button.id = 'speed-up'
        } else {
            currentTextNode = document.createTextNode("speed down")
            button.id = 'speed-down'
        }

        button.appendChild(currentTextNode)
        myPersonalVideoControls.appendChild(button)

        button.addEventListener('click', e => {
            checkKey(e.target.id === 'speed-up' ? 'w': 's') // crummy ternary operator that could be a switch statement instead
            updateSpeed()
        })
    })

    myPersonalVideoControls.appendChild(countSpan)
    countSpan.style = buttonStyles
    videoContainer.appendChild(myPersonalVideoControls)
}

if (!videoTag) {
    console.warn('No video for speed controller!')
} else {
    document.addEventListener("keydown", e => {
        checkKey(e.key)
    })

    createButtons()
}