import { connectToDatabase } from "../../util/mongodb";
export default async (req, res) => {
  const { db } = await connectToDatabase();
  const {method, query} = req;
  switch(method){
    case 'GET':{
      const {nama} = query
      let filter = {}
      if(nama) filter.nama = {"$regex": nama, "$options": "i"}
      const products = await db
      .collection("products")
      .find(filter)
      .sort({ metacritic: -1 })
      // .limit(20)
      .toArray()
      res.json({status:200, data:products.reverse()});
      break;
    }
    case 'POST':{
      // const {nama, code} = req.body
      await db
      .collection("products")
      .insert(req.body).then(()=>{
        res.json({status:200, message:'success insert data', data:req.body});
      })
      break;
    }
  }
};