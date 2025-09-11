import Router from 'express'

const router = Router()

//Create new agent
router.post("/new-agent", (req, res) => {
    const data = req.body
    console.log(data)

})

//get all agents based on user id
router.get("/:agnetId", (req, res) => {
    
})

export default router;