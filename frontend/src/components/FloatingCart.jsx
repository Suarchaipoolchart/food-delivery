import { useState,useEffect } from "react"
import { Link } from "react-router-dom"

export default function FloatingOrders(){

const [count,setCount] = useState(0)

const updateOrders = ()=>{

const orders = JSON.parse(localStorage.getItem("orders")) || []

const active = orders.filter(o => o.status < 4)

setCount(active.length)

}

useEffect(()=>{

updateOrders()

window.addEventListener("ordersUpdated",updateOrders)

return ()=>window.removeEventListener("ordersUpdated",updateOrders)

},[])

if(count===0) return null

return(

<Link
to="/orders"
className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-4 rounded-full shadow-lg"
>

📦 Orders ({count})

</Link>

)

}