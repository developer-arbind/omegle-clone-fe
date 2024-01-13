import React, { useCallback, useEffect, useRef, useState } from "react"
import { socketInstance } from "../socket/socket";
import { useNavigate } from "react-router";
import ReactPlayer from 'react-player'
import Peer from "../peer/Peer";
import { useDispatch, useSelector } from "react-redux";
function Text(){
    const [isConnected, setIsConnected] = useState(false);
    const isWaiting = useRef(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const isStreamingOn = useSelector(state => state.updateIsStreaming);
    const bothVideoAndText = useRef(isStreamingOn.yes);
    const interests = useRef(useSelector(state => state.updateInterest));
    const PeerConnection = useRef(new Peer());
    console.log(isStreamingOn, bothVideoAndText);
    const [myStream, setMyStream] = useState();
    const streamRef = useRef();
    const [user2Stream, setUser2Stream] = useState();
    const [onlinePeoples, setOnlinePeoples] = useState(0);
    const [texts, setTexts] = useState([{
        random: ""
    }]);
    const setTracks = useCallback(() => {
        console.log('by: ', streamRef.current);
        for(let track of streamRef.current.getTracks()){
            PeerConnection.current.peer.addTrack(track, streamRef.current);
            console.log('Peer: ', PeerConnection.current.peer);
        }
    }, [streamRef.current]);
    async function makeStream(){
        const stream = await navigator.mediaDevices.getUserMedia(({audio: true, video: true}));
        console.log(stream);
        streamRef.current = stream;
        setMyStream(stream);
        // setTracks();
    }
    const getOffer = async () => {
        const offer = await PeerConnection.current.getOffer();
        console.log(offer);
        socketInstance.emit('send:offer', {user2: userSockerId.current, offer})
    }
    const userSockerId = useRef(null);
    const socketId = useSelector(state => state.updateSocketId);
    const history = useNavigate();
    const {isAgreedTerms, isAgreedAgeVerification} = useSelector(state => state.updateInitial)
    useEffect(() => {
        if(isAgreedAgeVerification && isAgreedTerms) socketInstance.emit('join:room')
        else history("/")
    }, [])
    const startNewServer = async() => {
        isWaiting.current = true;
        socketInstance.emit('wait:on:queue');
        if(!PeerConnection.current.peer){
            PeerConnection.current = new Peer();
        }
        console.log('PeerConnection: ', PeerConnection.current);
        setTexts([]);
    };
    const getRemoteTracks = useCallback((event) => {
        const user2StreamConnection = event.streams;
        console.log('second person track: ', user2StreamConnection[0]);
        setUser2Stream(user2StreamConnection[0]);
    }, [])

    const makeNegotiation = useCallback(async ()=> {
        console.log('./');
            const offer = await PeerConnection.current.getOffer();
            console.log('negotiation needed offer: ', offer);
            socketInstance.emit('send:negotiation', {user2: userSockerId.current, offer })
    }, [])
    useEffect(() => {
        PeerConnection.current.peer.addEventListener('track', getRemoteTracks)
        PeerConnection.current.peer.addEventListener('negotiationneeded', makeNegotiation)
        return () => {
            PeerConnection.current.peer.removeEventListener('track',getRemoteTracks);
            PeerConnection.current.peer.removeEventListener('negotiationneeded', makeNegotiation);
        }
    }, [])
   
    useEffect(() => {
        socketInstance.on('who:is:on:queue', user2 => {
            console.log('cheking for user: ' + user2);
            if(isWaiting.current){
                socketInstance.emit('is:already:talked', user2);
            }
        })

        socketInstance.on("get:negotiation", async (offer) => {
            const ans = await PeerConnection.current.connectRemoteOffer(offer);
            socketInstance.emit('negotiation:done', {user2: userSockerId.current, ans});
        })
        socketInstance.on('get:remote:offer', async offer => {
            const answer = await PeerConnection.current.connectRemoteOffer(offer);
            console.log('remote offer: ', offer);
            socketInstance.emit("send:answer", {ans: answer, user2: userSockerId.current});
        })
        socketInstance.on('activate:remote:stream', () => {
            console.log('webrtc connected with: user2');
        })
        socketInstance.on('send:track:to:user2', () => setTracks());
        socketInstance.on('get:negotiation:ans', async ans => {
            console.log('heres the asf: ',ans);
            await PeerConnection.current.setRemoteDescription(ans);
            socketInstance.emit('track:ready', userSockerId.current);
        })
        
        socketInstance.on('user:disconnect:from:server', size => {
            setOnlinePeoples(size);
        })

        socketInstance.on('online:peoples', size => {
            setOnlinePeoples(size);
        })
        socketInstance.on('get:remote:ans', async remoteAnwser => {
            await PeerConnection.current.setRemoteDescription(remoteAnwser);
            console.log('remote ans: ', remoteAnwser);
            socketInstance.emit('send:active:stream', ({user2: userSockerId.current}))
            console.log('webrtc connected with: user2');
            // makeStreamForUser2();
            setTracks();
        })
        socketInstance.on('user:joined', async (user2) => {
            userSockerId.current = user2;
            console.log("you joined with: + " + user2);
            isWaiting.current = false;
            setIsConnected(true);
        })
        socketInstance.on('you:joined', async user2 => {
            userSockerId.current = user2;
            isWaiting.current = false;
            console.log("you joined with: " + user2);
           
            if(bothVideoAndText.current){
                getOffer();
            }
            setIsConnected(true);
           
        })
        socketInstance.on('user:tpying', () => {
            console.log("user typing");
            setIsTyping(true);
        })
        socketInstance.on('get:text', text => { 
            
            console.log(text); 
             setTexts(prev => [...prev, {random: text}])
        })
        socketInstance.on('console:text', () => {

            console.log(arrayOfTexts.current);
        })
        socketInstance.on('user:disconnect', () => {
            setDefault();
            alert("stranger disconnected")
        })
        socketInstance.on('stoped:typing', () => {
            setIsTyping(false);
        })
    }, [])
    const disconnectUser = user2 => {
        socketInstance.emit('user:disconnect', user2);
        setDefault();
    }
    function setDefault (){
        if(bothVideoAndText){
            PeerConnection.current.disconnect();
            PeerConnection.current = new Peer();
            setUser2Stream(null);
        }
        userSockerId.current = null;
        setIsConnected(false);
    }
    const sendTxt = text => {
        console.log("userSockerId: ", userSockerId.current);
        console.log("socketId: ", socketId);
        socketInstance.emit('send:text', {text, roomId: userSockerId.current })
        setTexts(prev => [...prev, {random: text}])
}

    function setInputWithDebounce(e){
        setInput(e.target.value);
        socketInstance.emit('typing', userSockerId.current);
        debounce();
    }

    function debounce() {
        let interval;
        let prevInput = '';
        
        interval = setInterval(() => {
            if (input !== prevInput) {
              prevInput = input;
            } else {
              clearInterval(interval);
              socketInstance.emit("user:stopped:typing", userSockerId.current)
            }
          }, 800)
      }
      useEffect(() => {
        makeStream()
        socketInstance.emit('updateNumber');
      }, [])
    return (
        <div>
            <h1>number of peoples online: {onlinePeoples}</h1>
            <div className="messages"> 
                {
                    texts.map((e, i) => {
                        return <div key={i}>
                            <div className="txt">{e.random}</div>
                        </div>
                    })
                }
            </div>
            <p id="typing">{isTyping ? 'stranger typing...' : ''}</p>
            <div className="text">
                <button onClick={startNewServer}>New Server</button>
                <button onClick={() => disconnectUser(userSockerId.current)}>{isConnected ? 'Disconnect' : 'Not connected yet.'}</button>
            </div>

            <div className="send-txt">
                <input type="text" value={input} onChange={(e) => setInputWithDebounce(e)}/>
                <button id="send" onClick={() => sendTxt(input)}>send</button>
            </div>


            {bothVideoAndText.current && (
                <div>
                    <ReactPlayer url={myStream} playing/>
                    {user2Stream ? <ReactPlayer url={user2Stream} playing/> : <p>no one here!</p>}
                </div>
            )}
        </div>
    )
}
export default Text