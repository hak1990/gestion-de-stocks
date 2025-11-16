"use client";
import React, { useEffect, useState, useMemo } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs';
import { Product } from '../../type';
import { readProducts, deleteProduct } from '../action';
import EmptyState from '../components/EmptyState';
import ProductImage from '../components/ProductImage';
import Link from 'next/link';
import { Trash, Edit, Search, Filter, Package, TrendingUp, AlertCircle, Plus } from 'lucide-react';

const Page = () => {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            if (!email) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const fetchedProducts = await readProducts(email);

                if (isMounted && fetchedProducts) {
                    setProducts(fetchedProducts);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des produits:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, [email]);

    // Filtrage et recherche
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.categoryName === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    // Catégories uniques
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(products.map(p => p.categoryName)));
        return uniqueCategories;
    }, [products]);

    // Statistiques
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
        const lowStockProducts = products.filter(p => p.quantity <= 2).length;
        return { totalProducts, totalValue, lowStockProducts };
    }, [products]);

    const handleDeleteProduct = async (product: Product) => {
        const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce produit ?");
        if (!confirmDelete) return;

        try {
            setIsDeleting(product.id);

            await deleteProduct(product.id, email);

            setProducts(prevProducts =>
                prevProducts.filter(p => p.id !== product.id)
            );

            console.log("Produit supprimé avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression du produit");
        } finally {
            setIsDeleting(null);
        }
    };

    if (isLoading) {
        return (
            <Wrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <div className="space-y-6">
                {/* En-tête avec statistiques */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gestion des Produits</h1>
                        <p className="text-base-content/70">Gérez votre inventaire de produits</p>
                    </div>
                    <Link href="/new-product" className="btn btn-primary gap-2">
                        <Plus size={20} />
                        Nouveau Produit
                    </Link>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <Package size={32} />
                            </div>
                            <div className="stat-title">Total Produits</div>
                            <div className="stat-value text-primary">{stats.totalProducts}</div>
                            <div className="stat-desc">Dans votre inventaire</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-success">
                                <TrendingUp size={32} />
                            </div>
                            <div className="stat-title">Valeur Totale</div>
                            <div className="stat-value text-success">{stats.totalValue.toFixed(2)} €</div>
                            <div className="stat-desc">Valeur du stock</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-warning">
                                <AlertCircle size={32} />
                            </div>
                            <div className="stat-title">Stock Faible</div>
                            <div className="stat-value text-warning">{stats.lowStockProducts}</div>
                            <div className="stat-desc">Produits à réapprovisionner</div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Recherche */}
                            <div className="flex-1">
                                <div className="form-control">
                                    <div className="input-group">
                                        <span className="bg-base-200">
                                            <Search size={20} />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Rechercher un produit..."
                                            className="input input-bordered w-full"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filtre par catégorie */}
                            <div className="form-control w-full md:w-64">
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

                            {/* Toggle vue */}
                            <div className="btn-group">
                                <button
                                    className={`btn ${viewMode === 'grid' ? 'btn-active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    Grille
                                </button>
                                <button
                                    className={`btn ${viewMode === 'table' ? 'btn-active' : ''}`}
                                    onClick={() => setViewMode('table')}
                                >
                                    Tableau
                                </button>
                            </div>
                        </div>

                        {/* Résultats */}
                        <div className="text-sm text-base-content/70 mt-2">
                            {filteredProducts.length} produit(s) trouvé(s)
                        </div>
                    </div>
                </div>

                {/* Liste des produits */}
                {filteredProducts.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <EmptyState
                                message={products.length === 0 ? "Aucun produit disponible" : "Aucun produit ne correspond à votre recherche"}
                                IconComponent='PackageSearch'
                            />
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
                                <figure className="px-6 pt-6 relative h-48">
                                    {product.imageUrl ? (
                                        <ProductImage
                                            src={product.imageUrl}
                                            alt={product.name}
                                            heightClass='h-full'
                                            widthClass='w-full'
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-base-200 rounded-xl flex items-center justify-center">
                                            <Package size={48} className="text-base-content/30" />
                                        </div>
                                    )}
                                    {product.quantity <= 2 && (
                                        <div className="badge badge-warning absolute top-8 right-8">
                                            Stock faible
                                        </div>
                                    )}
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title text-lg">
                                        {product.name}
                                        <div className="badge badge-secondary">{product.categoryName}</div>
                                    </h2>
                                    <p className="text-sm text-base-content/70 line-clamp-2">{product.description}</p>

                                    <div className="divider my-2"></div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-2xl font-bold text-primary">{product.price} €</div>
                                            <div className="text-sm text-base-content/70">
                                                Stock: <span className={`font-semibold ${product.quantity <= 2 ? 'text-warning' : 'text-success'}`}>
                                                    {product.quantity} {product.unit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-end mt-4">
                                        <Link
                                            href={`/update-product/${product.id}`}
                                            className="btn btn-sm btn-primary gap-2"
                                        >
                                            <Edit size={16} />
                                            Modifier
                                        </Link>
                                        <button
                                            className={`btn btn-sm btn-error gap-2 ${isDeleting === product.id ? 'loading' : ''}`}
                                            onClick={() => handleDeleteProduct(product)}
                                            disabled={isDeleting === product.id}
                                        >
                                            {!isDeleting && <Trash size={16} />}
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Nom</th>
                                        <th>Description</th>
                                        <th>Prix</th>
                                        <th>Stock</th>
                                        <th>Catégorie</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover">
                                            <td>
                                                <div className="avatar">
                                                    <div className="w-12 h-12 rounded-lg">
                                                        {product.imageUrl ? (
                                                            <ProductImage
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                heightClass='h-full'
                                                                widthClass='w-full'
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-base-200 flex items-center justify-center">
                                                                <Package size={24} className="text-base-content/30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-bold">{product.name}</div>
                                            </td>
                                            <td>
                                                <div className="text-sm opacity-70 max-w-xs truncate">
                                                    {product.description}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-semibold text-primary">{product.price} €</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${product.quantity <= 2 ? 'badge-warning' : 'badge-success'}`}>
                                                    {product.quantity} {product.unit}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="badge badge-ghost">{product.categoryName}</div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/update-product/${product.id}`}
                                                        className="btn btn-xs btn-primary gap-1"
                                                    >
                                                        <Edit size={14} />
                                                        Modifier
                                                    </Link>
                                                    <button
                                                        className={`btn btn-xs btn-error gap-1 ${isDeleting === product.id ? 'loading' : ''}`}
                                                        onClick={() => handleDeleteProduct(product)}
                                                        disabled={isDeleting === product.id}
                                                    >
                                                        {!isDeleting && <Trash size={14} />}
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

export default Page;