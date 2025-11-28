import Router from 'express';
const router = Router();

router.post("/chat/:domain", (req, res) => {
    //parse the user input
    const {message} = req.body;

    //make query to embedding 
    //reterive search results
    //make model call
    //return results to the widget

    res.status(200).json({
        success: true,
        message: "Done"
    })
}) 


export default router;