/* eslint-disable */
var annotationStrokeEnum = {
    color: {
        white: {
            name: 'white',
            value: 'FFFFFF'
        },
        yellow: {
            name: 'yellow',
            value: 'FFFF00'
        },
        red: {
            name: 'red',
            value: 'FF0000'
        },
        cyan: {
            name: 'cyan',
            value: '00FFFF'
        },
        black: {
            name: 'black',
            value: '000000'
        }
    },
    width: {
        thin: 0.5,
        normal: 2,
        thick: 5
    },
    text: {
        font: 'Roboto'
    }
};
annotationStrokeEnum.defaultColor = annotationStrokeEnum.color.cyan.name;
annotationStrokeEnum.defaultWidth = annotationStrokeEnum.width.normal;

/* eslint-enable */

export function annotationBuilder(disabled, filePath, onMouseUp, fullVideoFrame) {
    var fabricText;
    var resizeTimeout = 200; // Milliseconds
    var undoIndex = 0;
    var redoIndex = 0;
    var redoList = [];
    var drawingText = false;
    var drawingArrow = false;
    const arrowThickness = 2;
    const colorPrefix = '#';
    const firstZoomSlope = 2.94118;
    const firstZoomIntercept = 0.97059;
    const secondZoomSlope = 2;
    const secondZoomIntercept = 0.5;
    const clearOldMessage = '0,0,3';
    const annotationZIndex = '2';
    var zoomIndex = 1;
    var textParam = {
        x: 0,
        y: 0,
        width: 150,
        size: 48,
        text: ''
    };
    var annotationActionType = {
        begin: 0,
        draw: 1,
        end: 2,
        clear: 3,
        color: 4,
        arrow: 6,
        text: 7,
        undo: 8,
        redo: 9,
        zoom: 10
    };
    var videoFrameFullView = fullVideoFrame ? document.getElementById(fullVideoFrame) :
        document.getElementsByClassName('full-view-frame')[0];
    var thisCanvas = new fabric.Canvas('annotation-canvas', {isDrawingMode: true});
    thisCanvas.setHeight(videoFrameFullView.clientHeight);
    thisCanvas.setWidth(videoFrameFullView.clientWidth);
    fabric.Object.prototype.selectable = false;
    thisCanvas.isDrawingMode = !disabled;
    thisCanvas.setZoom(1);
    thisCanvas.freeDrawingBrush.width = annotationStrokeEnum.defaultWidth;
    thisCanvas.freeDrawingBrush.color = colorPrefix + annotationStrokeEnum.color.cyan.value;

    var queryString = '?name=';
    var name = filePath.substring(filePath.indexOf(queryString) + queryString.length, filePath.length);
    filePath = filePath.replace('api.', '');

    // replacing airsuite-live. with airsuite. so that the subdomains match between airhub and the annotation url
    // Before: https://airsuite-live.atheerair.com/annotation
    // After: https://airsuite.atheerair.com/annotation
    filePath = filePath.replace('airsuite-live.', 'airsuite.');
    filePath = filePath.substring(0, filePath.indexOf('api/Files'));
    filePath = filePath + 'annotation' + queryString + name;

    thisCanvas.setBackgroundImage(filePath, thisCanvas.renderAll.bind(thisCanvas), {
        width: thisCanvas.width,
        height: thisCanvas.height,
        originX: 'left',
        originY: 'top',
        crossOrigin: 'anonymous'
    });
    var canvasContainer = document.getElementsByClassName('canvas-container')[0];
    if (canvasContainer) {
        canvasContainer.style.zIndex = annotationZIndex;
        canvasContainer.style.margin = 'auto';
    }

    if (disabled === false) {
        thisCanvas.on('path:created', function (event) {
            endDrawing(event.path);
        });
        thisCanvas.on('object:modified', function (event) {
            onAddText(event.target);
        });
        thisCanvas.on('mouse:up', function (event) {
            checkText();
            if (drawingText) {
                var pointer = thisCanvas.getPointer(event.e);
                textParam.x = pointer.x;
                textParam.y = pointer.y;
                addText(true);
            }
        });
        thisCanvas.on('object:added', function () {
            objectAdded();
        });
        document.addEventListener('keydown', function (event) {
            if (drawingText) {
                event.preventDefault();
                setText(event.key);
            }
        });
    }

    window.addEventListener('resize', function () {
        onResize();
    });

    fabric.LineArrow = fabric.util.createClass(fabric.Line, {
        type: 'lineArrow',
        initialize: function (element, options) {
            options = options || {};
            this.callSuper('initialize', element, options);
        },

        toObject: function () {
            return fabric.util.object.extend(this.callSuper('toObject'));
        },

        _render: function (ctx) {
            this.callSuper('_render', ctx);

            if (this.width === 0 || this.height === 0 || !this.visible) {
                return;
            }

            ctx.save();

            var xDiff = this.x2 - this.x1;
            var yDiff = this.y2 - this.y1;
            var angle = Math.atan2(yDiff, xDiff);
            ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-20, 15);
            ctx.lineTo(-20, -15);
            ctx.closePath();
            ctx.fillStyle = this.stroke;
            ctx.fill();

            ctx.restore();
        }
    });

    fabric.LineArrow.fromObject = function (object, callback) {
        if (callback) {
            callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
        }
    };

    fabric.LineArrow.async = true;

    var Arrow = (function () {
        function Arrow(canvas) {
            this.canvas = canvas;
            this.className = 'Arrow';
            this.isDrawing = false;
            this.bindEvents();
        }

        Arrow.prototype.bindEvents = function () {
            var instance = this;
            instance.canvas.on('mouse:down', function (o) {
                instance.onMouseDown(o);
            });
            instance.canvas.on('mouse:move', function (o) {
                instance.onMouseMove(o);
            });
            instance.canvas.on('mouse:up', function (o) {
                instance.onMouseUp(o);
            });
            instance.canvas.on('object:moving', function () {
                instance.disable();
            });
        };

        Arrow.prototype.onMouseUp = function () {
            if (drawingArrow) {
                var instance = this;
                instance.disable();
                var body = [];
                var arrow = thisCanvas._objects[thisCanvas._objects.length - 1];
                body.push(setBody(annotationActionType.arrow, 0, {
                    tx: getCoordinates(arrow.x2, thisCanvas.width),
                    ty: getCoordinates(arrow.y2, thisCanvas.height),
                    atx: getCoordinates(arrow.x1, thisCanvas.width),
                    aty: getCoordinates(arrow.y1, thisCanvas.height),
                    sx: getCoordinates(arrow.width, thisCanvas.width),
                    sy: getCoordinates(arrow.height, thisCanvas.height),
                    w: arrowThickness
                }));
                sendAnnotationMessage('', {d: body});
            }
        };

        Arrow.prototype.onMouseMove = function (o) {
            if (drawingArrow) {
                var instance = this;
                if (!instance.isEnable()) {
                    return;
                }

                var pointer = thisCanvas.getPointer(o.e);
                var activeObj = thisCanvas.getActiveObject();
                activeObj.set({
                    x2: pointer.x,
                    y2: pointer.y
                });
                activeObj.setCoords();
                thisCanvas.renderAll();
            }
        };

        Arrow.prototype.onMouseDown = function (o) {
            if (drawingArrow) {
                var instance = this;
                instance.enable();
                var pointer = instance.canvas.getPointer(o.e);

                var points = [pointer.x, pointer.y, pointer.x, pointer.y];
                var line = new fabric.LineArrow(points, {
                    strokeWidth: arrowThickness,
                    fill: 'rgba(0,0,0,0)',
                    stroke: thisCanvas.freeDrawingBrush.color,
                    originX: 'center',
                    originY: 'center',
                    hasBorders: false,
                    hasControls: false,
                    selectable: false
                });
                instance.canvas.add(line).setActiveObject(line);
            }
        };

        Arrow.prototype.isEnable = function () {
            return this.isDrawing;
        };

        Arrow.prototype.enable = function () {
            this.isDrawing = true;
        };

        Arrow.prototype.disable = function () {
            this.isDrawing = false;
        };

        return Arrow;
    })();
    /* eslint-disable */
    var arrow = new Arrow(thisCanvas);
    /* eslint-enable */
    return {
        clear: clear,
        draw: drawData,
        setColor: setColor,
        onUndoClick: onUndoClick,
        onRedoClick: onRedoClick,
        onAddTextClick: onAddTextClick,
        onSetStrokeClick: onSetStrokeClick,
        onAddArrowClick: onAddArrowClick,
        onZoomClick: onZoomClick,
        goToPoint: goToPoint,
        onSaveAnnotationToAsset: onSaveAnnotationToAsset
    };

    function clearCanvas() {
        for (let i = thisCanvas._objects.length - 1; i >= 0; i--) {
            thisCanvas.remove(thisCanvas._objects[i]);
        }
        undoIndex = 0;
        redoIndex = 0;
        redoList = [];
    }

    function clear() {
        clearCanvas();
        var body = [];
        body.push(setBody(annotationActionType.clear, 0, {}));
        sendAnnotationMessage(clearOldMessage, {d: body});
    }

    function drawData(data) {
        drawViewModeAnnotation(data);
    }

    function endDrawing(data) {
        if (thisCanvas.isDrawingMode) {
            var path = '';
            var newPath = [];
            var drawingPath = data.path;
            for (var j = 0; j < drawingPath.length; j++) {
                var res = drawingPath[j];
                if (res && res.length >= 3) {
                    var tx = getCoordinates(res[1], thisCanvas.width);
                    var ty = getCoordinates(res[2], thisCanvas.height);
                    if (res[0] === 'M') {
                        newPath.push([res[0], tx, ty]);
                        path = path + tx + ',' + ty + ',0\n';
                    } else if (res[0] === 'L') {
                        newPath.push([res[0], tx, ty]);
                        path = path + '0,0,2\n';
                    } else {
                        var otherPath = [res[0]];
                        for (var k = 1; k < res.length; k = k + 2) {
                            tx = getCoordinates(res[k], thisCanvas.width);
                            ty = getCoordinates(res[k + 1], thisCanvas.height);
                            path = path + tx + ',' + ty + ',1\n';
                            otherPath.push(tx);
                            otherPath.push(ty);
                        }
                        newPath.push(otherPath);
                    }
                }
            }
            sendAnnotationMessage(path, {
                d: [setBody(annotationActionType.draw, 0, {
                    w: thisCanvas.freeDrawingBrush.width,
                    path: newPath
                })]
            });
        }
    }

    function setBody(action, id, params) {
        return {
            a: action,
            id: id,
            p: params
        };
    }

    function drawViewModeAnnotation(body) {
        var pointLines = body.d;
        pointLines.forEach(function (line) {
            var actionType = parseInt(line.a);
            switch (actionType) {
                case annotationActionType.draw:
                    thisCanvas.freeDrawingBrush.width = parseFloat(line.p.w);
                    drawLineFromPoints(line.p.path);
                    break;
                case annotationActionType.clear:
                    clearCanvas();
                    break;
                case annotationActionType.color:
                    thisCanvas.freeDrawingBrush.color = colorPrefix + line.p.c;
                    break;
                case annotationActionType.arrow:
                    addArrow(line.p.atx * thisCanvas.width, line.p.aty * thisCanvas.height, line.p.tx * thisCanvas.width, line.p.ty * thisCanvas.height);
                    break;
                case annotationActionType.text:
                    textParam.x = line.p.tx * thisCanvas.width;
                    textParam.y = line.p.ty * thisCanvas.height;

                    var fontSizeFromHeight = line.p.tsh * videoFrameFullView.clientHeight;
                    var fontSizeFromWidth = line.p.tsw * videoFrameFullView.clientWidth;

                    textParam.size = (fontSizeFromHeight + fontSizeFromWidth) / 2;
                    textParam.width = line.p.w;
                    textParam.text = line.p.t;
                    addText(false);
                    break;
                case annotationActionType.undo:
                    undo();
                    break;
                case annotationActionType.redo:
                    redo();
                    break;
                case annotationActionType.zoom:
                    zoom(line.p.z);
                    setZoomLimits(line.p.zx, line.p.zy);
                    break;
                default:
                    break;
            }
        });
    }

    function drawLineFromPoints(values) {
        var pathString = '';
        values.forEach(function (path) {
            if (path.length > 0) {
                pathString += path[0] + ' ';
                for (var k = 1; k < path.length; k = k + 2) {
                    var x = parseFloat(path[k]) * thisCanvas.width;
                    var y = parseFloat(path[k + 1]) * thisCanvas.height;
                    pathString += x + ' ' + y + ' ';
                }
            }
        });
        var freeDraw = new fabric.Path(pathString);
        freeDraw.set({
            fill: null,
            stroke: thisCanvas.freeDrawingBrush.color,
            opacity: 1,
            strokeWidth: thisCanvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            originX: 'left',
            originY: 'top',
            selectable: false
        });
        thisCanvas.add(freeDraw);
        thisCanvas.renderAll();
        objectAdded();
    }

    function onUndoClick() {
        if (undoIndex > 0) {
            undo();
            var body = [];
            body.push(setBody(annotationActionType.undo, 0, {}));
            sendAnnotationMessage('', {d: body});
        }
    }

    function onRedoClick() {
        if (redoIndex > 0) {
            redo();
            var body = [];
            body.push(setBody(annotationActionType.redo, 0, {}));
            sendAnnotationMessage('', {d: body});
        }
    }

    function goToPoint(position) {
        setZoomLimits(position.x, position.y);
        sendZoom(position);
    }

    function setZoomLimits(x, y) {
        x = x * thisCanvas.width;
        y = y * thisCanvas.height;
        if (zoomIndex === 1 || x === 0 || y === 0) {
            x = 0;
            y = 0;
        } else if (zoomIndex === 1.5) {
            x = ((firstZoomSlope * x) - (firstZoomIntercept * thisCanvas.width)) / 2;
            y = ((firstZoomSlope * y) - (firstZoomIntercept * thisCanvas.height)) / 2;
        } else if (zoomIndex === 2) {
            x = (secondZoomSlope * x) - (secondZoomIntercept * thisCanvas.width);
            y = (secondZoomSlope * y) - (secondZoomIntercept * thisCanvas.height);
        }
        thisCanvas.absolutePan(new fabric.Point(x, y));
        thisCanvas.renderAll();
        setTimeout(function () {
            if (zoomIndex === 1) {
                thisCanvas.viewportTransform[4] = 0;
                thisCanvas.viewportTransform[5] = 0;
            } else if (zoomIndex === 1.5) {
                thisCanvas.viewportTransform[4] = Math.max(thisCanvas.viewportTransform[4], -thisCanvas.width / 2);
                thisCanvas.viewportTransform[5] = Math.max(thisCanvas.viewportTransform[5], -thisCanvas.height / 2);
            } else if (zoomIndex === 2) {
                thisCanvas.viewportTransform[4] = Math.max(thisCanvas.viewportTransform[4], -thisCanvas.width);
                thisCanvas.viewportTransform[5] = Math.max(thisCanvas.viewportTransform[5], -thisCanvas.height);
            }
            thisCanvas.renderAll();
        }, resizeTimeout);
    }

    function onAddTextClick() {
        drawingText = !drawingText;
        thisCanvas.isDrawingMode = !drawingText;
        drawingArrow = false;
        checkText();
    }

    function onSetStrokeClick(width) {
        drawingText = false;
        drawingArrow = false;
        thisCanvas.isDrawingMode = true;
        thisCanvas.freeDrawingBrush.width = width;
        checkText();
    }

    function onAddArrowClick() {
        drawingText = false;
        drawingArrow = !drawingArrow;
        thisCanvas.isDrawingMode = !drawingArrow;
        thisCanvas.selection = false;
        checkText();
    }

    function onZoomClick(value) {
        zoom(value);
    }

    function setColor(color) {
        checkText();
        thisCanvas.freeDrawingBrush.color = colorPrefix + color;
        var body = [];
        body.push(setBody(annotationActionType.color, 0, {
            c: color
        }));
        sendAnnotationMessage('', {d: body});
    }

    function undo() {
        endText();
        thisCanvas._activeObject = null;
        var popped = thisCanvas._objects.pop();
        popped.canvasWidth = thisCanvas.width;
        popped.canvasHeight = thisCanvas.height;
        redoList.push(popped);
        redoIndex++;
        undoIndex--;
        thisCanvas.renderAll();
    }

    function redo() {
        endText();
        thisCanvas._activeObject = null;
        var popped = redoList.pop();
        var scaleWidthMultiplier = thisCanvas.width / popped.canvasWidth;
        var scaleHeightMultiplier = thisCanvas.height / popped.canvasHeight;
        popped.scaleX = popped.scaleX * scaleWidthMultiplier;
        popped.scaleY = popped.scaleY * scaleHeightMultiplier;
        popped.left = popped.left * scaleWidthMultiplier;
        popped.top = popped.top * scaleHeightMultiplier;
        popped.setCoords();
        thisCanvas._objects.push(popped);
        redoIndex--;
        undoIndex++;
        thisCanvas.renderAll();
    }

    function getCoordinates(a, b) {
        return Math.round((a / b) * 1000) / 1000;
    }

    function objectAdded() {
        redoIndex = 0;
        redoList = [];
        undoIndex++;
    }

    function addText(local) {
        fabricText = new fabric.IText(textParam.text, {
            fontFamily: annotationStrokeEnum.text.font,
            left: textParam.x,
            top: textParam.y,
            fill: thisCanvas.freeDrawingBrush.color,
            fontSize: textParam.size,
            textAlign: 'left',
            fixedWidth: textParam.width,
            selectable: false,
            editable: false,
            hasRotatingPoint: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false
        });
        thisCanvas.add(fabricText);
        if (local) {
            thisCanvas.setActiveObject(fabricText);
            fabricText.enterEditing();
            thisCanvas._activeObject = thisCanvas._objects[thisCanvas._objects.length - 1];
        } else {
            objectAdded();
        }
    }

    function setText(value) {
        var text = '';
        if (thisCanvas._activeObject) {
            text = thisCanvas._activeObject.text;
            if (value.toLowerCase() === 'enter') {
                text = thisCanvas._activeObject.text + '\n';
            } else if (value.toLowerCase() === 'backspace') {
                text = thisCanvas._activeObject.text.slice(0, -1);
            } else if (value.length <= 1) {
                text = thisCanvas._activeObject.text + value;
            }
        }

        thisCanvas._activeObject.setText(text);
        textParam.text = thisCanvas._activeObject.text;
        thisCanvas.renderAll();
    }

    function onAddText(textObject) {
        if (textObject.text && textObject.text !== '' && textParam.text !== '') {
            var body = [];
            body.push(setBody(annotationActionType.text, 0, {
                t: textObject.text,
                tx: getCoordinates(textObject.left, thisCanvas.width),
                ty: getCoordinates(textObject.top, thisCanvas.height),
                ts: textParam.size,
                w: textParam.width,
                tsh: textParam.size / videoFrameFullView.clientHeight,
                tsw: textParam.size / videoFrameFullView.clientWidth
            }));
            sendAnnotationMessage('', {d: body});
        }
    }

    function endText() {
        if (fabricText) {
            fabricText.exitEditing();
        }
        thisCanvas._activeObject = null;
        var lastObject = thisCanvas._objects[thisCanvas._objects.length - 1];
        if (lastObject && lastObject.text === '') {
            thisCanvas._objects.pop();
            undoIndex--;
        }
        textParam.text = '';
        textParam.x = 0;
        textParam.y = 0;
    }

    function addArrow(atx, aty, tx, ty) {
        var points = [atx, aty, tx, ty];
        var line = new fabric.LineArrow(points, {
            strokeWidth: arrowThickness,
            fill: 'rgba(0,0,0,0)',
            stroke: thisCanvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false
        });
        thisCanvas.add(line);
        objectAdded();
    }

    function sendZoom(position) {
        var body = [];
        body.push(setBody(annotationActionType.zoom, 0, {
            z: zoomIndex,
            zx: position.x,
            zy: position.y
        }));
        sendAnnotationMessage('', {d: body});
    }

    function zoom(value) {
        // Set the zoom index value before calling goToPoint
        // to ensure the device receive the correct zoom index.
        zoomIndex = value;
        if (value === 1) {
            goToPoint({x: 0.5, y: 0.5});
        }
        thisCanvas.setZoom(value);
    }

    function onResize() {
        var newWidth = videoFrameFullView.clientWidth;
        var newHeight = videoFrameFullView.clientHeight;
        if (thisCanvas.width != newWidth || thisCanvas.height != newHeight) {
            var scaleWidthMultiplier = newWidth / thisCanvas.width;
            var scaleHeightMultiplier = newHeight / thisCanvas.height;
            var objects = thisCanvas.getObjects();
            for (var i in objects) {
                objects[i].scaleX = objects[i].scaleX * scaleWidthMultiplier;
                objects[i].scaleY = objects[i].scaleY * scaleHeightMultiplier;
                objects[i].left = objects[i].left * scaleWidthMultiplier;
                objects[i].top = objects[i].top * scaleHeightMultiplier;
                objects[i].setCoords();
            }
            var obj = thisCanvas.backgroundImage;
            if (obj) {
                obj.scaleX = obj.scaleX * scaleWidthMultiplier;
                obj.scaleY = obj.scaleY * scaleHeightMultiplier;
            }

            thisCanvas.discardActiveObject();
            thisCanvas.setWidth(thisCanvas.getWidth() * scaleWidthMultiplier);
            thisCanvas.setHeight(thisCanvas.getHeight() * scaleHeightMultiplier);
            thisCanvas.renderAll();
            thisCanvas.calcOffset();
        }
    }

    function sendAnnotationMessage(oldData, newData) {
        if (onMouseUp) {
            onMouseUp(oldData, newData);
        }
    }

    function onSaveAnnotationToAsset() {
        return thisCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    }

    function checkText() {
        if (textParam.text !== '') {
            endText();
        }
    }
}
