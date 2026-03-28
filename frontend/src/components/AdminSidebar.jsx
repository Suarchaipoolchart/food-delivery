import { Link } from "react-router-dom"

export default function AdminSidebar(){

return(

<div className="w-60 bg-gray-900 text-white min-h-screen p-6">

<h2 className="text-xl font-bold mb-8">
Admin Panel
</h2>

<ul className="space-y-4">

<li>
<Link to="/admin">Dashboard</Link>
</li>

<li>
<Link to="/admin-users">Users</Link>
</li>

<li>
<Link to="/admin-orders">Orders</Link>
</li>

<li>
<Link to="/manage-products">Products</Link>
</li>

<li>
<Link to="/add-product">Add Product</Link>
</li>

</ul>

</div>

)

}