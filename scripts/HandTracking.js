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

    //Lookup WorldSphere in the scene
    const [WorldSphere] = await Promise.all([
        Scene.root.findFirst('WorldSphere'),
    ]);

    // Bind the visibility of the spheres to the hand tracking state
    WorldSphere.hidden = hand0.isTracked.not();

    // Bind the rotation of the spheres to the hand positions
    WorldSphere.transform.rotationY = hand0.boundingBox.x.mul(Math.PI);


})(); // Enable async/await in JS [part 2]