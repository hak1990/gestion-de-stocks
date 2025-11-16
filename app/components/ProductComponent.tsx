
import { Product } from '@/type'
import React from 'react'
import ProductImage from './ProductImage'
import { Plus } from 'lucide-react'

interface ProductComponentProps {
    product ?: Product | null 
    add?: boolean,
    handleAddToCart?: (product:Product) => void
}
const ProductComponent:React.FC<ProductComponentProps> = ({product, add, handleAddToCart}) => {
        if (!product){
            return (
                <div className='border- border-base-200 p-4 rounded-3xl w-full flex items-center'>
                     <select className="select select-bordered w-full">
                <option value="">Sélectionner un produit</option>
            </select>
                    Sélectionner un Produit pour voir ces détails
                </div>
            )
        }

  return (
        <div className='border- border-base-200 p-4 rounded-3xl w-full flex items-center'>
            <div><ProductImage
                src={product.imageUrl}
                alt={product.imageUrl}
                heightClass='h-30'
                widthClass='w-30'
            />
            </div>
            <div className='ml-4 space-y-2 flex flex-col'>
                <h2 className='text-lg font-bold'>{product.name}</h2>
                <div className='badge badge-warning badge-outline'>
                        {product.categoryName}
                </div>
                <div className='badge badge-warning badge-outline'>
                        {product.quantity}
                        {product.unit}
                </div>
                {add && handleAddToCart && (
  <button
    onClick={() => handleAddToCart(product)}
    className='btn btn-sm btn-circle btn-primary'
  >
    <Plus className='w-4 h-4' />
  </button>
)}

            </div>
        </div>
  )
}

export default ProductComponent