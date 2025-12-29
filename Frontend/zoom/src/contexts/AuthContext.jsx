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
import { createContext, useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token && !userData) {
    setUserData({ token }); // simple restore
  }
}, []);

  
  const navigate = useNavigate();


  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      // Axios only enters try for 2xx responses
      return response.data.message;
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {
        username,
        password, // ✅ fixed typo
      });

      localStorage.setItem("token", response.data.token);
      setUserData(response.data.user);

    } catch (err) {
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
  try {
    const response = await client.get("/get_all_activity", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data.history || response.data;
  } catch (err) {
    console.error("History fetch error:", err);
    throw err;
  }
};

  const addToUserHistory = async (meetingCode) => {
  try {
    const response = await client.post(
      "/add_to_activity",
      { meeting_code: meetingCode },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Add history error:", err.response?.data || err);
    throw err;
  }
};


  const value = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
