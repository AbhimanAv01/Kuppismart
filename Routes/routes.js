const express = require("express")
const { signup, Login ,createexpenses,readAllexpenses, deleteexpenses,Updateexpenses} = require('../DataBase/db');
const validateToken = require('../DataBase/Validation'); 

const router = express.Router()



router.post('/signup', async(req, res) => {
    const { success, data ,message} = await signup(req.body)

    if(success){
        return res.json({success, data})
    }

    return res.status(500).json({success: false, message: message})
})


// Login
router.post("/login",async(req,res)=>{
    const {user_email_id,password}=req.body;

    if(!user_email_id||!password)
    {
        return res.status(400).json({success:false,message:"Email and password are required"})
    }

    const {success,message,token}=await Login({user_email_id,password});
    if(success)
    {
        return res.json({success,message,token});

    }

    return res.status(401).json({ success: false, message });
})



//Create expenses 

router.post('/Createexpenses', validateToken,async(req, res) => {
    const { success, data } = await createexpenses(req.body)

    if(success){
        return res.json({success, data})
    }
    return res.status(500).json({success:false, messsage: "Error"})
})





// READ ALL Expenses
router.get('/expenses',validateToken, async(req, res) => {
    const { success, data } = await readAllexpenses()

    if(success){
        return res.json({success, data})
    }
    return res.status(500).json({success:false, messsage: "Error"})
})


// Delete expenses
router.delete('/deleteexpenses/:id',validateToken, async (req, res) => {
    const { id } = req.params
    const { success, data } = await deleteexpenses(id)
    if (success) {
      return res.json({ success, data })
    }
    return res.status(500).json({ success: false, message: 'Error'})
})




//Update expenses

router.put('/updateexpenses/:item_id',validateToken, async (req, res) => {
    const { item_id } = req.params;
    const upexpenses = req.body; 
    upexpenses.item_id = item_id; 
 
    
 
        const { success, data } = await Updateexpenses(upexpenses);
        if (success) {
            return res.json({ success, data })
          }
          return res.status(500).json({ success: false, message: 'Error'})
});





module.exports=router