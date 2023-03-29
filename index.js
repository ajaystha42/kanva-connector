var width = window.innerWidth;
var height = window.innerHeight;
var GUIDELINE_OFFSET = 5;
var rects = [];

var stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

// first generate random rectangles
// for (var i = 0; i < 5; i++) {
//   layer.add(
//     new Konva.Rect({
//       x: Math.random() * stage.width(),
//       y: Math.random() * stage.height(),
//       width: 50 + Math.random() * 50,
//       height: 50 + Math.random() * 50,
//       fill: Konva.Util.getRandomColor(),
//       // rotation: Math.random() * 360,
//       draggable: true,
//       name: "object",
//     })
//   );
// }

var rect1 = new Konva.Rect({
  x: 20,
  y: 60,
  width: 150,
  height: 150,
  fill: "black",
  // rotation: Math.random() * 360,
  draggable: true,
  name: "object",
});

var rect2 = new Konva.Rect({
  x: 20,
  y: 400,
  width: 100,
  height: 200,
  fill: "red",
  // rotation: Math.random() * 360,
  draggable: true,
  name: "object",
});

var rect3 = new Konva.Rect({
  x: 300,
  y: 20,
  width: 150,
  height: 50,
  fill: "blue",
  // rotation: Math.random() * 360,
  draggable: true,
  name: "object",
});

var rect4 = new Konva.Rect({
  x: 400,
  y: 200,
  width: 120,
  height: 350,
  fill: "green",
  // rotation: Math.random() * 360,
  draggable: true,
  name: "object",
});

var arrow = new Konva.Arrow({
  points: [rect3.getX(), rect3.getY(), rect4.getX(), rect4.getY()],
  pointerLength: 10,
  pointerWidth: 10,
  fill: "black",
  stroke: "black",
  strokeWidth: 4,
});

layer.add(rect1);
layer.add(rect2);
layer.add(rect3);
layer.add(rect4);
layer.add(arrow);

function adjustPoint(e) {
  var p = [rect3.getX(), rect3.getY(), rect4.getX(), rect4.getY()];
  arrow.setPoints(p);
  layer.draw();
}

function createArrow(rect1, rect2) {
  var arrow = new Konva.Arrow({
    points: [rect1.getX(), rect1.getY(), rect2.getX(), rect2.getY()],
    pointerLength: 10,
    pointerWidth: 10,
    fill: "black",
    stroke: "black",
    strokeWidth: 4,
  });
  layer.add(arrow);
  layer.draw();
  rects = [];
}

rect3.on("dragmove", adjustPoint);

rect4.on("dragmove", adjustPoint);

rect1.addEventListener("dblclick", function () {
  console.log("rect 1 double click");
  // Get references to both rectangles
  rects.push(rect1);
  console.log({ rects });
  //   const rect1Ref = document.getElementById("rect1");
  //   const rect2Ref = document.getElementById("rect2");

  //   // Call createArrow method with the two rectangles as arguments
  //   createArrow(rect1Ref, rect2Ref);
});

// Listen for double click events on rect2
rect2.addEventListener("dblclick", function () {
  rects.push(rect2);
  console.log({ rects });
  if (rects.length == 2) {
    createArrow(rects[0], rects[1]);
    console.log("length is 2");
  }

  // Get references to both rectangles
  //   const rect1Ref = document.getElementById("rect1");
  //   const rect2Ref = document.getElementById("rect2");

  // Call createArrow method with the two rectangles as arguments
  //   createArrow(rect1Ref, rect2Ref);
});
console.log({ rects });

// were can we snap our objects?
function getLineGuideStops(skipShape) {
  // we can snap to stage borders and the center of the stage
  var vertical = [0, stage.width() / 2, stage.width()];
  var horizontal = [0, stage.height() / 2, stage.height()];

  // and we snap over edges and center of each object on the canvas
  stage.find(".object").forEach((guideItem) => {
    if (guideItem === skipShape) {
      return;
    }
    var box = guideItem.getClientRect();
    // and we can snap to all edges of shapes
    vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
    horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
  });
  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };
}

// what points of the object will trigger to snapping?
// it can be just center of the object
// but we will enable all edges and center
function getObjectSnappingEdges(node) {
  var box = node.getClientRect();
  var absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: "start",
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: "center",
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: "end",
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: "start",
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: "center",
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: "end",
      },
    ],
  };
}

// find all snapping possibilities
function getGuides(lineGuideStops, itemBounds) {
  var resultV = [];
  var resultH = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      // if the distance between guild line and object snap point is close we can consider this for snapping
      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      var diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide: lineGuide,
          diff: diff,
          snap: itemBound.snap,
          offset: itemBound.offset,
        });
      }
    });
  });

  var guides = [];

  // find closest snap
  var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: "V",
      snap: minV.snap,
    });
  }
  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: "H",
      snap: minH.snap,
    });
  }
  return guides;
}

function drawGuides(guides) {
  guides.forEach((lg) => {
    if (lg.orientation === "H") {
      var line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: "rgb(0, 161, 255)",
        strokeWidth: 1,
        name: "guid-line",
        dash: [4, 6],
      });
      layer.add(line);
      line.absolutePosition({
        x: 0,
        y: lg.lineGuide,
      });
    } else if (lg.orientation === "V") {
      var line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: "rgb(0, 161, 255)",
        strokeWidth: 1,
        name: "guid-line",
        dash: [4, 6],
      });
      layer.add(line);
      line.absolutePosition({
        x: lg.lineGuide,
        y: 0,
      });
    }
  });
}

layer.on("dragmove", function (e) {
  // clear all previous lines on the screen
  layer.find(".guid-line").forEach((l) => l.destroy());

  // find possible snapping lines
  var lineGuideStops = getLineGuideStops(e.target);
  // find snapping points of current object
  var itemBounds = getObjectSnappingEdges(e.target);

  // now find where can we snap current object
  var guides = getGuides(lineGuideStops, itemBounds);

  // do nothing of no snapping
  if (!guides.length) {
    return;
  }

  drawGuides(guides);

  var absPos = e.target.absolutePosition();
  // now force object position
  guides.forEach((lg) => {
    switch (lg.snap) {
      case "start": {
        switch (lg.orientation) {
          case "V": {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case "H": {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
        break;
      }
      case "center": {
        switch (lg.orientation) {
          case "V": {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case "H": {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
        break;
      }
      case "end": {
        switch (lg.orientation) {
          case "V": {
            absPos.x = lg.lineGuide + lg.offset;
            break;
          }
          case "H": {
            absPos.y = lg.lineGuide + lg.offset;
            break;
          }
        }
        break;
      }
    }
  });
  e.target.absolutePosition(absPos);
});

layer.on("dragend", function (e) {
  // clear all previous lines on the screen
  layer.find(".guid-line").forEach((l) => l.destroy());
});
