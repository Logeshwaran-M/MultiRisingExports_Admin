import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const addProduct = async () => {
  await addDoc(collection(db, "products"), {
    name: "Sample Bag",
    price: 1200,
    stock: 20,
    category: "fashion",
    image: "image-url"
  });
};