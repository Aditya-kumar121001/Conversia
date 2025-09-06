import mongoose from "mongoose";

export const conn = () =>{
    try{
        mongoose.connect(`${process.env.DATABASE_URL}` as string, {
            dbName: "Conversia"
        }).then(() => {
            console.log("Database is connected");
        }); 
    } catch(e){
        console.log(`${e}, Database is not connected`)
    }
}
