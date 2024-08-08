import './App.css';
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from '@zxing/library';

function App() {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [barcodeScans, setBarcodeScans] = useState([]);
    const [error, setError] = useState(null);
    const webcamRef = useRef(null);

    const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

    const startScanning = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                fetch(imageSrc)
                    .then(res => res.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imageDataUrl = e.target.result;
                            codeReader.decodeFromImageUrl(imageDataUrl)
                                .then(result => {
                                    setBarcodeScans((prevScans) => [...prevScans, result.text]);
                                    setError(null);
                                })
                                .catch(err => {
                                    console.error('Barcode scan error:', err);
                                    setError("Barcode scan error: " + err.message);
                                });
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(error => {
                        console.error('Error fetching image:', error);
                        setError("Error fetching image: " + error.message);
                    });
            }
        }
    }, [codeReader]);

    useEffect(() => {
        if (isCameraOpen) {
            const interval = setInterval(() => {
                startScanning();
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isCameraOpen, startScanning]);

    const handleOpenCamera = () => {
        setIsCameraOpen(true);
    };

    const handleCloseCamera = () => {
        setIsCameraOpen(false);
    };

    return (
        <div className="App" style={{ padding: "5rem 10rem" }}>
            {!isCameraOpen ? (
                <button onClick={handleOpenCamera}>Open Camera</button>
            ) : (
                <div>
                    <button onClick={handleCloseCamera}>Close Camera</button>
                    <Webcam
                        audio={false}
                        height={500}
                        width={500}
                        screenshotFormat="image/jpeg"
                        ref={webcamRef}
                        videoConstraints={{
                            facingMode: "environment",
                        }}
                    />
                </div>
            )}
            <div>
                <h3>Scanned Barcodes:</h3>
                <ul>
                    {barcodeScans.map((barcode, index) => (
                        <li key={index}>{barcode}</li>
                    ))}
                </ul>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default App;
