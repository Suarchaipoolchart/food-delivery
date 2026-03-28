import { useContext } from "react"
import { Store } from "../context/Store"
import { Link } from "react-router-dom"

export default function FloatingOrders(){

const {orders} = useContext(Store)

const ongoing = orders.filter(o=>o.status < 4)

if(ongoing.length === 0) return null

return(

<Link
to="/orders"
className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg"
>

📦 Orders ({ongoing.length})

</Link>

)

}