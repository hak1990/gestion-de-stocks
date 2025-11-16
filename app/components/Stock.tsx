import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import React, { useEffect, useState } from 'react'
import { readProducts, replenishStockWithTransaction } from '../action'
import ProductComponent from './ProductComponent'
import { toast } from 'react-toastify'

const Stock = () => {

    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [products, setProducts] = useState<Product []>([])
    const [selectedProductId, setSelectedProductId] = useState<string>("") 
    const [quantity, setQuantity] = useState<number>(0) 
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) 

    const fetchProducts = async () => {
  try {
    if (email) {
      const products = await readProducts(email)
      if (products) {
        setProducts(products)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

useEffect(() => {
  if (email)
    fetchProducts()
}, [email])

const handleProductChange = (productId : string) =>{
  const product = products.find((p)=> p.id === productId)
  setSelectedProduct (product || null)
  setSelectedProductId (productId)
}

const handleSubmit = async (e: React.FormEvent)=> {
  e.preventDefault();
  if (!selectedProductId || quantity<= 0){
    toast.error("Veillez sélectionner un produit et une quantité valide")
    return
  }
  try {
    if(email){
      await replenishStockWithTransaction(selectedProductId, quantity,email)
    }
    toast.success("Stock réaprovisionné")
    fetchProducts()
    setSelectedProductId('')
    setQuantity(0)
    setSelectedProduct(null)
    const modal = (document.getElementById("my_modal_stock") as HTMLDialogElement )
    if (modal){
      modal.close()
    }
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la mise à jour du stock");
  }
}
  return (
    <div>
      {/* Modal ouvert via document.getElementById('my_modal_stock').showModal() depuis la Navbar */}
      <dialog id="my_modal_stock" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">X</button>
          </form>
<h3 className="font-bold text-lg">Gestion du Stock</h3>
<p className="py-4">
  Ajouter des quantités aux produits disponibles dans votre stock.
</p>

<form className="space-y-2" onSubmit={handleSubmit}>
  
  <select
    id="product"
    value={selectedProductId}
    className="select select-bordered w-full"
    required
    onChange={(e) => handleProductChange(e.target.value)}
  >
    <option value="">Sélectionner un produit</option>
    {products.map((product) => (
      <option key={product.id} value={product.id}>
        {product.name} - {product.categoryName}
      </option>
    ))}
    
  </select>
  {selectedProduct && (
      <ProductComponent product = {selectedProduct}/>
    
    )}

    <label className="block">Quantité à Ajouter</label>
    <input 
    type="number"
    placeholder='Quantité à Ajouter'
    value={quantity}
    required
    onChange={(e)=> setQuantity(Number(e.target.value))}
    className='input input-bordered w-full'
     />
     <button type='submit' className='btn btn-primary w-fit'>
      Ajouter au Stock
     </button>
          </form>
        </div>
      </dialog>
    </div>
  )
}

export default Stock
