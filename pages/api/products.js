import { connectToDatabase } from "../../util/mongodb";
export default async (req, res) => {
  const { db } = await connectToDatabase();
  const products = await db
    .collection("products")
    .find({})
    .sort({ metacritic: -1 })
    .limit(20)
    .toArray();
  res.json(products);
};