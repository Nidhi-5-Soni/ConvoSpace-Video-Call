import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/videoComponent.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideoCamIcon from "@mui/icons-material/VideoCam";
import VideoCamOffIcon from "@mui/icons-material/VideoCamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";

const server_url = "http://localhost:8000";
var connections = {};
const peerConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const [videos, setVideos] = useState([]); // {username, stream}
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [audio, setAudio] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [showModal, setModal] = useState(true);
  const navigate = useNavigate();

  // ================= PERMISSIONS =================
  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      window.localStream = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
    if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
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
            connections[fromId].createAnswer().then((desc) => {
              connections[fromId].setLocalDescription(desc).then(() => {
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
      connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
    }
  };

  const addMessage = (data, sender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    setNewMessages((prev) => prev + 1);
  };

  // ================= SOCKET =================
  const connectToSocketServer = async () => {
    if (!window.localStream) await getPermissions();
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("chat-message", (data, sender) => addMessage(data, sender));

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href, username);

      socketRef.current.on("user-joined", (newUserId, newUserName, clients) => {
        clients.forEach((peerId) => {
          if (connections[peerId]) return;

          const pc = new RTCPeerConnection(peerConfig);
          connections[peerId] = pc;

          window.localStream.getTracks().forEach((track) => pc.addTrack(track, window.localStream));

          pc.ontrack = (event) => {
            const stream = event.streams[0];
            setVideos((prev) => {
              if (prev.find((v) => v.username === newUserName)) return prev;
              return [...prev, { username: newUserName, stream }];
            });
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit("signal", peerId, JSON.stringify({ ice: event.candidate }));
            }
          };

          if (socketIdRef.current !== newUserId) {
            pc.createOffer()
              .then((desc) => pc.setLocalDescription(desc))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  peerId,
                  JSON.stringify({ sdp: pc.localDescription })
                );
              });
          }
        });
      });

      socketRef.current.on("user-left", (id, leftUserName) => {
        setVideos((prev) => prev.filter((v) => v.username !== leftUserName));
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });
    });
  };

  const connect = async () => {
    setAskForUsername(false);
    if (!window.localStream) await getPermissions();
    connectToSocketServer();
  };

  // ================= CONTROLS =================
  const handleVideo = () => setCameraOn((prev) => !prev);

  const handleAudio = () => {
    const track = window.localStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setAudio(track.enabled);
  };

  const replaceVideoTrack = (newTrack) => {
    Object.keys(connections).forEach((peerId) => {
      const sender = connections[peerId]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) sender.replaceTrack(newTrack);
    });
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      replaceVideoTrack(screenTrack);
      localVideoRef.current.srcObject = screenStream;
      setScreen(true);
      screenTrack.onended = stopScreenShare;
    } catch (err) {
      console.log(err);
    }
  };

  const stopScreenShare = () => {
    const cameraTrack = window.localStream.getVideoTracks()[0];
    replaceVideoTrack(cameraTrack);
    localVideoRef.current.srcObject = window.localStream;
    setScreen(false);
  };

  const handleScreen = () => {
    if (!screen) startScreenShare();
    else stopScreenShare();
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const handleEndCall = () => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
      Object.values(connections).forEach((pc) => pc.close());
      connections = {};
      socketRef.current.disconnect();
    } catch (e) {}
    navigate("/home");
  };

  // ================= UI =================
  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button variant="contained" onClick={connect}>Connect</Button>
        </div>
      ) : (
        <>
          <div className={styles.meetVideoContainer}>
            {showModal && (
              <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                  <h1>Chat</h1>
                  <div className={styles.chattingDisplay}>
                    {messages.length > 0
                      ? messages.map((item, idx) => (
                          <div key={idx} style={{ marginBottom: "20px" }}>
                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                            <p>{item.data}</p>
                          </div>
                        ))
                      : <p>No messages yet</p>}
                  </div>
                  <div className={styles.chattingArea}>
                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} label="Enter your Chat" variant="outlined" />
                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.buttonContainer}>
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {cameraOn ? <VideoCamIcon /> : <VideoCamOffIcon />}
              </IconButton>
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
              <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              {screenAvailable && (
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
              )}
              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>

            {/* ================= VIDEO ROW ================= */}
            <div className={styles.videoRow}>
              {/* Local video */}
              <div className={styles.videoWrapper}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "300px",
                    height: "220px",
                    backgroundColor: "black",
                    display: cameraOn ? "block" : "none",
                  }}
                />
                <p style={{ color: "white", textAlign: "center" }}>{username} (You)</p>
              </div>

              {/* Remote videos */}
              {videos.map((video) => (
                <div key={video.username} className={styles.videoWrapper}>
                  <video
                    autoPlay
                    playsInline
                    ref={(ref) => { if (ref && video.stream) ref.srcObject = video.stream; }}
                    style={{ width: "300px", height: "220px", backgroundColor: "black" }}
                  />
                  <p style={{ color: "white", textAlign: "center" }}>{video.username}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}





