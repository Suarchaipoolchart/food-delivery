import { createContext, useState, useEffect } from "react"

export const Store = createContext()

export default function StoreProvider({children}){

const [user,setUser] = useState(
 JSON.parse(localStorage.getItem("user")) || null
)

const [cart,setCart] = useState(
 JSON.parse(localStorage.getItem("cart")) || []
)

const [orders,setOrders] = useState(
 JSON.parse(localStorage.getItem("orders")) || []
)

useEffect(()=>{
 localStorage.setItem("cart",JSON.stringify(cart))
},[cart])

useEffect(()=>{
 localStorage.setItem("orders",JSON.stringify(orders))
},[orders])

useEffect(()=>{
 if(user){
  localStorage.setItem("user",JSON.stringify(user))
 }else{
  localStorage.removeItem("user")
 }
},[user])

return(

<Store.Provider value={{
 user,setUser,
 cart,setCart,
 orders,setOrders
}}>

{children}

</Store.Provider>

)

}