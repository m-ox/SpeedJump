let videoTag = null;
let controlsCreated = false;
let keydownHandler = null;
const consoleHeader = 'SpeedJump Retro:';

function getFrameDocument(frame) {
    try {
        return frame.contentDocument || frame.contentWindow?.document || null;
    } catch {
        return null;
    }
}

function findScormVideo() {
    const scorm = document.querySelector('#scorm_object');
    const scormDocument = getFrameDocument(scorm);
    const courseframe = scormDocument?.querySelector('#courseframe');
    const courseDocument = getFrameDocument(courseframe);

    return (
        courseDocument?.querySelector('#leanback-video-id0') ||
        courseDocument?.querySelector('video') ||
        null
    );
}

function findVideoElement(rootDocument = document) {
    const directVideo = rootDocument.querySelector('video');
    if (directVideo) return directVideo;

    const scormVideo = findScormVideo();
    if (scormVideo) return scormVideo;

    for (const frame of rootDocument.querySelectorAll('iframe, frame')) {
        const frameDocument = getFrameDocument(frame);
        if (!frameDocument) continue;

        const nestedVideo = findVideoElement(frameDocument);
        if (nestedVideo) return nestedVideo;
    }

    return null;
}

function findElement(selectorOrId, rootDocument = document) {
    const value = selectorOrId.trim();
    if (!value) return null;

    const id = value.replace(/^#/, '');

    const scormVideo = findScormVideo();
    if (
        scormVideo &&
        (id === scormVideo.id || value === 'video' || value === `#${scormVideo.id}`)
    ) {
        return scormVideo;
    }

    let direct = rootDocument.getElementById(id);

    if (!direct) {
        try {
            direct = rootDocument.querySelector(value);
        } catch {
            direct = null;
        }
    }

    if (direct) return direct;

    for (const frame of rootDocument.querySelectorAll('iframe, frame')) {
        const frameDocument = getFrameDocument(frame);
        if (!frameDocument) continue;

        const nested = findElement(value, frameDocument);
        if (nested) return nested;
    }

    return null;
}

function bindKeyboardControls() {
    if (keydownHandler) {
        document.removeEventListener('keydown', keydownHandler);
        videoTag?.ownerDocument?.removeEventListener('keydown', keydownHandler);
    }

    keydownHandler = e => checkKey(e.key);

    document.addEventListener('keydown', keydownHandler);
    videoTag?.ownerDocument?.addEventListener('keydown', keydownHandler);
}

function checkForPlayer() {
    videoTag = videoTag || findVideoElement();

    if (videoTag) {
        console.log(consoleHeader, 'Found video element!', videoTag);
        bindKeyboardControls();
        videoTag.classList.add('crt');
        createButtons();
    } else {
        console.log(consoleHeader, 'Failed to find a video element!', videoTag);
        initConfig();
    }
}

function waitForPlayer(maxAttempts = 120) {
    let attempts = 0;

    const interval = setInterval(() => {
        videoTag = findVideoElement();

        if (videoTag) {
            clearInterval(interval);
            checkForPlayer();
            return;
        }

        attempts += 1;

        if (attempts >= maxAttempts) {
            clearInterval(interval);
            checkForPlayer();
        }
    }, 500);
}

function inPlaybackRange(rate) {
    if (rate > 0.2 && rate < 15.9) return true;

    videoTag.playbackRate = 1;
    return false;
}

function updateSpeed() {
    const currentRate =
        videoTag?.ownerDocument?.getElementById('current-rate') ||
        document.getElementById('current-rate');

    if (currentRate && videoTag) {
        currentRate.innerHTML = videoTag.playbackRate.toFixed(2);
    }
}

function checkKey(key) {
    if (!videoTag) return;

    console.log('rate:', videoTag.playbackRate);

    switch (key) {
        case 'w':
            inPlaybackRange(videoTag.playbackRate) ? (videoTag.playbackRate += 0.1) : key;
            console.log(`Current rate: ${videoTag.playbackRate.toFixed(2)}`);
            break;
        case 's':
            inPlaybackRange(videoTag.playbackRate) ? (videoTag.playbackRate -= 0.1) : key;
            console.log(`Current rate: ${videoTag.playbackRate.toFixed(2)}`);
            break;
        case 'r':
            videoTag.playbackRate = 1;
            console.log(`Reset current rate: ${videoTag.playbackRate.toFixed(2)}`);
            break;
        case 'a':
            videoTag.currentTime -= 5;
            console.log('Scooched behind 5 seconds!');
            break;
        case 'd':
            videoTag.currentTime += 5;
            console.log('Skipped ahead 5 seconds!');
            break;
        default:
            return videoTag.playbackRate;
    }

    updateSpeed();
}

function createButtons() {
    if (controlsCreated || !videoTag) return;

    try {
        const controlsDocument = videoTag.ownerDocument || document;

        if (controlsDocument.getElementById('sj-video-controls')) {
            controlsCreated = true;
            return;
        }

        const speedDownButton = controlsDocument.createElement('button');
        const speedUpButton = controlsDocument.createElement('button');
        const videoContainer = videoTag.parentNode;
        const myPersonalVideoControls = controlsDocument.createElement('div');
        const countSpan = controlsDocument.createElement('span');
        const rateTextNode = controlsDocument.createTextNode(videoTag.playbackRate?.toFixed(2));
        const buttonArray = [speedDownButton, speedUpButton];

        controlsCreated = true;

        countSpan.id = 'current-rate';
        countSpan.appendChild(rateTextNode);

        const buttonStyles = `
            position: relative;
            width: 50px;
            height: 50px;
            font-size: .5rem;
            border: 0px none;
            padding: 5px;
            color: white;
            background: rgb(66 70 66);
            border-radius: 5px 10px;
            font-weight: 600;
            cursor: pointer;
            opacity: 30%;
            align-content: center;
        `;

        const parentDivStyle = `
            display: grid;
            width: 50px;
            height: 200px;
            grid-template-columns: 1fr 1fr 1fr;
            position: relative;
            bottom: 100px;
            z-index: 999999;
            padding-left: .5rem;
            gap: .25rem;
        `;

        myPersonalVideoControls.id = 'sj-video-controls';
        myPersonalVideoControls.style = parentDivStyle;

        buttonArray.forEach(button => {
            let currentTextNode;
            button.style = buttonStyles;

            if (button === speedUpButton) {
                currentTextNode = controlsDocument.createTextNode('faster');
                button.id = 'speed-up';
            } else {
                currentTextNode = controlsDocument.createTextNode('slower');
                button.id = 'speed-down';
            }

            button.appendChild(currentTextNode);
            myPersonalVideoControls.appendChild(button);

            button.addEventListener('click', e => {
                checkKey(e.target.id === 'speed-up' ? 'w' : 's');
                updateSpeed();
            });
        });

        myPersonalVideoControls.appendChild(countSpan);
        countSpan.style = buttonStyles;
        videoContainer.appendChild(myPersonalVideoControls);
    } catch (err) {
        console.error('ID was not for a video element!', err);

        if (keydownHandler) {
            document.removeEventListener('keydown', keydownHandler);
            videoTag?.ownerDocument?.removeEventListener('keydown', keydownHandler);
        }

        videoTag = null;
        controlsCreated = false;
        checkForPlayer();
    }
}

function createRoot() {
    if (document.getElementById('sj-menu-root')) return;

    const root = document.createElement('div');
    root.id = 'sj-menu-root';
    document.body.appendChild(root);
}

function handleConfirmElementId() {
    const currentInputValue = document.getElementById('sj-video-element-input').value.trim();

    videoTag = findElement(currentInputValue);

    console.log('New video tag:', videoTag, currentInputValue);

    const root = document.getElementById('sj-menu-root');
    if (root) root.remove();

    controlsCreated = false;
    checkForPlayer();
}

function populateMenu() {
    const menuRoot = document.getElementById('sj-menu-root');
    if (!menuRoot || document.getElementById('sj-video-element-input')) return;

    const videoElementInput = document.createElement('input');
    videoElementInput.id = 'sj-video-element-input';
    videoElementInput.placeholder = 'video, #leanback-video-id0, or element id';
    menuRoot.appendChild(videoElementInput);

    const videoElementConfirmButton = document.createElement('button');
    videoElementConfirmButton.id = 'sj-video-element-confirm-button';
    const buttonContent = document.createTextNode('Confirm Element ID');
    videoElementConfirmButton.appendChild(buttonContent);
    videoElementConfirmButton.addEventListener('click', () => handleConfirmElementId());
    menuRoot.appendChild(videoElementConfirmButton);
}

function initConfig() {
    console.log(consoleHeader, 'Creating configuration menu...');
    createRoot();
    populateMenu();
}

waitForPlayer();