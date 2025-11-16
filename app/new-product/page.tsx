"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "../../type";
import { createProduct, readCategories } from "../action";
import { FileImage, Upload, Package, DollarSign, Tag, Ruler, Image as ImageIcon, ArrowLeft, Check, AlertCircle } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fromData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl:"",
  });
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...fromData, [name]: value });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (email) {
          const data = await readCategories(email);
          if (data) setCategories(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories", error);
      }
    };
    fetchCategories();
  }, [email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    } else {
      toast.error('Veuillez déposer une image valide.');
    }
  };

  // Validation du formulaire
  const isFormValid = () => {
    return fromData.name &&
           fromData.description &&
           fromData.price > 0 &&
           fromData.categoryId &&
           fromData.unit &&
           file;
  };

  const handleSubmit = async () => {
    if(!file) {
      toast.error('Veuillez sélectionner une image.')
      return
    }

    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const imageData = new FormData()
      imageData.append("file", file)
      const res = await fetch ("/api/upload",{
        method : "POST",
        body : imageData
      })

      const data = await res.json();
      if (!data.success) {
        throw new Error ("Erreur lors de l'upload de l'image.")
      } else {
        fromData.imageUrl = data.path
        await createProduct(fromData, email)
        toast.success('Produit créé avec succès !')
        router.push("/products")
      }
    } catch (error) {
      console.log(error);
      toast.error('Une erreur est survenue lors de la création du produit.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/products" className="btn btn-ghost btn-sm gap-2">
                <ArrowLeft size={18} />
                Retour
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Créer un nouveau produit</h1>
            <p className="text-base-content/70 mt-1">Remplissez les informations du produit</p>
          </div>
          <div className="stats shadow">
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Étape</div>
              <div className="stat-value text-2xl">1/1</div>
              <div className="stat-desc">Informations produit</div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <Package className="text-primary" size={24} />
                  Informations de base
                </h2>

                <div className="space-y-4">
                  {/* Nom du produit */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Nom du produit *</span>
                      {fromData.name && (
                        <span className="label-text-alt text-success flex items-center gap-1">
                          <Check size={14} /> Valide
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ex: iPhone 15 Pro"
                      className={`input input-bordered w-full ${fromData.name ? 'input-success' : ''}`}
                      value={fromData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Description *</span>
                      {fromData.description && (
                        <span className="label-text-alt text-success flex items-center gap-1">
                          <Check size={14} /> Valide
                        </span>
                      )}
                    </label>
                    <textarea
                      name="description"
                      placeholder="Décrivez votre produit en détail..."
                      className={`textarea textarea-bordered w-full h-24 ${fromData.description ? 'textarea-success' : ''}`}
                      value={fromData.description}
                      onChange={handleChange}
                    ></textarea>
                    <label className="label">
                      <span className="label-text-alt">{fromData.description.length} caractères</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <DollarSign className="text-success" size={24} />
                  Prix et Unité
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prix */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Prix (€) *</span>
                      {fromData.price > 0 && (
                        <span className="label-text-alt text-success flex items-center gap-1">
                          <Check size={14} /> Valide
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      className={`input input-bordered w-full ${fromData.price > 0 ? 'input-success' : ''}`}
                      value={fromData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Unité */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Unité de mesure *</span>
                      {fromData.unit && (
                        <span className="label-text-alt text-success flex items-center gap-1">
                          <Check size={14} /> Valide
                        </span>
                      )}
                    </label>
                    <select
                      className={`select select-bordered w-full ${fromData.unit ? 'select-success' : ''}`}
                      value={fromData.unit}
                      onChange={handleChange}
                      name="unit"
                    >
                      <option value="">Sélectionner</option>
                      <option value="pcs">Pièces (pcs)</option>
                      <option value="kg">Kilogramme (kg)</option>
                      <option value="g">Gramme (g)</option>
                      <option value="l">Litre (l)</option>
                      <option value="m">Mètre (m)</option>
                      <option value="cm">Centimètre (cm)</option>
                      <option value="h">Heure (h)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Catégorie */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <Tag className="text-secondary" size={24} />
                  Catégorie
                </h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Catégorie du produit *</span>
                    {fromData.categoryId && (
                      <span className="label-text-alt text-success flex items-center gap-1">
                        <Check size={14} /> Valide
                      </span>
                    )}
                  </label>
                  <select
                    className={`select select-bordered w-full ${fromData.categoryId ? 'select-success' : ''}`}
                    value={fromData.categoryId}
                    onChange={handleChange}
                    name="categoryId"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <label className="label">
                      <span className="label-text-alt text-warning flex items-center gap-1">
                        <AlertCircle size={14} />
                        Aucune catégorie disponible. Créez-en une d&apos;abord.
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne secondaire - Image */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload d'image */}
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <ImageIcon className="text-info" size={24} />
                  Image du produit *
                </h2>

                {/* Zone de drag & drop */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                    isDragging
                      ? 'border-primary bg-primary/10 scale-105'
                      : previewUrl
                      ? 'border-success bg-success/5'
                      : 'border-base-300 hover:border-primary hover:bg-base-200/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-64 rounded-xl overflow-hidden bg-base-200">
                        <ProductImage
                          src={previewUrl}
                          alt="preview"
                          heightClass="h-full"
                          widthClass="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-outline btn-error flex-1"
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Supprimer
                        </button>
                        <label className="btn btn-sm btn-outline btn-primary flex-1">
                          Changer
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="text-primary" size={40} />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Glissez une image ici</p>
                        <p className="text-sm text-base-content/70">ou</p>
                      </div>
                      <label className="btn btn-primary gap-2">
                        <Upload size={18} />
                        Sélectionner une image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="text-xs text-base-content/60">
                        PNG, JPG, WEBP jusqu&apos;à 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Indicateur de validation */}
                <div className="mt-4">
                  {file ? (
                    <div className="alert alert-success">
                      <Check size={20} />
                      <span>Image prête à être uploadée</span>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <AlertCircle size={20} />
                      <span>L&apos;image est obligatoire</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="text-sm">
                {isFormValid() ? (
                  <p className="text-success flex items-center gap-2">
                    <Check size={18} />
                    Tous les champs sont remplis correctement
                  </p>
                ) : (
                  <p className="text-warning flex items-center gap-2">
                    <AlertCircle size={18} />
                    Veuillez remplir tous les champs obligatoires (*)
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Link href="/products" className="btn btn-ghost gap-2">
                  Annuler
                </Link>
                <button
                  className={`btn btn-primary gap-2 ${isSubmitting ? 'loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                >
                  {!isSubmitting && <Check size={18} />}
                  {isSubmitting ? 'Création en cours...' : 'Créer le produit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
