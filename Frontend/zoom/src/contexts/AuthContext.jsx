// import {createContext,useState,useContext} from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";





// export const AuthContext=createContext({});
// const client =axios.create({
//     baseURL:"http://localhost:8000/api/v1/users"
// })


// export const AuthProvider=({children})=>{

//     const authContext=useContext(AuthContext);

//     const[userData,setUserData]=useState(authContext);

//     const router=useNavigate();

//     const handleRegister=async(name,username,password)=>{
//         try{
//             let request= await client.post("/register",{
//                 name:name,
//                 username:username,
//                 password:password

//             })
//             if(request.status===httpStatus.CREATED){
//                 return request.data.message;
//             }

//         }catch(err){
//             throw err;

//         }
//     }
//     const handleLogin= async(username,password)=>{
//         try{
//             let request=await client.post("/login",{
//                 username:username,
//                 passsword:password
//             })
//             if(request.status===httpStatus.OK){
//                localStorage.setItem("token",request.data.token)
//             }

//         }catch (err){
//             throw err;

//         }
//     }

//     const data={
//         userData,setUserData,handleRegister
//     }
//     return(
//         <AuthContext.Provider value={data} >
//             {children}
//         </AuthContext.Provider>

//     )
// }
// import { createContext, useState,useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import server from "../environment"

// export const AuthContext = createContext(null);

// const client = axios.create({
//   baseURL: `${server.prod}/api/v1/users`,
// });

// export const AuthProvider = ({ children }) => {
//   const [userData, setUserData] = useState(null);
//   useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (token && !userData) {
//     setUserData({ token }); // simple restore
//   }
// }, []);

  
//   const navigate = useNavigate();


//   const handleRegister = async (name, username, password) => {
//     try {
//       const response = await client.post("/register", {
//         name,
//         username,
//         password,
//       });

//       // Axios only enters try for 2xx responses
//       return response.data.message;
//     } catch (err) {
//       throw err;
//     }
//   };

//   const handleLogin = async (username, password) => {
//     try {
//       const response = await client.post("/login", {
//         username,
//         password, // ✅ fixed typo
//       });

//       localStorage.setItem("token", response.data.token);
//       setUserData(response.data.user);

//     } catch (err) {
//       throw err;
//     }
//   };

//   const getHistoryOfUser = async () => {
//   try {
//     const response = await client.get("/get_all_activity", {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });

//     return response.data.history || response.data;
//   } catch (err) {
//     console.error("History fetch error:", err);
//     throw err;
//   }
// };

//   const addToUserHistory = async (meetingCode) => {
//   try {
//     const response = await client.post(
//       "/add_to_activity",
//       { meeting_code: meetingCode },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (err) {
//     console.error("Add history error:", err.response?.data || err);
//     throw err;
//   }
// };


//   const value = {
//     userData,
//     setUserData,
//     handleRegister,
//     handleLogin,
//     getHistoryOfUser,
//     addToUserHistory
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import server from "../environment";

export const AuthContext = createContext(null);

const client = axios.create({
  baseURL: `${server.prod}/api/v1/users`,
});

// 🔐 Automatically attach token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // 🔄 Restore login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUserData({ token });
    }
  }, []);

  // 📝 REGISTER
  const handleRegister = async (name, username, password) => {
    try {
      const res = await client.post("/register", {
        name,
        username,
        password,
      });

      return res.data.message;
    } catch (err) {
      if (err.response?.status === 409) {
        throw new Error("User already exists. Please login.");
      }
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  // 🔐 LOGIN
  const handleLogin = async (username, password) => {
    try {
      const res = await client.post("/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setUserData(res.data.user);

      return res.data.user;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  // 📜 HISTORY
  const getHistoryOfUser = async () => {
    try {
      const res = await client.get("/get_all_activity");
      return res.data.history || res.data;
    } catch (err) {
      throw new Error("Failed to fetch history");
    }
  };

  // ➕ ADD HISTORY
  const addToUserHistory = async (meetingCode) => {
    try {
      const res = await client.post("/add_to_activity", {
        meeting_code: meetingCode,
      });
      return res.data;
    } catch (err) {
      throw new Error("Failed to add history");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
