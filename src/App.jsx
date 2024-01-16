import { useEffect, useState } from "react";
import { socketInstance } from "./socket/socket";
import { useDispatch } from "react-redux";

import { useNavigate } from "react-router";

function App() {
  const history = useNavigate();
  const dispatch = useDispatch();
  const [showDilog, setShowDiolog] = useState(false);
  const [textOrVideo, setTextOrVideo] = useState("room");
  const [typedInterest, setTypedInterest] = useState("");
  useEffect(() => {
    socketInstance.on("connected", (id) => {
      console.log("Socket id: ", id);
      dispatch({
        type: "updatesocketid",
        payload: id,
      });
    });
  }, []);
  function agree() {
    dispatch({
      type: "markagreed",
      payload: {
        isAgreedTerms: true,
        isAgreedAgeVerification: true,
      },
    });
    if (textOrVideo === "video") {
      dispatch({
        type: "isStreaming",
        payload: {
          yes: true,
        },
      });
    }
    if (typedInterest) {
      dispatch({
        type: "interest-context",
        payload: {
          context: typedInterest.toLowerCase().trim(),
        },
      });
    }
    history("/room");
    console.log("agreed");
  }
  function exit() {
    setShowDiolog(false);
  }
  return (
    <div>
      <h1>This is OMEGLE CLONE WITH VIDEO AND TEXT CHAT SUPPORT. working accress all over the world. thank you!</h1>
      <button
        id="text"
        onClick={() => {
          setShowDiolog(true);
        }}
style={
          {
            marginLeft: "30px",
            marginRight: "10px"
          }
        }
      >
        Text
      </button>
      <button
        id="video"
        onClick={() => {
          setTextOrVideo("video");
          setShowDiolog(true);
        }}
      >
        Video
      </button>
      <hr />
      <label htmlFor="interest">Type your interest: (OPTIONAL)</label>
      <input type="text" name="" id="" placeholder="girls" value={typedInterest} onChange={e => setTypedInterest(e.target.value)}/>
      {showDilog && (
        <div id="agreement">
          YOU MUST BE 18 OR OLDER TO USE OMEGLE. See Omegle’s Terms of Service
          for more info. Parental control protections that may assist parents
          are commercially available and you can find more info at
          https://www.connectsafely.org/controls/ as well as other sites.
          <button id="agree" onClick={agree}>
            Agree
          </button>
          <button id="go-back" onClick={exit}>
            Exit
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
