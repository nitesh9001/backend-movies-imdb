const jwt = require("jsonwebtoken");
const AdminModel = require("../Models/admin");

module.exports = async (req, res, next) => {
  
  const bearerHeader = req.header("authorization");
 
    try {
       if (!bearerHeader || bearerHeader === null || bearerHeader === "null"){
        return res
          .status(401)
          .json({ success: false, message: "No authorization token found, authorization denied" });
       }
      
        const decoded = jwt.verify(bearerHeader, process.env.JWTSCERET, async function(err, decoded) {
          email = decoded.admin.email;
          req.user = decoded.admin;
          const adminData = await AdminModel.findOne({ email: email });
          if (adminData) {
            return next();
          }
          else{
            return res.status(401).json({success:false, message: "Un authorize" });  
        }
       });
    } catch (e) {
      res
        .status(401)
        .json({ success: false, message: "Token is not valid", err: e });
    }
};