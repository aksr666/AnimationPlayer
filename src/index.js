const state = {
  color: false,
  isMouseDown: false,
  paint: false,
};

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('draw')) {
    state.isMouseDown = !state.isMouseDown;
    state.paint = false;
    document.querySelector('.draw').classList.toggle('aqua');
    document.querySelector('.paint').classList.remove('aqua');
  }
  if (e.target.classList.contains('paint')) {
    state.paint = !state.paint;
    state.isMouseDown = false;
    document.querySelector('.paint').classList.toggle('aqua');
    document.querySelector('.draw').classList.remove('aqua');
  }
});

document.querySelector('.current').addEventListener('input', (e) => {
  state.color = e.target.value;
});

class Canvas {
  constructor(width, height, size) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.lineWidth = size;
  }

  createCanvas(parent) {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    this.context = canvas.getContext('2d');
    this.context.lineWidth = this.lineWidth;
    this.canvas = canvas;
    parent.appendChild(canvas);
  }
}

class CanvasMain extends Canvas {
  constructor(width, height, lineWidth, coords) {
    super(width, height, lineWidth, coords);
    this.isMouseDown = false;
  }

  createCanvas(parent) {
    super.createCanvas(parent);
    this.canvas.addEventListener('mousedown', () => {
      this.isMouseDown = true;
    }, false);
    this.canvas.addEventListener('click', () => {
      this.paint();
      this.context.beginPath();
      frame.currentFrame.getContext('2d').drawImage(this.canvas, 0, 0, 724, 724);
    });
    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.context.beginPath();
      frame.currentFrame.getContext('2d').drawImage(this.canvas, 0, 0, 724, 724);
    });
    this.canvas.addEventListener('mousemove', e => this.draw(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
    });
  }

  draw(e) {
    e.preventDefault();
    if (this.isMouseDown && e.which === 1 && state.isMouseDown) {
      this.context.fillStyle = state.color;
      this.context.strokeStyle = state.color;
      this.context.lineTo(e.layerX, e.layerY);
      this.context.stroke();
      this.context.beginPath();
      this.context.arc(e.layerX, e.layerY, this.lineWidth / 2, 0, Math.PI * 2);
      this.context.fill();
      this.context.beginPath();
      this.context.moveTo(e.layerX, e.layerY);
    }
    if (this.isMouseDown && e.which === 3 && state.isMouseDown) {
      this.context.clearRect(e.layerX, e.layerY, this.lineWidth, this.lineWidth);
    }
  }

  paint() {
    if (state.paint) {
      this.context.fillStyle = state.color;
      this.context.beginPath();
      this.context.moveTo(0, 0);
      this.context.lineTo(0, 724);
      this.context.lineTo(724, 724);
      this.context.lineTo(724, 0);
      this.context.fill();
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
}
const canvas = new CanvasMain(724, 724, 15);
canvas.createCanvas(document.querySelector('.canvas'));

class Frames {
  constructor() {
    this.frames = [];
    this.currentFrame = null;
  }

  createFrame(clone) {
    const wrapper = this.createWrapper();
    const frame = new Canvas(724, 724);
    frame.count = this.count;
    frame.createCanvas(wrapper);
    frame.canvas.addEventListener('click', () => {
      this.setCurrentFrame(frame.canvas);
      this.setMainCanvas();
    });
    this.frames.push(frame.canvas);
    this.currentFrame = frame.canvas;
    if (clone) {
      frame.context.drawImage(clone.canvas, 0, 0, 724, 724);
      document.querySelector('.frames').insertBefore(wrapper, clone.parent);
      canvas.clear();
      this.setMainCanvas();
    } else {
      document.querySelector('.frames').appendChild(wrapper);
    }
    frame.canvas.classList.add('frame');
    this.setFramesNumber();
    if (this.frames.length > 1) {
      clearInterval(prev.interval);
      prev.startAnimation(this.frames);
    }
  }

  setCurrentFrame(frame) {
    this.currentFrame = frame;
  }

  createWrapper() {
    const div = document.createElement('div');
    div.classList.add('frame-wrapper');
    const p = document.createElement('p');
    p.innerHTML = this.count;
    p.classList.add('frame-number');
    div.appendChild(p);
    div.style.background = 'grey';
    this.createButtons(div);
    return div;
  }

  removeFrame(e) {
    const parent = e.target.parentNode;
    const canv = parent.childNodes[3];
    this.frames.splice(this.frames.indexOf(canv), 1);
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    document.querySelector('.frames').removeChild(parent);
    clearInterval(prev.interval);
    prev.startAnimation(this.frames);
    this.setFramesNumber();
  }

  createButtons(parrent) {
    const cloneBtn = document.createElement('button');
    cloneBtn.classList.add('clone-frame');
    cloneBtn.onclick = e => this.createClone(e);
    parrent.appendChild(cloneBtn);
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-frame');
    removeBtn.onclick = e => this.removeFrame(e);
    parrent.appendChild(removeBtn);
  }

  createButton() {
    const button = document.createElement('button');
    button.classList.add('create-frame');
    button.onclick = () => {
      this.createFrame();
      canvas.clear();
    };
    document.querySelector('.frames').appendChild(button);
  }

  createClone(e) {
    const clone = {
      canvas: this.frames[this.frames.indexOf(e.target.parentNode.childNodes[3])],
      parent: e.target.parentNode,
    };
    this.setCurrentFrame(clone.canvas);
    this.createFrame(clone);
    this.setMainCanvas();
  }

  setFramesNumber() {
    const frames = document.querySelectorAll('.frame-wrapper');
    frames.forEach((frame, index) => {
      const frameNumber = frame.querySelector('.frame-number');
      frameNumber.innerText = index + 1;
    });
  }

  setMainCanvas() {
    canvas.clear();
    canvas.context.drawImage(this.currentFrame, 0, 0, canvas.canvasWidth, canvas.canvasHeight);
  }
}
const frame = new Frames();
frame.createFrame();
frame.createButton();

class Preview {
  constructor() {
    this.speed = 1000;
  }

  createPreview(parent) {
    const preview = new Canvas(724, 724);
    preview.createCanvas(parent);
    preview.canvas.classList.add('preview-frame');
    this.canvas = preview.canvas;
    this.preview = preview.context;
    const fsBtn = document.createElement('button');
    fsBtn.addEventListener('click', () => this.toggleFullscreen());
    fsBtn.classList.add('fullscreen-button');
    document.querySelector('.preview').appendChild(fsBtn);
  }

  clearPreview() {
    this.preview.clearRect(0, 0, 724, 724);
  }

  toggleFullscreen() {
    const elem = document.querySelector('.preview');
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  startAnimation(frames) {
    let counter = 0;
    this.frames = frames;
    this.animate = true;
    this.interval = setInterval(() => {
      if (counter === frames.length) {
        counter = 0;
      }
      this.clearPreview();
      this.preview.drawImage(this.frames[counter], 0, 0, 724, 724);
      counter += 1;
    }, this.speed);
  }

  restartAnimation() {
    if (this.animate) {
      clearInterval(this.interval);
      this.startAnimation(this.frames);
    }
  }

  setAnimationSpeed() {
    const input = document.querySelector('.fps-rate');
    this.speed = 1000 / input.value;
    const label = document.querySelector('.fps-rate-label');
    label.innerHTML = `FPS: ${input.value}`;
    input.addEventListener('input', () => {
      this.speed = 1000 / input.value;
      label.innerHTML = `FPS: ${input.value}`;
      this.restartAnimation();
    });
  }
}
const prev = new Preview();
prev.createPreview(document.querySelector('.preview'));
prev.setAnimationSpeed();
