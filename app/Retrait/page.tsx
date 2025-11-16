"use client"
import { OrderItem, Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState, useMemo } from 'react'
import { deductStockWithTransaction, readProducts } from '../action'
import Wrapper from '../components/Wrapper'
import ProductComponent from '../components/ProductComponent'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import { Trash, Search, ShoppingCart, Package, MinusCircle, CheckCircle, AlertTriangle, Plus, Minus } from 'lucide-react'
import { toast } from 'react-toastify'

const Page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<Product[]>([])
  const [order, setOrder] = useState<OrderItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  if (email) {
    fetchProducts()
  }
}, [email])

const filteredAvailableProducts = products
  .filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((product) => !selectedProductIds.includes(product.id))
  .slice(0, 10) 
    const handleAddToCart = (product: Product) => {
  setOrder((prevOrder) => {
    const existingProduct = prevOrder.find((item) => item.productId === product.id)
    let updatedOrder
    
    if (existingProduct) {
      updatedOrder = prevOrder.map((item) =>
        item.productId === product.id ?
        {
          ...item,
          quantity: Math.min(item.quantity + 1, product.quantity)
        } : item
      )
    } else {
      updatedOrder = [
        ...prevOrder,
        {
  productId: product.id,
  quantity: 1,
  unit: product.unit,
  imageUrl: product.imageUrl,
  name: product.name,
  availableQuantity: product.quantity,
}
      ]

    }

    setSelectedProductIds((prevSelected) =>
  prevSelected.includes(product.id)
    ? prevSelected
    : [...prevSelected, product.id]
) 
return updatedOrder
  })
}

const handleQuantityChange = (productId: string, quantity: number) => {
  setOrder((prevOrder) =>
    prevOrder.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    )
  )
}

const handleRemoveFromCart = (productId: string) => {
  setOrder((prevOrder) => {
    const updatedOrder = prevOrder.filter((item) => item.productId !== productId)
    setSelectedProductIds((prevSelectedProductIds) =>
      prevSelectedProductIds.filter((id) => id !== productId)
    )
    return updatedOrder
  })
}

// Statistiques du panier
const cartStats = useMemo(() => {
  const totalItems = order.reduce((acc, item) => acc + item.quantity, 0);
  const uniqueProducts = order.length;
  return { totalItems, uniqueProducts };
}, [order]);

const handleSubmit = async () => {
  try {
    // Check if the order is empty
    if (order.length === 0) {
      toast.error("Veuillez ajouter des produits à la commande.")
      return
    }

    setIsSubmitting(true);
    const response = await deductStockWithTransaction(order, email)

    if (response?.success) {
      toast.success("Les produits ont été retirés avec succès!")
      setOrder([])
      setSelectedProductIds([])
      fetchProducts();
    } else {
      toast.error(`${response?.message}`)
    }
  } catch (error) {
    console.error(error)
    toast.error("Une erreur est survenue")
  } finally {
    setIsSubmitting(false);
  }
}

  return (
  <Wrapper>
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MinusCircle className="text-error" size={36} />
            Retirer du Stock
          </h1>
          <p className="text-base-content/70">Gérez les sorties de stock de votre inventaire</p>
        </div>

        {/* Statistiques du panier */}
        {order.length > 0 && (
          <div className="stats shadow">
            <div className="stat py-3 px-4">
              <div className="stat-figure text-primary">
                <ShoppingCart size={28} />
              </div>
              <div className="stat-title text-xs">Articles au panier</div>
              <div className="stat-value text-2xl text-primary">{cartStats.totalItems}</div>
              <div className="stat-desc">{cartStats.uniqueProducts} produit(s)</div>
            </div>
          </div>
        )}
      </div>

      {/* Layout principal */}
      <div className='flex md:flex-row flex-col-reverse gap-6'>
        {/* Colonne gauche - Recherche de produits */}
        <div className='md:w-2/5 space-y-4'>
          {/* Carte de recherche */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg mb-3 flex items-center gap-2">
                <Package className="text-primary" size={24} />
                Produits Disponibles
              </h2>

              {/* Barre de recherche */}
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-200">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder='Rechercher un produit...'
                    className='input input-bordered w-full'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="divider my-2"></div>

              {/* Liste des produits */}
              <div className='space-y-3 max-h-[600px] overflow-y-auto pr-2'>
                {filteredAvailableProducts.length > 0 ? (
                  filteredAvailableProducts.map((product, index) => (
                    <ProductComponent
                      key={index}
                      add={true}
                      product={product}
                      handleAddToCart={handleAddToCart}
                    />
                  ))
                ) : (
                  <EmptyState
                    message='Aucun produit disponible'
                    IconComponent='PackageSearch'
                  />
                )}
              </div>

              {filteredAvailableProducts.length > 0 && (
                <div className="text-xs text-base-content/60 text-center mt-2">
                  {filteredAvailableProducts.length} produit(s) affiché(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Panier */}
        <div className='md:w-3/5'>
          <div className='card bg-base-100 shadow-xl border-2 border-primary/20'>
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <ShoppingCart className="text-primary" size={28} />
                Panier de Retrait
                {order.length > 0 && (
                  <div className="badge badge-primary badge-lg">{order.length}</div>
                )}
              </h2>

              {order.length > 0 ? (
                <div className="space-y-4">
                  {/* Résumé du panier */}
                  <div className="alert alert-info">
                    <AlertTriangle size={20} />
                    <div>
                      <h3 className="font-bold">Information</h3>
                      <div className="text-sm">
                        {cartStats.totalItems} article(s) dans {cartStats.uniqueProducts} produit(s) différent(s)
                      </div>
                    </div>
                  </div>

                  {/* Liste des articles */}
                  <div className="space-y-3">
                    {order.map((item) => (
                      <div key={item.productId} className="card bg-base-200 shadow">
                        <div className="card-body p-4">
                          <div className="flex items-center gap-4">
                            {/* Image */}
                            <div className="avatar">
                              <div className="w-16 h-16 rounded-lg">
                                <ProductImage
                                  src={item.imageUrl}
                                  alt={item.name}
                                  heightClass='h-full'
                                  widthClass='w-full'
                                />
                              </div>
                            </div>

                            {/* Info produit */}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{item.name}</h3>
                              <p className="text-sm text-base-content/70">
                                Stock disponible: <span className="font-semibold text-warning">{item.availableQuantity} {item.unit}</span>
                              </p>
                            </div>

                            {/* Contrôles quantité */}
                            <div className="flex items-center gap-2">
                              <button
                                className="btn btn-sm btn-circle btn-outline"
                                onClick={() => handleQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>

                              <input
                                type="number"
                                value={item.quantity}
                                min="1"
                                max={item.availableQuantity}
                                className='input input-bordered input-sm w-20 text-center font-bold'
                                onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                              />

                              <button
                                className="btn btn-sm btn-circle btn-outline"
                                onClick={() => handleQuantityChange(item.productId, Math.min(item.availableQuantity, item.quantity + 1))}
                                disabled={item.quantity >= item.availableQuantity}
                              >
                                <Plus size={16} />
                              </button>

                              <div className="badge badge-lg capitalize">{item.unit}</div>
                            </div>

                            {/* Bouton supprimer */}
                            <button
                              className='btn btn-sm btn-circle btn-error'
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              <Trash className='w-4 h-4'/>
                            </button>
                          </div>

                          {/* Barre de progression */}
                          {item.quantity > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Quantité retirée</span>
                                <span className="font-semibold">{((item.quantity / item.availableQuantity) * 100).toFixed(0)}%</span>
                              </div>
                              <progress
                                className={`progress ${item.quantity / item.availableQuantity > 0.8 ? 'progress-error' : 'progress-warning'} w-full`}
                                value={item.quantity}
                                max={item.availableQuantity}
                              ></progress>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="divider"></div>

                  {/* Bouton de confirmation */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`btn btn-error btn-lg w-full gap-2 ${isSubmitting ? 'loading' : ''}`}
                  >
                    {!isSubmitting && <CheckCircle size={24} />}
                    {isSubmitting ? 'Traitement en cours...' : `Confirmer le retrait (${cartStats.totalItems} article${cartStats.totalItems > 1 ? 's' : ''})`}
                  </button>
                </div>
              ) : (
                <div className="py-12">
                  <EmptyState
                    message='Votre panier est vide'
                    IconComponent='ShoppingCart'
                  />
                  <div className="text-center mt-4">
                    <p className="text-sm text-base-content/70">
                      Recherchez et ajoutez des produits depuis la liste de gauche
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Wrapper>
  )
}

export default Page