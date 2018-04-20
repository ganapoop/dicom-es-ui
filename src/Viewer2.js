import React, { Component } from 'react';
import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import * as cornerstoneWADOImageLoader from "cornerstone-web-image-loader";
// import exampleImageIdLoader from "./exampleImageIdLoader";


// const imageId =
//   "https://rawgit.com/cornerstonejs/cornerstoneWebImageLoader/master/examples/Renal_Cell_Carcinoma.jpg";

// const divStyle = {
//   width: "512px",
//   height: "512px",
//   position: "relative",
//   color: "white"
// };

// const bottomLeftStyle = {
//   bottom: "5px",
//   left: "5px",
//   position: "absolute",
//   color: "white"
// };

// const bottomRightStyle = {
//   bottom: "5px",
//   right: "5px",
//   position: "absolute",
//   color: "white"
// };

var config = {
  webWorkerPath : 'https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js',
  taskConfiguration: {
      'decodeTask' : {
          codecsPath: 'https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js'
      }
  }
};


class Viewer2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dicomImage: null,
      // stack: props.stack,
      viewport: cornerstone.getDefaultViewport(null, undefined),
      // imageId: props.stack.imageIds[0]
    };
    
    // this.onImageRendered = this.onImageRendered.bind(this);
    // this.onNewImage = this.onNewImage.bind(this);
    // this.onWindowResize = this.onWindowResize.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.enableTool = this.enableTool.bind(this);
    this.activate = this.activate.bind(this);
    this.disableAllTools = this.disableAllTools.bind(this);
    this.dicomImageRef = this.dicomImageRef.bind(this);
  }
  
  componentWillMount() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    // cornerstoneWebImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
    cornerstoneTools.external.Hammer = Hammer;
  }

  componentDidMount() {
    this.loadImage()
  }

  loadImage() {
    const element = this.state.dicomImage;

    function onImageRendered(e) {
      const viewport = cornerstone.getViewport(e.target);
      console.log('got viewport:', viewport);
      document.getElementById(
        "mrbottomleft"
      ).textContent = `WW/WC: ${Math.round(
        viewport.voi.windowWidth
      )}/${Math.round(viewport.voi.windowCenter)}`;
      document.getElementById(
        "mrbottomright"
      ).textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
    }

    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    const config = {
      // invert: true,
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true
    };
    cornerstoneTools.zoom.setConfiguration(config);
    document.getElementById("chkshadow").addEventListener("change", function() {
      cornerstoneTools.length.setConfiguration({ shadow: this.checked });
      cornerstoneTools.angle.setConfiguration({ shadow: this.checked });
      cornerstone.updateImage(element);
    });

    const imageId = this.props.imageId;
    cornerstone.enable(element);
    cornerstone.loadImage(imageId).then(image => {
      cornerstone.displayImage(element, image);

      const stack = this.props.stack;
      cornerstoneTools.addStackStateManager(element, ["stack"]);
      cornerstoneTools.addToolState(element, "stack", stack);

      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      // // Enable all tools we want to use with this element
      cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
      cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
      cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
      cornerstoneTools.probe.enable(element);
      cornerstoneTools.length.enable(element);
      cornerstoneTools.ellipticalRoi.enable(element);
      cornerstoneTools.rectangleRoi.enable(element);
      cornerstoneTools.angle.enable(element);
      cornerstoneTools.highlight.enable(element);
      this.activate("enableWindowLevelTool");
    });
  }

  enableTool(toolName, mouseButtonNumber) {
    this.activate(toolName);
    this.disableAllTools();
    console.log('logging tools', cornerstoneTools[toolName]);
    cornerstoneTools[toolName].activate(this.state.dicomImage, mouseButtonNumber);
  }

  activate(id) {
    this.setState({ activeTool: id });
  }
  // helper function used by the tool button handlers to disable the active tool
  // before making a new tool active
  disableAllTools() {
    cornerstoneTools.wwwc.disable(this.state.dicomImage);
    cornerstoneTools.pan.activate(this.state.dicomImage, 2); // 2 is middle mouse button
    cornerstoneTools.zoom.activate(this.state.dicomImage, 4); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(this.state.dicomImage, 1);
    cornerstoneTools.length.deactivate(this.state.dicomImage, 1);
    cornerstoneTools.ellipticalRoi.deactivate(this.state.dicomImage, 1);
    cornerstoneTools.rectangleRoi.deactivate(this.state.dicomImage, 1);
    cornerstoneTools.angle.deactivate(this.state.dicomImage, 1);
    cornerstoneTools.highlight.deactivate(this.state.dicomImage, 1);
    cornerstoneTools.freehand.deactivate(this.state.dicomImage, 1);
  }

  dicomImageRef(el) {
    this.state.dicomImage = el;
  }

  render() {
    return (
      <div className="container">
      <div className="page-header">
        <h1>React Cornerstone DICOM Viewer</h1>
      </div>
      <br />
      <div className="row">
        <div className="col-3">
          <ul className="list-group">
            <button
              onClick={() => {
                this.enableTool("wwwc", 1);
              }}
              className="list-group-item"
            >
              WW/WC
            </button>
            <button
              onClick={() => {
                this.enableTool("pan", 3);
              }}
              className="list-group-item"
            >
              Pan
            </button>
            <button
              onClick={() => {
                this.enableTool("zoom", 5);
              }}
              className="list-group-item"
            >
              Zoom
            </button>
            <button
              onClick={() => {
                this.enableTool("length", 1);
              }}
              className="list-group-item"
            >
              Length
            </button>
            <button
              onClick={() => {
                this.enableTool("probe", 1);
              }}
              className="list-group-item"
            >
              Probe
            </button>
            <button
              onClick={() => {
                this.enableTool("ellipticalRoi", 1);
              }}
              className="list-group-item"
            >
              Elliptical ROI
            </button>
            <button
              onClick={() => {
                this.enableTool("rectangleRoi", 1);
              }}
              className="list-group-item"
            >
              Rectangle ROI
            </button>
            <button
              onClick={() => {
                this.enableTool("angle", 1);
              }}
              className="list-group-item"
            >
              Angle
            </button>
            <button
              onClick={() => {
                this.enableTool("highlight", 1);
              }}
              className="list-group-item"
            >
              Highlight
            </button>
            <button
              onClick={() => {
                this.enableTool("freehand", 1);
              }}
              className="list-group-item"
            >
              Freeform ROI
            </button>
          </ul>
          <div className="checkbox">
            <label htmlFor="chkshadow">
              <input type="checkbox" id="chkshadow" />Apply shadow
            </label>
          </div>
          <br />
        </div>
        <div className="col-9">
          <div
            style={{
              width: 512,
              height: 512,
              position: "relative",
              display: "inline-block",
              color: "white"
            }}
            onContextMenu={() => false}
            className="cornerstone-enabled-image"
            unselectable="on"
            onSelectStart={() => false}
            onMouseDown={() => false}
          >
            <div
              ref={this.dicomImageRef}
              style={{
                width: 512,
                height: 512,
                top: 0,
                left: 0,
                position: "absolute"
              }}
            />
            <div
              id="mrtopleft"
              style={{ position: "absolute", top: 3, left: 3 }}
            >
              Patient Name
            </div>
            <div
              id="mrtopright"
              style={{ position: "absolute", top: 3, right: 3 }}
            >
              Hospital
            </div>
            <div
              id="mrbottomright"
              style={{ position: "absolute", bottom: 3, right: 3 }}
            >
              Zoom:
            </div>
            <div
              id="mrbottomleft"
              style={{ position: "absolute", bottom: 3, left: 3 }}
            >
              WW/WC:
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <h3>Functionality</h3>
          <ul>
            <li>
              Activation of a tool for the left mouse button
              <ul>
                <li>
                  WW/WC - Adjust the window width and window center of the
                  image (activated by default)
                </li>
                <li>Pan - Pan the image</li>
                <li>Zoom - Zoom the image</li>
                <li>Length - Length measurement tool</li>
                <li>
                  Probe - Display the image x,y coordinate under cursor as
                  well as the pixel value (stored pixel and modality)
                </li>
                <li>
                  Elliptical ROI - An elliptical ROI that shows mean, stddev
                  and area
                </li>
                <li>
                  Rectangle ROI - A rectangular ROI that shows mean, stddev
                  and area
                </li>
                <li>
                  Highlight - Darkens the image around a rectangular ROI
                </li>
                <li>Angle - Cobb angle tool</li>
              </ul>
            </li>
            <li>Use the activated tool by dragging the left mouse button</li>
            <li>Pan by dragging the middle mouse button</li>
            <li>Zoom by dragging the right mouse button</li>
            <li>Zoom by rolling the mouse wheel</li>
            <li>
              Tool dragging - left click drag on any measurement tool line to
              move it
            </li>
            <li>
              Tool deletion - left click drag on any measurement tool line and
              drop it off the image to delete it
            </li>
            <li>
              Tool handles - left click drag on any measurement tool handle
              (the circle) to change the handles position
            </li>
          </ul>
        </div>
      </div>
    </div>
    );
  }

  // render() {
  //   return (
  //     <div>
  //       <div
  //         className="viewportElement"
  //         style={divStyle}
  //         ref={input => {
  //           this.element = input;
  //         }}
  //       >
  //         <canvas className="cornerstone-canvas" />
  //       </div>
  //       <div style={bottomLeftStyle}>Zoom: {this.state.viewport.zoom}</div>
  //       <div style={bottomRightStyle}>
  //         WW/WC: {this.state.viewport.voi.windowWidth} /{" "}
  //         {this.state.viewport.voi.windowCenter}
  //       </div>
  //     </div>
  //   );
  // }

  // onWindowResize() {
  //   console.log("onWindowResize");
  //   cornerstone.resize(this.element);
  // }

  // onImageRendered() {
  //   const viewport = cornerstone.getViewport(this.element);
  //   console.log(viewport);

  //   this.setState({
  //     viewport
  //   });

  //   console.log(this.state.viewport);
  // }

  // onNewImage() {
  //   const enabledElement = cornerstone.getEnabledElement(this.element);

  //   this.setState({
  //     imageId: enabledElement.image.imageId
  //   });
  // }

  // componentDidMount() {
  //   const element = this.element;

  //   // Enable the DOM Element for use with Cornerstone
  //   cornerstone.enable(element);

  //   // Load the first image in the stack
  //   cornerstone.loadImage(this.state.imageId).then(image => {
  //     // Display the first image
  //     cornerstone.displayImage(element, image);

  //     // Add the stack tool state to the enabled element
  //     const stack = this.props.stack;
  //     cornerstoneTools.addStackStateManager(element, ["stack"]);
  //     cornerstoneTools.addToolState(element, "stack", stack);

  //     cornerstoneTools.mouseInput.enable(element);
  //     cornerstoneTools.mouseWheelInput.enable(element);
  //     cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
  //     cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
  //     cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
  //     cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel

  //     cornerstoneTools.touchInput.enable(element);
  //     cornerstoneTools.panTouchDrag.activate(element);
  //     cornerstoneTools.zoomTouchPinch.activate(element);

  //     element.addEventListener(
  //       "cornerstoneimagerendered",
  //       this.onImageRendered
  //     );
  //     element.addEventListener("cornerstonenewimage", this.onNewImage);
  //     window.addEventListener("resize", this.onWindowResize);
  //   });
  // }

  // componentWillUnmount() {
  //   const element = this.element;
  //   element.removeEventListener(
  //     "cornerstoneimagerendered",
  //     this.onImageRendered
  //   );

  //   element.removeEventListener("cornerstonenewimage", this.onNewImage);

  //   window.removeEventListener("resize", this.onWindowResize);

  //   cornerstone.disable(element);
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   const stackData = cornerstoneTools.getToolState(this.element, "stack");
  //   const stack = stackData.data[0];
  //   stack.currentImageIdIndex = this.state.stack.currentImageIdIndex;
  //   stack.imageIds = this.state.stack.imageIds;
  //   cornerstoneTools.addToolState(this.element, "stack", stack);

  //   //const imageId = stack.imageIds[stack.currentImageIdIndex];
  //   //cornerstoneTools.scrollToIndex(this.element, stack.currentImageIdIndex);
  // }
}

export default Viewer2;

