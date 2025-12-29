// import React from "react";
// import { useEffect, useRef, useState } from "react";
// import "../styles/videoComponent.css";
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import { io } from "socket.io-client";




// const server_url = "http://localhost:8000";

// var connections = {};

// const peerconfigConnections = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" }
//   ]
// };

// export default function VideoMeetComponent() {

//   var socketRef = useRef();
//   let socketIdRef = useRef();
//   let localVideoRef = useRef();

//   let [audioAvailable, setAudioAvailable] = useState(true);
//   let [videoAvailable, setVideoAvailable] = useState(true);
//   let [video, setvideo] = useState();
//   let [audio, setAudio] = useState();
//   let [screen, setScreen] = useState();
//   let [showModal, setModal] = useState();
//   let [screenAvailable, setScreenAvailable] = useState();

//   let [messages, setMessages] = useState([]);
//   let [message, setMessage] = useState("");
//   let [newMessage, setNewMessage] = useState(0);

//   let [askForUsername, setAskForUsername] = useState(true);
//   let [username, setUsername] = useState("");
//   let [users, setUsers] = useState([]);
//   let mySocketId = useRef("");


//   const videoRef = useRef([]);
//   let [videos, setVideos] = useState([]);

//   // ===== FIXED PERMISSIONS (minimal change) =====
//   const getPermissions = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       setVideoAvailable(true);
//       setAudioAvailable(true);
//       setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

//       getUserMediaSuccess(stream); // attach stream immediately

//     } catch (err) {
//       console.log(err);
//       setVideoAvailable(false);
//       setAudioAvailable(false);
//     }
//   };

//   useEffect(() => {
//     getPermissions();
//   }, []);

//   // ===== UNCHANGED =====
//   let getUserMediaSuccess = (stream) => {
//     // try{
//     //   if(window.localStream){
//     //   window.localStream.getTracks().forEach(track=>track.stop())
//     //   }
//     // }catch(e){console.log(e)}

//     window.localStream=stream;
//     if (localVideoRef.current){
//      localVideoRef.current.srcObject=stream;
//     }
//     for(let id in connections){
//       if(id===socketIdRef.current)continue;
//       connections[id].addStream(window.localStream)

//       connections[id].createOffer().then((description)=>{
//         connections[id].setLocalDescription(description)
//         .then(()=>{
//           socketIdRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
//         })
//         .catch(e=>console.log(e))

//       })
//     }
//     stream.getTracks().forEach(track=>track.onended=()=>{
//       setvideo(false)
//       setAudio(false);

//       try{
//         let tracks=localVideoRef.current.srcObject.getTracks()
//         tracks.forEach(track=>track.stop())
//       }catch(e) {console.log(e)}

//       let blackSilence=(...args)=>new MediaStream([black(...args),silence()]);
//       window.localStream=blackSilence();
//       localVideoRef.current.srcObject=window.localStream




//       for (let id in connections){
//         connections[id].addStream(window.localstream)
//         connections[id].createOffer().then((description)=>{
//           connections[id].setLocalDescription(description)
//           .then(()=>{
//             socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
//           }).catch(e=>console.log(e))
//         })
//       }
//     })
//   };

//   let silence=()=>{
//     let ctx=new AudioContext()
//     let oscillator=ctx.createOscillator();

//     let dst=oscillator.connect(ctx.createMediaStreamDestination());
//     oscillator.start();
//     ctx.resume()
//     return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
//   }

//   let black=({width=640,height=480}={})=>{
//     let canvas=Object.assign(document.createElement("canvas"),{width,height});

//     canvas.getContext('2D').fillRect(0,0,width,height);
//     let screen=canvas.captureStream();
//     return Object.assign(screen.getvideoTracks()[0],{enabled:false})


//   }

//   // ===== UNCHANGED (used later for toggles) =====
//   let getUserMedia = () => {
//     if (video !== undefined && audio !== undefined) {
//       navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//         .then(getUserMediaSuccess)
//         .catch((e) => console.log(e));
//     } else {
//       try {
//         let tracks = localVideoRef.current.srcObject.getTracks();
//         tracks.forEach(track => track.stop());
//       } catch (e) { }
//     }
//   };

//   let gotMessageFromServer=(fromId,message)=>{
//     var signal=JSON.parse(message)
//     if(fromId!==socketIdRef.current){
//       if(signal.sdp){
//         connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
//           if(signal.sdp.type==="offer"){
//             connections[fromId].createAnswer().then((description)=>{
//               connections[fromId].setLocalDescription(description).then(()=>{
//                 socketIdRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}))
//               }).catch(e=>console.log(e))
//             }).catch(e=>console.log(e))
//           }
//         }).catch(e=>console.log(e))
//       }
//       if(signal.ice){
//         connections[fromId].addIceCandidate(new RTCPeerCandidate(signal.ice)).catch(e=>console.log(e));
//       }
//     }


//   }
//   let addMessage=()=>{

//   }


//   let connectToSocketServer=()=>{
//     socketRef.current=io.connect(server_url,{secure:false})
//     socketRef.current.on('signal',gotMessageFromServer);
//     socketRef.current.on("connect",()=>{
//       socketRef.current.on("your-id", (id) => {
//        mySocketId.current = id;
// });

//       socketRef.current.on("user-connected", (id) => {
//        setUsers(prev => [...prev, id]);
// });

//       socketRef.current.on("user-disconnected", (id) => {
//        setUsers(prev => prev.filter(user => user !== id));
// });

//       socketRef.current.emit("join-call",window.location.href)
//       socketIdRef.current=socketRef.current.id
//       socketRef.current.on("chat-message",addMessage)
//       socketRef.current.on("user-left",(id)=>{
//         setvideo((videos)=>videos.filter((video)=>
//           video.socketId!==id
//         ))
//       })
//       socketRef.current.on("user-joined",(id,clients)=>{
//         clients.forEach((socketListId)=>{
//           connections[socketListId]=new RTCPeerConnection(peerconfigConnections)
//           connections[socketListId].onicecandidate=(event)=>{
//             if(event.candidate!==null){
//               socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
//             }
//           }
//           connections[socketListId].onaddstream=(event)=>{
//             let videoExists=videoRef.current.find(video=>video.socketId===socketListId);
//             if(videoExists){
//               setvideo(videos=>{
//                 const updatedVideos=videos.map(video=>
//                   video.socketId===socketListId ? {...video,stream:event.stream}:video
//                 );
//                 videoRef.current=updatedVideos;
//                 return updatedVideos;
//               })
//             }else{
//               let newVideo={
//                 socketId:socketListId,
//                 stream:event.stream,
//                 autoPlay:true,
//                 playsinline:true
//               }
//               setVideos(videos=>{
//                 const updatedVideos=[...videos,newVideo];
//                 videoRef.current=updatedVideos;
//                 return updatedVideos;
//               })
//             }
//           };
//           if(window.localStream!==undefined && window.localStream!==null){
//             window.localStream.getTracks().forEach(track=>{
//             connections[socketListId].addStream(window.localStream);
//             });
//           }else{
//             let blackSilence=(...args)=>new MediaStream([black(...args),silence()]);
//             window.localStream=blackSilence();
//             window.localStream.getTracks().forEach(track=>{
//             connections[socketListId].addStream(window.localStream)
//             })
//           }
//         })
//         if(id===socketIdRef.current){
//           for(let id2 in connections){
//             if(id2===socketIdRef.current)continue
//             try{
//               window.localstream.getTracks().forEach(track=>{
//               connections[id2].addTrackn(window.localStream)
//               })
//             }catch(e){}
//             connections[id2].createOffer().then((description)=>{
//               connections[id2].setLocalDescription(description)
//               .then(()=>{
//                 socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}))
//               })
//               .catch(e=>console.log(e))
//             })
//           }
//         }
//       })
//     })
//   }


//   let getMedia = () => {
//     setvideo(videoAvailable);
//     setAudio(audioAvailable);
    
//   };

//   let connect = () => {
//     setAskForUsername(false);
//     getMedia();
//     connectToSocketServer();

//     setTimeout(() => {
//     if (localVideoRef.current && window.localStream) {
//       localVideoRef.current.srcObject = window.localStream;
//     }
//   }, 0);

//   };

//   return (
//   <div>
//     {askForUsername ? (
//       <div>
//         <h2>Enter into Lobby</h2>

//         <TextField
//           label="Username"
//           value={username}
//           onChange={e => setUsername(e.target.value)}
//         />

//         <Button variant="contained" onClick={connect}>
//           Connect
//         </Button>

//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           playsInline
//           style={{
//             width: "400px",
//             height: "300px",
//             backgroundColor: "black"
//           }}
//         />
//       </div>
//     ) : (
//       <>
//         {/* ✅ LOCAL VIDEO */}
//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           playsInline
//           style={{
//             width: "400px",
//             height: "300px",
//             backgroundColor: "black"
//           }}
//         />

//         {/* ✅ REMOTE VIDEOS */}
//         {videos.map(video => (
//           <div key={video.socketId}>
//             <h3>{video.socketId}</h3>
//             <video
//               autoPlay
//               playsInline
//               ref={ref => {
//                 if (ref && video.stream) {
//                   ref.srcObject = video.stream;
//                 }
//               }}
//               style={{
//                 width: "300px",
//                 height: "220px",
//                 backgroundColor: "black"
//               }}
//             />
//           </div>
//         ))}
//       </>
//     )}
//   </div>
// );

// }
import React, { useEffect, useRef, useState } from "react";
import styles from  "../styles/videoComponent.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideoCamIcon from '@mui/icons-material/VideoCam';
import VideoCamOffIcon from '@mui/icons-material/VideoCamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import Badge from "@mui/material/Badge";
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";


const server_url = "http://localhost:8000";

var connections = {};

const peerconfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [video, setvideo] = useState();
  const [cameraOn, setCameraOn] = useState(true);
  let [showModal, setModal] = useState(true);
  const { addToUserHistory } = useContext(AuthContext);

//   useEffect(() => {
//   if (cameraOn && localVideoRef.current && window.localStream) {
//     localVideoRef.current.srcObject = window.localStream;
//   }
// }, [cameraOn]);

  const replaceVideoTrack = (newTrack) => {
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      const sender = connections[id]
        .getSenders()
        .find(s => s.track && s.track.kind === "video");

      if (sender) sender.replaceTrack(newTrack);
    }
  };
  const startScreenShare = async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    const screenTrack = screenStream.getVideoTracks()[0];

    // Send screen to other users
    replaceVideoTrack(screenTrack);

    // Show screen locally
    localVideoRef.current.srcObject = screenStream;

    setScreen(true);

    // When user stops sharing
    screenTrack.onended = () => {
      stopScreenShare();
    };
  } catch (err) {
    console.log(err);
  }
};
const stopScreenShare = async () => {
  try {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const cameraTrack = cameraStream.getVideoTracks()[0];

    // Restore camera for peers
    replaceVideoTrack(cameraTrack);

    window.localStream = cameraStream;
    localVideoRef.current.srcObject = cameraStream;

    setScreen(false);
  } catch (err) {
    console.log(err);
  }
};






   useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    }
  }, []);



  // ================= PERMISSIONS =================
  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
  if (localVideoRef.current && window.localStream) {
    localVideoRef.current.srcObject = window.localStream;
  }
}, [askForUsername]);

  // ================= SIGNAL HANDLER =================
  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: connections[fromId].localDescription })
                );
              });
            });
          }
        });
    }

    if (signal.ice) {
      connections[fromId].addIceCandidate(
        new RTCIceCandidate(signal.ice)
      );
    }
  };

let addMessage = (data, sender, socketIdSender) => {
  setMessages(prev => [
    ...prev,
    {
      sender,
      data,
      socketId: socketIdSender   // 👈 STORE ID
    }
  ]);

  if (socketIdSender !== socketIdRef.current) {
    setNewMessages(prev => prev + 1);
  }
};



  

  // ================= SOCKET =================
  const connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
  addMessage(data, sender, socketIdSender);
});


    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (connections[socketListId]) return;

          const pc = new RTCPeerConnection(peerconfigConnections);
          connections[socketListId] = pc;

          socketRef.current.on("user-left", (id) => {
  // Remove video from UI
  setVideos((prev) =>
    prev.filter((video) => video.socketId !== id)
  );

  // Close peer connection
  if (connections[id]) {
    connections[id].close();
    delete connections[id];
  }
});


          // ICE
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // REMOTE STREAM
          pc.ontrack = (event) => {
            const stream = event.streams[0];

            setVideos((prev) => {
              const exists = prev.find(
                (v) => v.socketId === socketListId
              );
              if (exists) return prev;
              return [...prev, { socketId: socketListId, stream }];
            });
          };

          // ADD LOCAL TRACKS (IMPORTANT)
          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
              pc.addTrack(track, window.localStream);
            });
          }
        });

        // CREATE OFFER ONLY FROM SELF
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections[id2].localDescription,
                    })
                  );
                });
            });
          }
        }
      });
    });
  };


  let routeTo=useNavigate();

  // ================= CONNECT =================
 const connect = async () => {
  setAskForUsername(false);

  connectToSocketServer();
};

  const handleVideo = () => {
  const track = window.localStream?.getVideoTracks()[0];
  if (!track) return;

  track.enabled = !track.enabled;
  setCameraOn(track.enabled);
};




  let handleAudio = () => {
  const audioTrack = window.localStream
    ?.getAudioTracks()[0];

  if (!audioTrack) return;

  audioTrack.enabled = !audioTrack.enabled;
  setAudio(audioTrack.enabled);
};
let getDisplayMediaSuccess=(stream)=>{
  try{
    window.localStream.getTracks().forEach(track=>track.stop())
  }catch(e){
    console.log(e)
  }
  window.localStream=stream;
  localVideoRef.current.srcObject=stream;


  for(let id in connections){
    if(id===socketIdRef.current) continue;

    connections[id].addStream(window.localStream)
    connections[id].createOffer().then((description)=>[
      connections[id].setLocalDescription(description)
      .then(()=>{
        socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
      })
      .catch(e=>console.log(e))

    ])
      stream.getTracks().forEach(track=>track.onended=()=>{
      setScreen(false)
      

      try{
        let tracks=localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track=>track.stop())
      }catch(e) {console.log(e)}

      let blackSilence=(...args)=>new MediaStream([black(...args),silence()]);
      window.localStream=blackSilence();
      localVideoRef.current.srcObject=window.localStream



    getUserMedia();
      
    })
  }


}
 let getDisplayMedia=()=>{
  if(screen){
    if(navigator.mediaDevices.getDisplayMedia){
      navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
      .then(getDisplayMediaSuccess)
      .then((stream)=>{})
      .catch((e)=>console.log(e))
    }
  }
 } 
useEffect(()=>{
  if(screen!==undefined){
    getDisplayMedia();
  }
},[screen])
 const handleScreen = () => {
  if (!screen) {
    startScreenShare();
  } else {
    stopScreenShare();
  }
};
let sendMessage = () => {
  socketRef.current.emit(
    "chat-message",
    message,
    username
  );
  setMessage("");
};

let handleEndCall=()=>{
  try{
    let tracks=localVideoRef.current.srcObject.getTracks();
    tracks.forEach(track=>track.stop())
  }catch(e){}

  routeTo("/home")


}


  // ================= UI =================
return ( 
<div> 
  {askForUsername ? ( 
    <div> 
      <h2>Enter into Lobby</h2> 
      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} /> 
      <Button variant="contained" onClick={connect}> Connect </Button>
    </div> 
    ) : ( <> 
    {/* LOCAL VIDEO */} 
    <div className={styles.meetVideoContainer}> 
      {showModal ? <div className={styles.chatRoom}>
        <div className={styles.chatContainer}> 
        <h1>Chat</h1>
        <div className={styles.chattingDisplay}>
          {messages.length>0 ? messages.map((item,index)=>{
            return(
              <div style={{marginBottom:"20px"}}key={index}>
                <p style={{fontWeight:"bold"}}>{item.sender}</p>

                <p>{item.data}</p>
              </div>

            )
          }) :<p>No messages yet</p>
        }
        </div>
        <div className={styles.chattingArea}>
        <TextField value={message} onChange={(e)=>setMessage(e.target.value)}id="outlined-basic" label="Enter your Chat" variant="outlined" />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
        </div>
        </div>


      </div> :<></> }
      <div className={styles.buttonContainer}> 
        <IconButton onClick={handleVideo} style={{color:"white"}}> 
        {window.localStream && window.localStream.getVideoTracks()[0].enabled ? <VideoCamIcon /> : <VideoCamOffIcon />} </IconButton> 
        <IconButton onClick={handleEndCall} style={{color:"red"}}> <CallEndIcon /> </IconButton> 
        <IconButton onClick={handleAudio} style={{color:"white"}}> {audio===true ? <MicIcon /> : <MicOffIcon /> } </IconButton> 
        {screenAvailable && ( <IconButton onClick={handleScreen} style={{color:"white"}}> 
          {screen ? <StopScreenShareIcon />:<ScreenShareIcon />} </IconButton>)} 
        <Badge badgeContent={newMessages} max={999} color="secondary"> 
         <IconButton onClick={()=>setModal(!showModal)}style={{color:"white"}} > <ChatIcon /> </IconButton> 
        </Badge> </div>  <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted playsInline 
        style={{ width: "400px", height: "300px", backgroundColor: "black", }} /> 
        {/* REMOTE VIDEOS */} 
        <div className={styles.conferenceView}> 
          {videos.map((video) => ( 
            <div key={video.socketId}> 
            <h4>{video.socketId}</h4> 
            <video autoPlay playsInline ref={(ref) => { if (ref && video.stream) { ref.srcObject = video.stream; } }}
             style={{ width: "300px", height: "220px", backgroundColor: "black", }} 
             /> 
             </div> ))} 
             </div> 
             </div> </> 
            )} 
             </div> );
}
