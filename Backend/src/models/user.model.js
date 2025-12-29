// import {Schema} from "mongoose";

// const userScheme =new Schema({
//     name:{type:String,required:true},
//     username:{type:String,required:true,unique:true},
//     password:{type:String,required:true},
//     token:{type:String}
// })


// const User=mongoose.model("User",userScheme);
// export {User};
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String }
});

const User = mongoose.model("User", userSchema);

export default User;
