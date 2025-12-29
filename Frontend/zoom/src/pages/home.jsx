import React from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../App.css';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";



import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';

function HomeComponent(){

    let navigate=useNavigate();
    const [meetingCode,setMeetingCode]=useState("");

    const {addToUserHistory,setUserData}=useContext(AuthContext);

    let handleJoinVideoCall = async () => {
  if (!meetingCode) {
    alert("Please enter a meeting code");
    return;
  }

  try {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  } catch (err) {
    console.error("Failed to join meeting:", err);
    alert("Failed to join meeting. Please check your code or login.");
  }
}

     return (
    <>
      {/* NAVBAR */}
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Apna video Call</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconButton onClick={
            ()=>{
              navigate("/history")
            }
          }>
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button
  onClick={() => {
    localStorage.removeItem("token");
    setUserData(null);     // ✅ CLEAR AUTH CONTEXT
    navigate("/auth");
  }}
>
  LogOut
</Button>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="meetContainer">
        <div className="leftPanel">
          <h2>Providing Quality Video Call Just Like Quality Education</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              label="Meeting-Code"
              variant="outlined"
            />
            <Button onClick={handleJoinVideoCall} variant="contained">
              Join
            </Button>
          </div>
        </div>
      <div className="rightPanel">
        <img src='/logo3.png' alt="logo" />

      </div>
      </div>
    </>
  );
}

export default HomeComponent;   // ✅ THIS LINE FIXES THE ERROR
   