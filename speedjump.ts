let videoTag: HTMLVideoElement | null = null;
let controlsCreated = false;
let keydownHandler: ((event: KeyboardEvent) => void) | null = null;

const consoleHeader = 'SpeedJump Retro:';

function getFrameDocument(frame: Element | null): Document | null {
  try {
    const frameLike = frame as
      | {
          contentDocument?: Document | null;
          contentWindow?: Window | null;
        }
      | null;

    return frameLike?.contentDocument || frameLike?.contentWindow?.document || null;
  } catch {
    return null;
  }
}

function findScormVideo(): HTMLElement | null {
  const scorm = document.querySelector('#scorm_object');
  const scormDocument = getFrameDocument(scorm);
  const courseframe = scormDocument?.querySelector('#courseframe') || null;
  const courseDocument = getFrameDocument(courseframe);

  return (
    courseDocument?.querySelector('#leanback-video-id0') ||
    courseDocument?.querySelector('video') ||
    null
  );
}

function findVideoElement(rootDocument: Document = document): HTMLVideoElement | null {
  const directVideo = rootDocument.querySelector<HTMLVideoElement>('video');
  if (directVideo) return directVideo;

  const scormVideo = findScormVideo();
  if (scormVideo instanceof HTMLVideoElement) return scormVideo;

  let nestedVideo: HTMLVideoElement | null = null;

  rootDocument.querySelectorAll('iframe, frame').forEach(frame => {
    if (nestedVideo) return;

    const frameDocument = getFrameDocument(frame);
    if (!frameDocument) return;

    nestedVideo = findVideoElement(frameDocument);
  });

  if (nestedVideo) return nestedVideo;

  return null;
}

function findElement(selectorOrId: string, rootDocument: Document = document): Element | null {
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

  let nested: Element | null = null;

  rootDocument.querySelectorAll('iframe, frame').forEach(frame => {
    if (nested) return;

    const frameDocument = getFrameDocument(frame);
    if (!frameDocument) return;

    nested = findElement(value, frameDocument);
  });

  if (nested) return nested;

  return null;
}

function bindKeyboardControls(): void {
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    videoTag?.ownerDocument?.removeEventListener('keydown', keydownHandler);
  }

  keydownHandler = event => checkKey(event.key);

  document.addEventListener('keydown', keydownHandler);
  videoTag?.ownerDocument?.addEventListener('keydown', keydownHandler);
}

function checkForPlayer(): void {
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

function waitForPlayer(maxAttempts = 120): void {
  let attempts = 0;

  const interval = window.setInterval(() => {
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

function inPlaybackRange(rate: number): boolean {
  if (rate > 0.2 && rate < 15.9) return true;

  if (videoTag) {
    videoTag.playbackRate = 1;
  }

  return false;
}

function updateSpeed(): void {
  const currentRate =
    videoTag?.ownerDocument?.getElementById('current-rate') ||
    document.getElementById('current-rate');

  if (currentRate && videoTag) {
    currentRate.textContent = videoTag.playbackRate.toFixed(2);
  }
}

function checkKey(key: string): number | void {
  if (!videoTag) return;

  console.log('rate:', videoTag.playbackRate);

  switch (key) {
    case 'w':
      if (inPlaybackRange(videoTag.playbackRate)) {
        videoTag.playbackRate += 0.1;
      }
      console.log(`Current rate: ${videoTag.playbackRate.toFixed(2)}`);
      break;
    case 's':
      if (inPlaybackRange(videoTag.playbackRate)) {
        videoTag.playbackRate -= 0.1;
      }
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

function createButtons(): void {
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
    const rateTextNode = controlsDocument.createTextNode(videoTag.playbackRate.toFixed(2));

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
    myPersonalVideoControls.style.cssText = parentDivStyle;

    const buttons = [
      { element: speedDownButton, id: 'speed-down', label: 'slower', key: 's' },
      { element: speedUpButton, id: 'speed-up', label: 'faster', key: 'w' },
    ];

    for (const buttonConfig of buttons) {
      buttonConfig.element.style.cssText = buttonStyles;
      buttonConfig.element.id = buttonConfig.id;
      buttonConfig.element.appendChild(controlsDocument.createTextNode(buttonConfig.label));
      myPersonalVideoControls.appendChild(buttonConfig.element);

      buttonConfig.element.addEventListener('click', () => {
        checkKey(buttonConfig.key);
        updateSpeed();
      });
    }

    myPersonalVideoControls.appendChild(countSpan);
    countSpan.style.cssText = buttonStyles;

    videoContainer?.appendChild(myPersonalVideoControls);
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

function createRoot(): void {
  if (document.getElementById('sj-menu-root')) return;

  const root = document.createElement('div');
  root.id = 'sj-menu-root';
  document.body.appendChild(root);
}

function handleConfirmElementId(): void {
  const input = document.getElementById('sj-video-element-input') as HTMLInputElement | null;
  const currentInputValue = input?.value.trim() ?? '';

  videoTag = findElement(currentInputValue) as HTMLVideoElement | null;

  console.log('New video tag:', videoTag, currentInputValue);

  const root = document.getElementById('sj-menu-root');
  if (root) root.remove();

  controlsCreated = false;
  checkForPlayer();
}

function populateMenu(): void {
  const menuRoot = document.getElementById('sj-menu-root');
  if (!menuRoot || document.getElementById('sj-video-element-input')) return;

  const videoElementInput = document.createElement('input');
  videoElementInput.id = 'sj-video-element-input';
  videoElementInput.placeholder = 'video, #leanback-video-id0, or element id';
  menuRoot.appendChild(videoElementInput);

  const videoElementConfirmButton = document.createElement('button');
  videoElementConfirmButton.id = 'sj-video-element-confirm-button';
  videoElementConfirmButton.appendChild(document.createTextNode('Confirm Element ID'));
  videoElementConfirmButton.addEventListener('click', () => handleConfirmElementId());
  menuRoot.appendChild(videoElementConfirmButton);
}

function initConfig(): void {
  console.log(consoleHeader, 'Creating configuration menu...');
  createRoot();
  populateMenu();
}

waitForPlayer();
