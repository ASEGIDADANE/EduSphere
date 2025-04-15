import mongoose from "mongoose";


const blacklistSchema = new mongoose.Schema({  
    token : { type: String, required: true } ,
   expiresAt: { type: Date, required: true } 

});

blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Blacklist = mongoose.model("Blacklist", blacklistSchema);
export default Blacklist;
