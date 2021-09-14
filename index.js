class CanvasDrawingApp {
    #canvasPanel = new Canvas();
    #toolsPanel = new ToolsPanel();

    constructor() {
        this.build();
    }

    build() {
        this.#toolsPanel.addEventListener('strokeWidthChange', this.#onStrokeWidthChange);
        this.#toolsPanel.addEventListener('strokeColorChange', this.#onStrokeColorChange);
        this.#toolsPanel.addEventListener('clearClicked', this.#onClearClicked);
        this.#toolsPanel.addEventListener('destroyClicked', this.#onDestroyClicked);
    }

    destroy() {
        this.#toolsPanel.removeEventListener('strokeWidthChange', this.#onStrokeWidthChange);
        this.#toolsPanel.removeEventListener('strokeColorChange', this.#onStrokeColorChange);
        this.#toolsPanel.removeEventListener('clearClicked', this.#onClearClicked);
        this.#toolsPanel.removeEventListener('destroyClicked', this.#onDestroyClicked);
    }

    #onStrokeWidthChange = ((event) => {
        this.#canvasPanel.setup({strokeWidth: event.detail.strokeWidth});
    }).bind(this)

    #onStrokeColorChange = ((event) => {
        this.#canvasPanel.setup({strokeColor: event.detail.strokeColor});
    }).bind(this)

    #onClearClicked = (() => {
        this.#canvasPanel.clear();
    }).bind(this)

    #onDestroyClicked = (() => {
        this.destroy();
        this.#canvasPanel.destroy();
        this.#toolsPanel.destroy();
    }).bind(this)
}

class ToolsPanel extends EventTarget {
    #containerNode;
    #colorPickerNode;
    #strokeWidthNode;
    #clearButtonNode;
    #destroyButtonNode;

    #strokeWidth = 10
    #strokeColor = '#000000'

    constructor() {
        super();

        this.build();
    }

    build() {
        this.#containerNode = document.createElement('div');
        this.#containerNode.id = 'cdPanel_container';
        this.#containerNode.style.assign({
            position: 'absolute',
            top: 0,
            right: '10px',

            'background-color': '#FFFFFF',
            'border-width': '2px',
            'border-radius': '25px'
        });
        document.body.appendChild(this.#containerNode);

        this.#strokeWidthNode = document.createElement('input');
        this.#strokeWidthNode.id = 'cdPanel_strokeWidth'
        this.#strokeWidthNode.style.assign({
            margin: '8px 15px',
            height: '20px',
            'border-color': 'white'
        });
        this.#strokeWidthNode.type = 'number';
        this.#strokeWidthNode.value = this.#strokeWidth;
        this.#strokeWidthNode.addEventListener('change', this.#onStrokeWidthChanged);
        this.#containerNode.appendChild(this.#strokeWidthNode);

        this.#colorPickerNode = document.createElement('input');
        this.#colorPickerNode.id = 'cdPanel_colorPicker'
        this.#colorPickerNode.style.assign({
            margin: '8px 15px 8px 0',
            height: '20px',
            'border-color': 'white'
        });
        this.#colorPickerNode.type = 'color';
        this.#colorPickerNode.value = this.#strokeColor;
        this.#colorPickerNode.addEventListener('change', this.#onStrokeColorChanged);
        this.#containerNode.appendChild(this.#colorPickerNode);

        this.#clearButtonNode = document.createElement('input');
        this.#clearButtonNode.id = 'cdPanel_clearButton'
        this.#clearButtonNode.style.assign({
            margin: '8px 15px 8px 0',
            height: '20px',
        });
        this.#clearButtonNode.type = 'button';
        this.#clearButtonNode.value = 'Clear';
        this.#clearButtonNode.addEventListener('click', this.#onClearClicked);
        this.#clearButtonNode.addEventListener('touchstart', this.#onClearClicked);
        this.#containerNode.appendChild(this.#clearButtonNode);

        this.#destroyButtonNode = document.createElement('input');
        this.#destroyButtonNode.id = 'cdPanel_destroyButton'
        this.#destroyButtonNode.style.assign({
            margin: '8px 15px 8px 0',
            height: '20px',
        });
        this.#destroyButtonNode.type = 'button';
        this.#destroyButtonNode.value = 'Destroy';
        this.#destroyButtonNode.addEventListener('click', this.#onDestroyClicked);
        this.#destroyButtonNode.addEventListener('touchstart', this.#onDestroyClicked);
        this.#containerNode.appendChild(this.#destroyButtonNode);
    }

    destroy() {
        this.#strokeWidthNode.removeEventListener('change', this.#onStrokeWidthChanged);
        this.#colorPickerNode.removeEventListener('change', this.#onStrokeColorChanged);
        this.#clearButtonNode.removeEventListener('click', this.#onClearClicked);
        this.#clearButtonNode.removeEventListener('touchstart', this.#onClearClicked);
        this.#destroyButtonNode.removeEventListener('click', this.#onDestroyClicked);
        this.#destroyButtonNode.removeEventListener('touchstart', this.#onDestroyClicked);

        this.#containerNode.parentNode.removeChild(this.#containerNode);
    }

    #onStrokeWidthChanged = ((event) => {
        this.#strokeWidth = event.target.value;

        this.dispatchEvent(new CustomEvent('strokeWidthChange', { detail: { strokeWidth: this.#strokeWidth } }));
    }).bind(this)

    #onStrokeColorChanged = ((event) => {
        this.#strokeColor = event.target.value;

        this.dispatchEvent(new CustomEvent('strokeColorChange', { detail: { strokeColor: this.#strokeColor } }));
    }).bind(this)

    #onClearClicked = (() => {
        this.dispatchEvent(new CustomEvent('clearClicked'));
    }).bind(this)

    #onDestroyClicked = (() => {
        this.dispatchEvent(new CustomEvent('destroyClicked'));
    }).bind(this)
}

class Canvas extends EventTarget {
    #canvasNode;
    #canvasContext;

    #isDrawing;

    #strokeWidth = 10;
    #strokeColor = '#000000';

    constructor() {
        super();

        this.build()
    }

    build() {
        this.#canvasNode = document.createElement('canvas');
        this.#canvasNode.id = 'cdCanvas';
        this.#canvasNode.height = window.outerHeight;
        this.#canvasNode.width = window.outerWidth;
        this.#canvasNode.style.assign({
            position: 'absolute',
            top: 0,
            right: 0
        });
        this.#canvasNode.addEventListener('mousedown', this.#onPointerDown);
        this.#canvasNode.addEventListener('touchstart', this.#onPointerDown);
        this.#canvasNode.addEventListener('mouseup', this.#onPointerUp);
        this.#canvasNode.addEventListener('touchend', this.#onPointerUp);
        this.#canvasNode.addEventListener('mousemove', this.#onPointerMove);
        this.#canvasNode.addEventListener('touchmove', this.#onPointerMove);
        document.body.appendChild(this.#canvasNode);

        this.#canvasContext = this.#canvasNode.getContext('2d');
    }

    destroy() {
        this.#canvasNode.removeEventListener('mousedown', this.#onPointerDown);
        this.#canvasNode.removeEventListener('touchstart', this.#onPointerDown);
        this.#canvasNode.removeEventListener('mouseup', this.#onPointerUp);
        this.#canvasNode.removeEventListener('touchend', this.#onPointerUp);
        this.#canvasNode.removeEventListener('mousemove', this.#onPointerMove);
        this.#canvasNode.removeEventListener('touchmove', this.#onPointerMove);

        this.#canvasNode.parentNode.removeChild(this.#canvasNode);
    }

    setup({strokeColor, strokeWidth}) {
        if (strokeColor) this.#strokeColor = strokeColor;
        if (strokeWidth) this.#strokeWidth = strokeWidth;
    }

    clear() {
        this.#canvasContext.clearRect(0, 0, this.#canvasNode.width, this.#canvasNode.height);
    }

    #onPointerDown = ((event) => {
        this.#isDrawing = true;
        this.#canvasContext.moveTo(event.clientX, event.clientY);
        this.#canvasContext.beginPath();
        this.#canvasContext.lineWidth = this.#strokeWidth;
        this.#canvasContext.strokeStyle = this.#strokeColor;
        this.#canvasContext.lineJoin = this.#canvasContext.lineCap = 'round';
    }).bind(this)

    #onPointerUp = (() => {
        this.#isDrawing = false;
        this.#canvasContext.stroke
    }).bind(this)

    #onPointerMove = ((event) => {
        if (this.#isDrawing === true) {
            this.#canvasContext.lineTo(event.clientX, event.clientY);
            this.#canvasContext.stroke();
        }
    }).bind(this)
}

CSSStyleDeclaration.prototype.assign = function (styles) {
    Object.assign(this, styles);
};

new CanvasDrawingApp();