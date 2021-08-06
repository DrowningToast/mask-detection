import Head from "next/head";
import Image from "next/image";
import { useRef } from "react";
import styles from "../styles/Home.module.css";
import { load, Webcam } from "@teachablemachine/image";
import axios from "axios";

export default function Home() {
  //MQTT Host

  const maskURL = "https://teachablemachine.withgoogle.com/models/zCaCWmipY/";
  const faceURL = "https://teachablemachine.withgoogle.com/models/S2Mm5toxP/";

  let maskModel, webcam, maskMaxPredictions, faceModel, faceMaxPredictions;

  let maskStatusPrediction = "None";
  let faceStatusPrediction = "None";
  const webcamContainer = useRef(null);
  const labelContainer = useRef(null);
  const faceContainer = useRef(null);

  const sendInfo = async ({ className, probability }) => {
    const response = await axios.post("/api/sendDetection", {
      className,
      probability,
    });
    return new Promise((resolve, reject) => {
      // console.log(response);
      if (response) resolve(response);
      reject("error has been occured");
    });
  };

  // Load the image model and setup the webcam
  async function init() {
    const maskModelURL = maskURL + "model.json";
    const maskMetadataURL = maskURL + "metadata.json";
    const faceModelURL = faceURL + "model.json";
    const faceMetadataURL = faceURL + "model.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    maskModel = await load(maskModelURL, maskMetadataURL);
    maskMaxPredictions = maskModel.getTotalClasses();

    faceModel = await load(faceModelURL, faceMetadataURL);
    faceMaxPredictions = maskModel.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window?.requestAnimationFrame(loop);

    // append elements to the DOM
    webcamContainer.current.appendChild(webcam.canvas);

    for (let i = 0; i < maskMaxPredictions; i++) {
      // and class labels
      labelContainer.current.appendChild(document.createElement("div"));
    }

    for (let i = 0; i < faceMaxPredictions; i++) {
      // and class labels
      faceContainer.current.appendChild(document.createElement("div"));
    }
  }

  async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window?.requestAnimationFrame(loop);
  }

  // run the webcam image through the image model
  async function predict() {
    // predict can take in an image, video or canvas html element
    const maskPrediction = await maskModel.predict(webcam.canvas);
    for (let i = 0; i < maskMaxPredictions; i++) {
      const classPrediction =
        maskPrediction[i].className +
        ": " +
        maskPrediction[i].probability.toFixed(2);
      labelContainer.current.childNodes[i].innerHTML = classPrediction;
    }
    const facePrediction = await faceModel.predict(webcam.canvas);
    facePrediction[0].className = "David";
    facePrediction[1].className = "Gus";
    facePrediction[2].className = "None";
    for (let i = 0; i < faceMaxPredictions; i++) {
      const classPrediction =
        facePrediction[i].className +
        ": " +
        facePrediction[i].probability.toFixed(2);
      faceContainer.current.childNodes[i].innerHTML = classPrediction;
    }
    maskPrediction.forEach((predict) => {
      if (
        predict.probability > 0.98 &&
        predict.className != maskStatusPrediction
      ) {
        maskStatusPrediction = predict.className;
        sendInfo(predict)
          .then((res) => {
            // console.log(res);
            alert(res.data.reply);
          })
          .catch((err) => {
            alert(err);
          });
      }
    });
    facePrediction.forEach((predict) => {
      if (
        predict.probability > 0.925 &&
        predict.className != faceStatusPrediction
      ) {
        faceStatusPrediction = predict.className;
      }
    });
  }

  // console.log(mqtt);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className="titlemachine">Teachable Machine Image Model</div>
        <button type="button" onClick={() => init()}>
          Start
        </button>
        <div ref={webcamContainer} id="webcam-container"></div>
        <div ref={labelContainer} id="label-container"></div>
        <div ref={faceContainer} id="facec-contianer"></div>
      </main>
    </div>
  );
}
