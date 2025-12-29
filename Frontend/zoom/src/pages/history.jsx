import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

// MUI imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        console.log("Fetched meetings:", history); // debug
        setMeetings(history || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  if (meetings.length === 0) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>No meeting history found.</p>;
  }

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Home Button */}
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/home")} color="primary">
          <HomeIcon fontSize="large" />
        </IconButton>
      </Box>

      {/* Meetings List */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3, // spacing between cards
          justifyContent: "center",
        }}
      >
        {meetings.map((e, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              maxWidth: 300,
              minWidth: 250,
              backgroundColor: "#1e1e2f",
              color: "#fff",
              boxShadow: 3,
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Typography gutterBottom variant="h6">
                Code: {e.meetingCode}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: "#ccc" }}>
                Date: {formatDate(e.date)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ color: "#999" }}>
                {e.createdAt ? new Date(e.createdAt).toLocaleString() : ""}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(`/meet/${e.meetingCode}`)}
                sx={{ textTransform: "none" }}
              >
                Rejoin
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

