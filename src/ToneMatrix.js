/* global ClipboardJS */
/* global Tone */
/* global Grid */
/* global Util */
/** Main class of ToneMatrix Redux, a pentatonic step sequencer */
class ToneMatrix { // eslint-disable-line no-unused-vars
/**
   * Creates a new ToneMatrix Redux instance, and attach it to existing DOM elements
   * @param {Element} canvasWrapperEl - The wrapper element that ToneMatrix should inject its
   *    canvas into
   * @param {Element} clearNotesButtonEl - A DOM element that should clear all notes when clicked
   * @param {Element} clipboardInputEl - An HTML 'input' element for displaying level codes
   * @param {Element} clipboardButtonEl - A DOM element that should copy the level code to the
   *    clipboard when clicked
   */
  constructor(canvasWrapperEl, clearNotesButtonEl, clipboardInputEl,
    clipboardButtonEl, muteButtonEl) {
    // emits when any error occurs
    Util.assert(arguments.length === 5);
    /*
    function setNoteFromFileFun() {
      this.setNoteFromFile();
    }
    */

    /**
     * The main canvas element that ToneMatrix draws to
     * @type {Element}
     */
    this.c = document.createElement('canvas');
    canvasWrapperEl.appendChild(this.c);
    const rect = this.c.getBoundingClientRect();

    /**
     * The main canvas element's 2d drawing context
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.c.getContext('2d');

    /**
     * The width of the grid, measured in grid tiles
     * @const {number}
     */
    this.WIDTH = 32;

    /**
     * The height of the grid, measured in grid tiles
     * @const {number}
     */
    this.HEIGHT = 32;

    // Get the size of the canvas in CSS pixels.
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    const dpr = devicePixelRatio || 1;
    this.c.height = rect.height * dpr;
    this.c.width = rect.height * (this.WIDTH / this.HEIGHT) * dpr;

    this.grid = new Grid(this.WIDTH, this.HEIGHT, this.c);

    this.mouseX = -1;
    this.mouseY = -1;
    // Clipboard input element

    this.clipboardInputEl = clipboardInputEl || null;
    this.originalURL = [window.location.protocol, '//', window.location.host, window.location.pathname].join(''); // Initial page URL without query string

    clearNotesButtonEl.addEventListener('click', () => {
      this.clear();
    });

    // Integrate the clipboard button with the ClipboardJS library

    // eslint-disable-next-line no-new
    new ClipboardJS(clipboardButtonEl);


    this.doSetTimer(500);
    this.setNoteFromFileFirst(4);
    /*
    this.setNoteFromFileFirst(2);
    this.setNoteFromFileFirst(3);
    this.setNoteFromFileFirst(4);
    this.setNoteFromFileFirst(5);
    this.setNoteFromFileFirst(6);
    */

    /*
    setInterval(this.setNoteFromFile, 500);
    window.setInterval(setNoteFromFileFun, 500);
    this.setNoteFromFile();
    this.setNoteFromFile();
    */

    // Set Instroment 
    this.grid.setCurrentInstrument(4); // 0 through 9, numpad

    // Mute button element

    muteButtonEl.addEventListener('click', () => {
      if (muteButtonEl.classList.contains('muted')) {
        muteButtonEl.classList.remove('muted');
        this.setMuted(false);
      } else {
        muteButtonEl.classList.add('muted');
        this.setMuted(true);
      }
    });

    // Listen for clicks on the canvas

    let arming = null; // Whether our cursor is currently turning on or turning off tiles


    function canvasClick(x, y) {
      Util.assert(arguments.length === 2);
      const tile = Util.pixelCoordsToTileCoords(x, y, this.WIDTH, this.HEIGHT,
        this.c.width, this.c.height);
      if (arming === null) arming = !this.grid.getTileValue(tile.x, tile.y);
      this.grid.setTileValue(tile.x, tile.y, arming);
      // Update URL fragment
      const base64 = this.grid.toBase64();
      if (base64) this.setSharingURL(base64);
      else this.resetSharingURL();
      // Make sure audio context is running
      Tone.context.resume();
    }
    this.c.addEventListener('mousemove', (e) => {
      this.updateCanvasMousePosition(e);
      if (e.buttons !== 1) return; // Only if left button is held
      canvasClick.bind(this)(this.mouseX, this.mouseY);
    });
    this.c.addEventListener('mouseleave', () => {
      this.resetCanvasMousePosition();
    });
    this.c.addEventListener('mousedown', (e) => {
      this.updateCanvasMousePosition(e);
      arming = null;
      canvasClick.bind(this)(this.mouseX, this.mouseY);
    });
    this.c.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent emulated click
      if (e.touches.length === 1) {
        arming = null;
      }
      Array.from(e.touches).forEach(
        (touch) => {
          this.updateCanvasMousePosition(touch);
          canvasClick.bind(this)(this.mouseX, this.mouseY);
        },
      );
    });
    this.c.addEventListener('touchend', (e) => {
      e.preventDefault(); // Prevent emulated click
      this.resetCanvasMousePosition();
    });
    this.c.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Prevent emulated click
      Array.from(e.touches).forEach(
        (touch) => {
          this.updateCanvasMousePosition(touch);
          canvasClick.bind(this)(this.mouseX, this.mouseY);
        },
      );
    });

    // Secret instrument switcher

    window.addEventListener('keydown', (event) => {
      if (!event.isComposing && !(event.keyCode === 229)) { // not some chinese character weirdness
        if (event.keyCode >= 48 && event.keyCode <= 57) {
          this.grid.setCurrentInstrument(event.keyCode - 48); // 0 through 9
        } else if (event.keyCode >= 96 && event.keyCode <= 105) {
          this.grid.setCurrentInstrument(event.keyCode - 96); // 0 through 9, numpad
        }
      }
    });

    Tone.Transport.loopEnd = '4m'; // loop at one measure -  this changes tempo
    Tone.Transport.loop = true;
    Tone.Transport.start();

    // If Chrome Autoplay Policy is blocking audio,
    // add a play button that encourages user interaction

    window.addEventListener('DOMContentLoaded', () => {
      // eslint-disable-next-line no-param-reassign
      canvasWrapperEl.style.visibility = 'visible';
    });

    if ('ontouchstart' in window || window.location.toString().indexOf('?') >= 0) {
      canvasWrapperEl.addEventListener('click', () => {
        Tone.context.resume().then(() => {
          document.body.classList.add('playing');
        });
      });
      Tone.context.resume().then(() => {
        document.body.classList.add('playing');
      });
    } else {
      document.body.classList.add('playing');
    }

    // Load tune from search string, then remove search string

    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('d');
    if (data) {
      this.grid.fromBase64(data);
      this.setSharingURL(data);
      window.history.replaceState('', document.title, window.location.pathname);
    } else {
      this.resetSharingURL();
    }

    // Kick off game loop

    function updateContinuous() {
      this.update();
      requestAnimationFrame(updateContinuous.bind(this));
    }
    requestAnimationFrame(updateContinuous.bind(this));
  }

  /**
   * Updates the state of the app, and draws it to the canvas.
   * Called in requestAnimationFrame.
   */
  update() {
    Util.assert(arguments.length === 0);
    this.grid.update(this.mouseX, this.mouseY);
  }

  /**
   * Updates the this.mouseX and this.mouseY variables based on where the mouse is on the canvas
   * @param {PointerEvent} e - The touch or click event that contains the new "mouse" position
   */
  updateCanvasMousePosition(e) {
    Util.assert(arguments.length === 1);
    const currentRect = this.c.getBoundingClientRect(); // abs. size of element
    const scaleX = this.c.width / currentRect.width; // relationship bitmap vs. element for X
    const scaleY = this.c.height / currentRect.height; // relationship bitmap vs. element for Y

    const x = (e.clientX - currentRect.left) * scaleX;
    const y = (e.clientY - currentRect.top) * scaleY;

    // Update internal position
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * Resets the this.mouseX and this.mouseY variables.
   * Call this when the mouse leaves the canvas or the screen is not being touched.
   */
  resetCanvasMousePosition() {
    Util.assert(arguments.length === 0);
    // Update internal position
    this.mouseX = -1;
    this.mouseY = -1;
  }

  /**
   * Clears all notes from the grid and resets the sharing URL.
   */
  clear() {
    Util.assert(arguments.length === 0);
    this.grid.clearAllTiles();
    this.resetSharingURL(); // get rid of hash
  }

  /**
   * Sets whether the ToneMatrix application is muted.
   * @param {boolean} muted - True for muted, false for unmuted
   */
  setMuted(muted) {
    Util.assert(arguments.length === 1);
    this.grid.setMuted(muted);
  }

  /**
   * Writes encoded data to the "Share URL" input element on the screen.
   * @param {string} base64URLEncodedData - Base64, URL-encoded level savestate
   */
  setSharingURL(base64URLEncodedData) {
    Util.assert(arguments.length === 1);
    Util.assert(base64URLEncodedData);
    const params = new URLSearchParams({ v: '1', d: base64URLEncodedData });
    this.clipboardInputEl.value = `${this.originalURL}?${params}`;
  }

  /**
   * Resets the "Share URL" input element to the page's canonical URL.
   */
  resetSharingURL() {
    this.clipboardInputEl.value = this.originalURL;
  }

  setNotes(xx, yy) {
    let arming = null;
    const x = this.getXp(xx);
    const y = this.getYp(yy);
    const tile = Util.pixelCoordsToTileCoords(x, y, this.WIDTH, this.HEIGHT,
      this.c.width, this.c.height);
    if (arming === null) arming = true;
    this.grid.setTileValue(tile.x, tile.y, arming);
    // Update URL fragment
    const base64 = this.grid.toBase64();
    if (base64) this.setSharingURL(base64);
    else this.resetSharingURL();
    // Make sure audio context is running
    Tone.context.resume();
  }

  clearNotes(xx, yy) {
    const x = this.getXp(xx);
    const y = this.getYp(yy);
    const tile = Util.pixelCoordsToTileCoords(x, y, this.WIDTH, this.HEIGHT,
      this.c.width, this.c.height);
    this.grid.setTileValue(tile.x, tile.y, false);
    // this.grid.setTileValue(tile.x, tile.y, arming);
    // Update URL fragment
    const base64 = this.grid.toBase64();
    if (base64) this.setSharingURL(base64);
    else this.resetSharingURL();
    // Make sure audio context is running
    Tone.context.resume();
    /*
    let buff = 'x, y = ';
    buff += tile.x;
    buff += ', ';
    buff += tile.y;
    alert(buff);
    */
  }

  toggleNotes(x, y) {
    let arming = null;

    const tile = Util.pixelCoordsToTileCoords(x, y, this.WIDTH, this.HEIGHT,
      this.c.width, this.c.height);
    if (arming === null) arming = !this.grid.getTileValue(tile.x, tile.y);
    this.grid.setTileValue(tile.x, tile.y, arming);
    // Update URL fragment
    const base64 = this.grid.toBase64();
    if (base64) this.setSharingURL(base64);
    else this.resetSharingURL();
    // Make sure audio context is running
    Tone.context.resume();
  }

  getNotes(x, y) {
    let arming = null;

    const tile = Util.pixelCoordsToTileCoords(x, y, this.WIDTH, this.HEIGHT,
      this.c.width, this.c.height);
    if (arming === null) arming = this.grid.getTileValue(tile.x, tile.y);
    return arming;
  }

  clearNotesAll() {
    for (let ix = 0; ix < this.WIDTH; ix += 1) {
      for (let iy = 0; iy < this.HEIGHT; iy += 1) {
        this.grid.setTileValue(ix, iy, false);
      }
    }
  }

  getTextNote2(val) {
    this.setNotes(50, 50);
    return fetch(val)
      .then((response) => {
        response.text();
        return response.text();
      })
      .then((data) => {
        alert(data);
        return data.text();
      });
  }

  async getTextNote(val) {
    this.mouseX = -1;
    this.mouseY = -1;
    const response = await fetch(val);
    if (response.status === 200) {
      const data = await response.text();
      return data;
    }
    return null;
  }

  async setNoteFromFileFirst(val) {
    const xval = await this.getTextNote('x.val');
    const yval = await this.getTextNote('y.val');
    const xvals = xval.split(' ');
    const yvals = yval.split(' ');
    // const dx = this.c.width / this.WIDTH;
    // const dy = this.c.height / this.HEIGHT;
    if (xvals.length === yvals.length) {
      for (let i = 0; i < xvals.length; i += 1) {
        if (val === 1) {
          xvals[i] += 1;
          yvals[i] += 1;
        }
        if (val === 2) {
          xvals[i] += 1;
        }
        if (val === 3) {
          yvals[i] += 1;
        }
        if (val === 4) {
          xvals[i] -= 1;
          yvals[i] += 1;
        }
        if (val === 5) {
          xvals[i] += 1;
          yvals[i] -= 1;
        }
        if (val === 6) {
          xvals[i] -= 1;
          yvals[i] -= 1;
        }
        if (xvals[i] > (this.WIDTH - 1)) {
          xvals[i] = this.WIDTH - 1;
        }
        if (xvals[i] < 0) {
          xvals[i] = 0;
        }
        if (yvals[i] > (this.HEIGHT - 1)) {
          yvals[i] = this.HEIGHT - 1;
        }
        if (yvals[i] < 0) {
          yvals[i] = 0;
        }
      }
      for (let i = 0; i < xvals.length; i += 1) {
        const xx = parseInt(xvals[i], 10);
        const yy = parseInt(yvals[i], 10);
        this.setNotes(xx, yy);
      }
      Tone.Transport.start();
      Tone.context.resume();
      /*
      this.grid.clearAllTiles();
      */
    }
  }

  getXp(x) {
    const dx = this.c.width / this.WIDTH;
    const xx = parseInt(x, 10) * dx + dx * 0.001;
    return xx;
  }

  getYp(y) {
    const dy = this.c.height / this.HEIGHT;
    const yy = parseInt(y, 10) * dy + dy * 0.001;
    return yy;
  }

  async setNoteFromFileToggleNoClear() {
    const xval = await this.getTextNote('x.val');
    const yval = await this.getTextNote('y.val');
    const xvals = xval.split(' ');
    const yvals = yval.split(' ');
    // const dx = this.c.width / this.WIDTH;
    // const dy = this.c.height / this.HEIGHT;
    if (xvals.length === yvals.length) {
      for (let i = 0; i < xvals.length; i += 1) {
        if (xvals[i] > (this.WIDTH - 1)) {
          xvals[i] = this.WIDTH - 1;
        }
        if (xvals[i] < 0) {
          xvals[i] = 0;
        }
        if (yvals[i] > (this.HEIGHT - 1)) {
          yvals[i] = this.HEIGHT - 1;
        }
        if (yvals[i] < 0) {
          yvals[i] = 0;
        }
      }
      /*
      this.grid.clearAllTiles();
      */
      for (let i = 0; i < xvals.length; i += 1) {
        const xx = parseInt(xvals[i], 10);
        const yy = parseInt(yvals[i], 10);
        this.setNotes(xx, yy);
      }
      Tone.Transport.start();
      Tone.context.resume();
      /*
      this.grid.clearAllTiles();
      */
    }
  }

  async setNoteFromFile() {
    const xval = await this.getTextNote('x.val');
    const yval = await this.getTextNote('y.val');
    const xvals = xval.split(' ');
    const yvals = yval.split(' ');
    // const dx = this.c.width / this.WIDTH;
    // const dy = this.c.height / this.HEIGHT;
    if (xvals.length === yvals.length) {
      for (let i = 0; i < xvals.length; i += 1) {
        if (xvals[i] > (this.WIDTH - 1)) {
          xvals[i] = this.WIDTH - 1;
        }
        if (xvals[i] < 0) {
          xvals[i] = 0;
        }
        if (yvals[i] > (this.HEIGHT - 1)) {
          yvals[i] = this.HEIGHT - 1;
        }
        if (yvals[i] < 0) {
          yvals[i] = 0;
        }
      }
      // this.grid.clearAllTiles();
      this.clearNotesAll();
      for (let i = 0; i < xvals.length; i += 1) {
        const xx = parseInt(xvals[i], 10);
        const yy = parseInt(yvals[i], 10);
        this.setNotes(xx, yy);
      }
      Tone.Transport.start();
      Tone.context.resume();
      /*
      this.grid.clearAllTiles();
      */
    }
  }


  doSetTimer(val) {
    window.setInterval(() => { this.setNoteFromFile(); }, val);
  }
}
