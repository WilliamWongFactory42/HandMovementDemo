// Load in the required modules
const Scene = require('Scene');
const Reactive = require('Reactive');
const CameraInfo = require('CameraInfo');
const HandTracking = require('HandTracking');
const Diagnostics = require('Diagnostics');

// Get the screen size dimensions
const previewSizeWidth = CameraInfo.previewSize.
    width.div(CameraInfo.previewScreenScale);

const previewSizeHeight = CameraInfo.previewSize.
    height.div(CameraInfo.previewScreenScale);


// Create a reference to the detected hands
const hand0 = HandTracking.hand(0);
const hand1 = HandTracking.hand(1);

// Create a reference to the number of tracked hands
const handCount = HandTracking.count;

const TEXTURE_SCALE = 1.2;

(async function () { // Enable async/await in JS [part 1]

    //print a message to make sure the script is loaded
    Diagnostics.log('Hand Tracking script loaded');


    // Locate the rectangles in the scene  
    const [
        rect_hand0,
        rect_hand1,
        rect_betweenhands
    ] = await Promise.all([
        Scene.root.findFirst('rect_hand0'),
        Scene.root.findFirst('rect_hand1'),
        Scene.root.findFirst('rect_betweenhands')
    ]);

    // Create references to the hand bounding boxes
    const bb0 = hand0.boundingBox;
    const bb1 = hand1.boundingBox;

    // Find the top left of the bounding boxes relative to the screen size
    const scaledX0 = bb0.x.mul(previewSizeWidth);
    const scaledY0 = bb0.y.mul(previewSizeHeight);

    const scaledX1 = bb1.x.mul(previewSizeWidth);
    const scaledY1 = bb1.y.mul(previewSizeHeight);

    // Bind the position of the rectangles to the bounding box positions
    rect_hand0.transform.x = scaledX0;
    rect_hand0.transform.y = scaledY0;

    rect_hand1.transform.x = scaledX1;
    rect_hand1.transform.y = scaledY1;

    // Bind the rectangle dimensions to the bounding box dimensions
    // relative to the screen size
    rect_hand0.width = bb0.width.mul(previewSizeWidth);
    rect_hand0.height = bb0.height.mul(previewSizeHeight);

    rect_hand1.width = bb1.width.mul(previewSizeWidth);
    rect_hand1.height = bb1.height.mul(previewSizeHeight);

    // Show each rectangle only when its respective hand is tracked
    // To test this, preview on a device
    rect_hand0.hidden = hand0.isTracked.not();
    rect_hand1.hidden = hand1.isTracked.not();

    // Find the midpoint between the hands
    const scaleRect = rect_betweenhands.width.div(2.0);

    const midPosX = bb0.center.x.add(bb1.center.x).div(2.0).
        mul(previewSizeWidth).sub(scaleRect);

    const midPosY = bb0.center.y.add(bb1.center.y).div(2.0).
        mul(previewSizeHeight).sub(scaleRect);

    // Find the distance between the hands, and allow for a 
    // scale factor depending on the texture
    const scaled0 = Reactive.pack2(scaledX0, scaledY0);
    const scaled1 = Reactive.pack2(scaledX1, scaledY1);
    const handDistance = scaled0.distance(scaled1);
    const scaledHandDistance = handDistance.mul(TEXTURE_SCALE);

    // Set position and scale of the rectangle between the hands
    rect_betweenhands.transform.x = midPosX;
    rect_betweenhands.transform.y = midPosY;
    rect_betweenhands.transform.scaleX = rect_betweenhands.transform.
        scaleY = scaledHandDistance;

    // Show the rectangle between hands only when both hands are tracked
    // To test this, preview on a device
    rect_betweenhands.hidden = handCount.lt(2);

    // Determine left and right hands
    const leftHandCenterX = Reactive.min(bb0.center.x, bb1.center.x);
    const rightHandCenterX = Reactive.max(bb0.center.x, bb1.center.x);

    const leftHandCenterY = Reactive.lt(bb0.center.x, bb1.center.x).
        ifThenElse(bb0.center.y, bb1.center.y);

    const rightHandCenterY = Reactive.gt(bb0.center.x, bb1.center.x).
        ifThenElse(bb0.center.y, bb1.center.y);

    // Calculate and set angle between hands
    const angleBetweenHands = Reactive.atan2(leftHandCenterX.
        sub(rightHandCenterX), leftHandCenterY.
            sub(rightHandCenterY));

    rect_betweenhands.transform.rotationZ = angleBetweenHands.add(Math.PI / 2);

    // Mirror left hand image
    rect_hand0.transform.scaleX = bb0.center.x.eq(leftHandCenterX).
        ifThenElse(1, -1);

    rect_hand1.transform.scaleX = bb1.center.x.eq(leftHandCenterX).
        ifThenElse(1, -1);


})(); // Enable async/await in JS [part 2]