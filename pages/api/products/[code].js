import { connectToDatabase } from "../../../util/mongodb";
export default async (req, res) => {
  const { db } = await connectToDatabase();
  const {method} = req;
  switch (method){
    case 'GET':{
      const product = await db
      .collection("products")
      .findOne({code: req.query.code.toString()})
      res.json(product || {status: "no data found"});
      break;
    }
    case 'DELETE':{
      await db
      .collection("products")
      .remove({code: req.query.code})
      .then((result)=>{
        res.json({status:'data has removed', code:200, data:result.result,});
      })
      break;
    }
    case 'PUT':{
      await db
      .collection("products")
      .update({code: req.query.code},req.body)
      .then(()=>{
        res.json({status:'data has updated', code:200, data:req.body});
      })
      break;
    }
    default:{
      res.json({status:'no method found', code:404});
    }
  }
};