import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../services/api"

export default function EditProduct(){

const { id } = useParams()
const navigate = useNavigate()

const [name,setName] = useState("")
const [price,setPrice] = useState("")
const [image,setImage] = useState(null)

useEffect(()=>{
fetchProduct()
},[])

const fetchProduct = async ()=>{

try{

const res = await API.get(`/foods/${id}`)

setName(res.data.name)
setPrice(res.data.price)

}catch(err){
console.log(err)
}

}

const handleSubmit = async(e)=>{

e.preventDefault()

const formData = new FormData()

formData.append("name",name)
formData.append("price",price)

if(image){
formData.append("image",image)
}

try{

await API.put(`/foods/${id}`,formData)

alert("Product updated!")

navigate("/manage-products")

}catch(err){
console.log(err)
}

}

return(

<div className="p-10">

<h1 className="text-2xl font-bold mb-6">
Edit Product
</h1>

<form onSubmit={handleSubmit} className="space-y-4">

<input
type="text"
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Product Name"
className="w-full border p-2"
/>

<input
type="number"
value={price}
onChange={(e)=>setPrice(e.target.value)}
placeholder="Price"
className="w-full border p-2"
/>

<input
type="file"
onChange={(e)=>setImage(e.target.files[0])}
/>

<button
type="submit"
className="bg-blue-500 text-white px-4 py-2 rounded"
>
Update Product
</button>

</form>

</div>

)

}