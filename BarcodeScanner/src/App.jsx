import {useEffect, useRef} from "react";

function App() {

  const video = useRef(null)
  const canvas = useRef(null)

  const openCam = () => {
      navigator.mediaDevices.getUserMedia({video: {width: 1280, height: 720}})
          .then(stream => {
              video.current.srcObject = stream;
              video.current.play()

              const ctx = canvas.current.getContext("2d")

              if (!('BarcodeDetector' in window)) {
                  console.error('Tarayıcınız Barcode Detector API\'sini desteklemiyor.');
              }
              else {
                  const barcode = new window.BarcodeDetector({formats: ["qr_code", "ean_13"]});
              }

              setInterval(() => {
                  canvas.current.width = video.current.videoWidth
                  canvas.current.height = video.current.videoHeight
                  ctx.drawImage(video.current, 0, 0, video.current.videoWidth, video.current.videoHeight);
                  barcode.detect(canvas.current)
                      .then(([data])=>{console.log(data)})
                      .catch((err)=>{console.log(err)})
              }, 100)


          })
          .catch(err => console.log(err))
  }


  return (
    <>
        <button onClick={openCam}>kamerayı aç</button>
        <div>
            <video ref={video} autoPlay muted hidden/>
            <canvas ref={canvas}/>
        </div>
    </>
  )
}

export default App
