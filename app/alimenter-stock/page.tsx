"use client"
import { Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState, useMemo } from 'react'
import { readProducts, replenishStockWithTransaction } from '../action'
import Wrapper from '../components/Wrapper'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import { Search, Plus, TrendingUp, Package, CheckCircle, AlertCircle, Minus } from 'lucide-react'
import { toast } from 'react-toastify'

const Page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
    if (email) fetchProducts()
  }, [email])

  // Filtrage des produits
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.categoryName)));
    return uniqueCategories;
  }, [products]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleSubmit = async () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Veuillez sélectionner un produit et une quantité valide")
      return
    }

    try {
      setIsSubmitting(true)
      await replenishStockWithTransaction(selectedProduct.id, quantity, email)
      toast.success(`Stock de "${selectedProduct.name}" réapprovisionné avec succès !`)
      fetchProducts()
      setSelectedProduct(null)
      setQuantity(1)
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du stock");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Wrapper>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="text-success" size={36} />
              Alimenter le Stock
            </h1>
            <p className="text-base-content/70">Réapprovisionnez votre inventaire</p>
          </div>

          {/* Statistique produit sélectionné */}
          {selectedProduct && (
            <div className="stats shadow">
              <div className="stat py-3 px-4">
                <div className="stat-figure text-success">
                  <Plus size={28} />
                </div>
                <div className="stat-title text-xs">Quantité à ajouter</div>
                <div className="stat-value text-2xl text-success">+{quantity}</div>
                <div className="stat-desc capitalize">{selectedProduct.unit}</div>
              </div>
            </div>
          )}
        </div>

        {/* Layout principal */}
        <div className='flex md:flex-row flex-col-reverse gap-6'>
          {/* Colonne gauche - Liste des produits */}
          <div className='md:w-2/5 space-y-4'>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg mb-3 flex items-center gap-2">
                  <Package className="text-primary" size={24} />
                  Sélectionner un Produit
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

                {/* Filtre par catégorie */}
                <div className="form-control">
                  <select
                    className="select select-bordered w-full"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="divider my-2"></div>

                {/* Liste des produits */}
                <div className='space-y-3 max-h-[600px] overflow-y-auto pr-2'>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`card cursor-pointer transition-all duration-200 ${
                          selectedProduct?.id === product.id
                            ? 'bg-primary/10 border-2 border-primary shadow-lg'
                            : 'bg-base-200 hover:bg-base-300 border-2 border-transparent'
                        }`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="card-body p-4">
                          <div className="flex items-center gap-3">
                            {/* Image */}
                            <div className="avatar">
                              <div className="w-16 h-16 rounded-lg">
                                {product.imageUrl ? (
                                  <ProductImage
                                    src={product.imageUrl}
                                    alt={product.name}
                                    heightClass='h-full'
                                    widthClass='w-full'
                                  />
                                ) : (
                                  <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                    <Package size={24} className="text-base-content/30" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <h3 className="font-bold">{product.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="badge badge-sm">{product.categoryName}</span>
                                <span className={`badge badge-sm ${product.quantity <= 2 ? 'badge-warning' : 'badge-success'}`}>
                                  {product.quantity} {product.unit}
                                </span>
                              </div>
                            </div>

                            {/* Indicateur sélection */}
                            {selectedProduct?.id === product.id && (
                              <CheckCircle className="text-primary" size={24} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      message='Aucun produit disponible'
                      IconComponent='PackageSearch'
                    />
                  )}
                </div>

                {filteredProducts.length > 0 && (
                  <div className="text-xs text-base-content/60 text-center mt-2">
                    {filteredProducts.length} produit(s) affiché(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite - Formulaire d'approvisionnement */}
          <div className='md:w-3/5'>
            <div className='card bg-base-100 shadow-xl border-2 border-success/20'>
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <TrendingUp className="text-success" size={28} />
                  Approvisionnement
                </h2>

                {selectedProduct ? (
                  <div className="space-y-6">
                    {/* Info produit sélectionné */}
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="font-bold text-lg mb-3">Produit sélectionné</h3>
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-24 h-24 rounded-xl">
                              {selectedProduct.imageUrl ? (
                                <ProductImage
                                  src={selectedProduct.imageUrl}
                                  alt={selectedProduct.name}
                                  heightClass='h-full'
                                  widthClass='w-full'
                                />
                              ) : (
                                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                  <Package size={32} className="text-base-content/30" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-2xl font-bold">{selectedProduct.name}</h4>
                            <p className="text-base-content/70 mt-1">{selectedProduct.description}</p>
                            <div className="flex gap-2 mt-3">
                              <div className="badge badge-lg">{selectedProduct.categoryName}</div>
                              <div className="badge badge-lg badge-outline">{selectedProduct.price} €</div>
                            </div>
                          </div>
                        </div>

                        <div className="divider my-2"></div>

                        {/* Stock actuel */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Stock actuel:</span>
                          <span className={`text-2xl font-bold ${selectedProduct.quantity <= 2 ? 'text-warning' : 'text-success'}`}>
                            {selectedProduct.quantity} {selectedProduct.unit}
                          </span>
                        </div>

                        {selectedProduct.quantity <= 2 && (
                          <div className="alert alert-warning">
                            <AlertCircle size={20} />
                            <span className="text-sm">Stock faible ! Approvisionnement recommandé.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sélecteur de quantité */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-lg">Quantité à ajouter</span>
                      </label>

                      <div className="flex items-center gap-4">
                        <button
                          className="btn btn-circle btn-lg btn-outline"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus size={24} />
                        </button>

                        <input
                          type="number"
                          value={quantity}
                          min="1"
                          className='input input-bordered input-lg w-32 text-center text-2xl font-bold'
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        />

                        <button
                          className="btn btn-circle btn-lg btn-outline"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus size={24} />
                        </button>

                        <div className="badge badge-lg capitalize px-4 py-4 text-lg">
                          {selectedProduct.unit}
                        </div>
                      </div>
                    </div>

                    {/* Aperçu */}
                    <div className="card bg-success/10 border-2 border-success">
                      <div className="card-body">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <CheckCircle className="text-success" size={24} />
                          Aperçu du changement
                        </h3>

                        <div className="flex justify-between items-center text-lg">
                          <span>Stock actuel:</span>
                          <span className="font-bold">{selectedProduct.quantity} {selectedProduct.unit}</span>
                        </div>

                        <div className="flex justify-between items-center text-lg text-success">
                          <span>Quantité ajoutée:</span>
                          <span className="font-bold">+{quantity} {selectedProduct.unit}</span>
                        </div>

                        <div className="divider my-1"></div>

                        <div className="flex justify-between items-center text-xl">
                          <span className="font-bold">Nouveau stock:</span>
                          <span className="font-bold text-success text-3xl">
                            {selectedProduct.quantity + quantity} {selectedProduct.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bouton de confirmation */}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`btn btn-success btn-lg w-full gap-2 ${isSubmitting ? 'loading' : ''}`}
                    >
                      {!isSubmitting && <CheckCircle size={24} />}
                      {isSubmitting ? 'Traitement en cours...' : `Ajouter ${quantity} ${selectedProduct.unit} au stock`}
                    </button>
                  </div>
                ) : (
                  <div className="py-12">
                    <EmptyState
                      message='Sélectionnez un produit'
                      IconComponent='PackageSearch'
                    />
                    <div className="text-center mt-4">
                      <p className="text-sm text-base-content/70">
                        Choisissez un produit dans la liste de gauche pour commencer
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
