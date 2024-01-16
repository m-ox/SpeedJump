let videoTag = document.querySelector('video');
const consoleHeader = 'SpeedJump Retro:';

function checkForPlayer() {
    if (videoTag) {
        console.log(consoleHeader, 'Found video element!', videoTag);
        document.addEventListener("keydown", e => checkKey(e.key));
        videoTag.classList.add("crt");
        createButtons();
    } else {
        console.log(consoleHeader, 'Failed to find a video element!', videoTag);
        document.removeEventListener("keydown", e => checkKey(e.key));
        initConfig();
    }
};

// PLAYER FUNCTIONS
function inPlaybackRange(rate) {
    if (rate > 0.2 && rate < 15.9) return true;
    else videoTag.playbackRate = 1
        return false;
};

function updateSpeed() {
    document.getElementById('current-rate').innerHTML = videoTag.playbackRate.toFixed(2);
};

function checkKey(key) {
    console.log('rate:', videoTag.playbackRate)
    switch(key){
        case 'w':
            inPlaybackRange(videoTag.playbackRate) ? (videoTag.playbackRate += 0.1) : key;
            console.log(`Current rate: ${videoTag.playbackRate.toFixed(2)}`)
            break;
        case 's':
            inPlaybackRange(videoTag.playbackRate) ? (videoTag.playbackRate -= 0.1) : key;
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
    updateSpeed();
}

function createButtons() {
    try {
        const speedDownButton = document.createElement("button")
        const speedUpButton = document.createElement("button")
        const videoContainer = videoTag.parentNode // the video container we latch onto
        const myPersonalVideoControls = document.createElement('div')
        const countSpan = document.createElement('span')
        const rateTextNode = document.createTextNode(videoTag.playbackRate?.toFixed(2))
        const buttonArray = [speedDownButton, speedUpButton]

        countSpan.id = 'current-rate'
        countSpan.appendChild(rateTextNode)

        const buttonStyles = `
            position: relative;
            width: 50px;
            font-size: .5rem;
            border: 0px none;
            padding: 5px;
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
                currentTextNode = document.createTextNode("faster")
                button.id = 'speed-up'
            } else {
                currentTextNode = document.createTextNode("slower")
                button.id = 'speed-down'
            }

            button.appendChild(currentTextNode)
            myPersonalVideoControls.appendChild(button)

            button.addEventListener('click', e => {
                checkKey(e.target.id === 'speed-up' ? 'w': 's');
                updateSpeed();
            })
        });

        myPersonalVideoControls.appendChild(countSpan);
        countSpan.style = buttonStyles;
        videoContainer.appendChild(myPersonalVideoControls);
    } catch(err) {
        console.error('ID was not for a video element!', err);
        document.removeEventListener("keydown", e => checkKey(e.key));
        videoTag = undefined;
        checkForPlayer();
    }
}


// CONFIG MENU FUNCTIONS
function createRoot() {
    const root = document.createElement('div');
    root.id ='sj-menu-root';
    document.body.appendChild(root);
}

function handleConfirmElementId() {
    const currentInputValue = document.getElementById('sj-video-element-input').value;
    videoTag = document.querySelector(currentInputValue);
    console.log('New video tag:', videoTag, currentInputValue);
    const root = document.getElementById('sj-menu-root');
    root.remove();
    checkForPlayer();
}

function populateMenu() {
    const menuRoot = document.getElementById('sj-menu-root');

    // TEXT INPUT
    const videoElementInput = document.createElement('input');
    videoElementInput.id = 'sj-video-element-input';
    menuRoot.appendChild(videoElementInput);

    // CONFIRMATION BUTTON
    const videoElementConfirmButton = document.createElement('button');
    videoElementConfirmButton.id = 'sj-video-element-confirm-button';
    const buttonContent = document.createTextNode("Confirm Element ID");
    videoElementConfirmButton.appendChild(buttonContent);
    videoElementConfirmButton.addEventListener('click', e => handleConfirmElementId())
    menuRoot.appendChild(videoElementConfirmButton);
    
}

function initConfig(){
    console.log(consoleHeader, 'Creating configuration menu...');
    createRoot();
    populateMenu();
}

checkForPlayer();