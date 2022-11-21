//Get camera video
const constraints = {
    audio: false,
    video: {
        width: {min: 640, ideal: 640, max: 640},
        height: {min: 480, ideal: 480, max: 480}
    }
};

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        document.getElementById("myVideo").srcObject = stream;
        console.log("Got local user video");

    })
    .catch(err => {
        console.log('navigator.getUserMedia error: ', err)
    });

