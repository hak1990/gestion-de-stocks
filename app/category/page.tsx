"use client";
import React, { useEffect, useState, useMemo } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs';
import { Category } from '@prisma/client';
import { readCategories, deleteCategory, createCategory, updateCategory } from '../action';
import EmptyState from '../components/EmptyState';
import { Trash, Edit, Plus, Search, Tag, FolderOpen, Layers, Grid3x3, List } from 'lucide-react';
import CategoryModal from '../components/CategoryModal';

const Page = () => {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;
    const [categories, setCategories] = useState<Category[]>([]);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalName, setModalName] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        let isMounted = true;

        const fetchCategories = async () => {
            if (!email) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const fetchedCategories = await readCategories(email);

                if (isMounted && fetchedCategories) {
                    setCategories(fetchedCategories);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des catégories:", error);
                if (isMounted) {
                    setError("Impossible de charger les catégories");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCategories();

        return () => {
            isMounted = false;
        };
    }, [email]);

    // Filtrage des catégories
    const filteredCategories = useMemo(() => {
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [categories, searchTerm]);

    const handleDeleteCategory = async (category: Category) => {
        const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cette catégorie ?");
        if (!confirmDelete) return;

        try {
            setIsDeleting(category.id);

            await deleteCategory(category.id, email);

            setCategories(prevCategories =>
                prevCategories.filter(c => c.id !== category.id)
            );

            console.log("Catégorie supprimée avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression de la catégorie");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setModalName(category.name);
        setModalDescription(category.description || "");
        (document.getElementById('category_modal') as HTMLDialogElement).showModal();
    };

    const handleCreateCategory = () => {
        setSelectedCategory(null);
        setModalName("");
        setModalDescription("");
        (document.getElementById('category_modal') as HTMLDialogElement).showModal();
    };

    const handleModalClose = () => {
        setModalName("");
        setModalDescription("");
        setSelectedCategory(null);
    };

    const handleModalSubmit = async () => {
        try {
            setModalLoading(true);

            if (selectedCategory) {
                await updateCategory(selectedCategory.id, modalName, modalDescription, email);
            } else {
                await createCategory(modalName, modalDescription, email);
            }

            const fetchedCategories = await readCategories(email);
            if (fetchedCategories) {
                setCategories(fetchedCategories);
            }

            (document.getElementById('category_modal') as HTMLDialogElement).close();
            handleModalClose();
        } catch (error) {
            console.error("Erreur lors de l'opération:", error);
            alert("Une erreur est survenue");
        } finally {
            setModalLoading(false);
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

    if (error) {
        return (
            <Wrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="alert alert-error shadow-lg">
                        <span>{error}</span>
                    </div>
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gestion des Catégories</h1>
                        <p className="text-base-content/70">Organisez vos produits par catégories</p>
                    </div>
                    <button
                        className="btn btn-primary gap-2"
                        onClick={handleCreateCategory}
                    >
                        <Plus size={20} />
                        Nouvelle Catégorie
                    </button>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <Layers size={32} />
                            </div>
                            <div className="stat-title">Total Catégories</div>
                            <div className="stat-value text-primary">{categories.length}</div>
                            <div className="stat-desc">Dans votre système</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-secondary">
                                <FolderOpen size={32} />
                            </div>
                            <div className="stat-title">Résultats</div>
                            <div className="stat-value text-secondary">{filteredCategories.length}</div>
                            <div className="stat-desc">Catégories affichées</div>
                        </div>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-accent">
                                <Tag size={32} />
                            </div>
                            <div className="stat-title">Organisation</div>
                            <div className="stat-value text-accent text-xl">Active</div>
                            <div className="stat-desc">Système opérationnel</div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
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
                                            placeholder="Rechercher une catégorie..."
                                            className="input input-bordered w-full"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toggle vue */}
                            <div className="btn-group">
                                <button
                                    className={`btn gap-2 ${viewMode === 'grid' ? 'btn-active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3x3 size={18} />
                                    Grille
                                </button>
                                <button
                                    className={`btn gap-2 ${viewMode === 'table' ? 'btn-active' : ''}`}
                                    onClick={() => setViewMode('table')}
                                >
                                    <List size={18} />
                                    Tableau
                                </button>
                            </div>
                        </div>

                        {/* Résultats */}
                        <div className="text-sm text-base-content/70 mt-2">
                            {filteredCategories.length} catégorie(s) trouvée(s)
                        </div>
                    </div>
                </div>

                {/* Liste des catégories */}
                {filteredCategories.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <EmptyState
                                message={categories.length === 0 ? "Aucune catégorie disponible" : "Aucune catégorie ne correspond à votre recherche"}
                                IconComponent='PackageSearch'
                            />
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <div key={category.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
                                <div className="card-body">
                                    {/* Icône */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Tag className="text-primary" size={28} />
                                        </div>
                                        <div className="dropdown dropdown-end">
                                            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                                </svg>
                                            </label>
                                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200">
                                                <li>
                                                    <button onClick={() => handleEditCategory(category)}>
                                                        <Edit size={16} />
                                                        Modifier
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category)}
                                                        disabled={isDeleting === category.id}
                                                        className="text-error"
                                                    >
                                                        <Trash size={16} />
                                                        {isDeleting === category.id ? 'Suppression...' : 'Supprimer'}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Contenu */}
                                    <h2 className="card-title text-lg mb-2">{category.name}</h2>
                                    <p className="text-sm text-base-content/70 line-clamp-3 min-h-[60px]">
                                        {category.description || "Aucune description"}
                                    </p>

                                    <div className="divider my-2"></div>

                                    {/* Actions */}
                                    <div className="card-actions justify-end">
                                        <button
                                            className="btn btn-sm btn-primary gap-2"
                                            onClick={() => handleEditCategory(category)}
                                        >
                                            <Edit size={16} />
                                            Modifier
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
                                        <th>Catégorie</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary/10 text-primary rounded-full w-12 h-12">
                                                            <Tag size={24} />
                                                        </div>
                                                    </div>
                                                    <div className="font-bold">{category.name}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-sm opacity-70 max-w-md">
                                                    {category.description || "Aucune description"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-xs btn-primary gap-1"
                                                        onClick={() => handleEditCategory(category)}
                                                    >
                                                        <Edit size={14} />
                                                        Modifier
                                                    </button>
                                                    <button
                                                        className={`btn btn-xs btn-error gap-1 ${isDeleting === category.id ? 'loading' : ''}`}
                                                        onClick={() => handleDeleteCategory(category)}
                                                        disabled={isDeleting === category.id}
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

            <CategoryModal
                name={modalName}
                description={modalDescription}
                loading={modalLoading}
                onclose={handleModalClose}
                onChangeName={setModalName}
                onChangeDescription={setModalDescription}
                onSubmit={handleModalSubmit}
                editMode={selectedCategory !== null}
            />
        </Wrapper>
    );
};

export default Page;
