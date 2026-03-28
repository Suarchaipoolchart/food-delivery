import { useState } from "react"
import Navbar from "../components/Navbar"

export default function Profile(){

const userData = JSON.parse(localStorage.getItem("user")) || {
name:"ohmmy",
email:"ohm@gmail.com",
phone:"0820000000",
address:"Bangkok",
avatar:"https://i.pravatar.cc/150"
}

const [user,setUser] = useState(userData)
const [edit,setEdit] = useState(false)

const saveProfile = ()=>{

localStorage.setItem("user",JSON.stringify(user))
localStorage.setItem("currentUser",JSON.stringify(user))

window.dispatchEvent(new Event("userUpdated"))

setEdit(false)

}

return(

<>
<Navbar/>

<div className="max-w-xl mx-auto mt-10 bg-white shadow rounded-lg overflow-hidden">

{/* Cover */}

<div className="h-40 bg-gradient-to-r from-black to-blue-400"></div>

{/* Avatar */}

<div className="flex flex-col items-center -mt-16">

<div className="relative w-32 h-32">

<img
src={user.avatar}
className="w-32 h-32 rounded-full object-cover border-4 border-white"
/>

<label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer">

📷

<input
type="file"
className="hidden"
onChange={(e)=>{
const file = e.target.files[0]
const reader = new FileReader()

reader.onload = ()=>{
setUser({...user,avatar:reader.result})
}

reader.readAsDataURL(file)
}}
/>


</label>

</div>

{edit ? (

<input
value={user.name}
onChange={(e)=>setUser({...user,name:e.target.value})}
className="border p-1 rounded mt-2"
/>

) : (

<h2 className="text-2xl font-bold mt-3">
{user.name}
</h2>

)}

</div>

{/* Info */}

<div className="p-6 space-y-4">

<div className="flex justify-between">
<span>📧 Email</span>

<input
disabled={!edit}
value={user.email}
onChange={(e)=>setUser({...user,email:e.target.value})}
className="border p-1 rounded"
/>

</div>

<div className="flex justify-between">
<span>📞 Phone</span>

<input
disabled={!edit}
value={user.phone}
onChange={(e)=>setUser({...user,phone:e.target.value})}
className="border p-1 rounded"
/>

</div>

<div className="flex justify-between">
<span>🏠 Address</span>

<input
disabled={!edit}
value={user.address}
onChange={(e)=>setUser({...user,address:e.target.value})}
className="border p-1 rounded"
/>

</div>

<div className="pt-4">

<button
onClick={()=> edit ? saveProfile() : setEdit(true)}
className="bg-purple-500 text-white px-6 py-2 rounded"
>
{edit ? "Save" : "Edit Profile"}
</button>

</div>

</div>

</div>

</>

)

}