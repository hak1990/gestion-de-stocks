"use client";

import React, { useEffect, useState, use } from "react";
import Wrapper from "../../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "../../../type";
import { updateProduct, readCategories, readProductsById } from "../../action";
import { FileImage } from "lucide-react";
import ProductImage from "../../components/ProductImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const router = useRouter();
  const { id } = use(params);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: "",
    unit: "",
    imageUrl: "",
  });

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (email) {
          const data = await readCategories(email);
          if (data) setCategories(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories", error);
        toast.error("Erreur lors du chargement des catégories");
      }
    };
    fetchCategories();
  }, [email]);

  // Charger le produit existant
  useEffect(() => {
    const fetchProduct = async () => {
      if (!email || !id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const product = await readProductsById(id, email);

        if (!product) {
          toast.error("Produit non trouvé");
          router.push("/products");
          return;
        }

        setFormData({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity || 0,
          categoryId: product.categoryId || "",
          unit: product.unit || "",
          imageUrl: product.imageUrl || "",
        });

        if (product.imageUrl) {
          setPreviewUrl(product.imageUrl);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        toast.error("Erreur lors du chargement du produit");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [email, id, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // Si une nouvelle image a été sélectionnée, l'uploader
      if (file) {
        const imageData = new FormData();
        imageData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: imageData,
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error("Erreur lors de l'upload de l'image.");
        }

        imageUrl = data.path;

        // Supprimer l'ancienne image si elle existe
        if (formData.imageUrl && formData.imageUrl.startsWith('/uploads/')) {
          try {
            await fetch("/api/upload", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ path: formData.imageUrl }),
            });
          } catch (deleteError) {
            console.warn("Impossible de supprimer l'ancienne image:", deleteError);
          }
        }
      }

      // Mettre à jour le produit
      await updateProduct(
        {
          ...formData,
          imageUrl: imageUrl,
        },
        email
      );

      toast.success("Produit mis à jour avec succès.");
      router.push("/products");
    } catch (error) {
      console.log(error);
      toast.error("Il y a une erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Wrapper>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Chargement du produit...</div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
          <section className="flex md:flex-row flex-col">
            <div className="space-y-4 md:w-[450px]">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="Description"
                className="textarea textarea-bordered w-full"
                value={formData.description}
                onChange={handleChange}
              ></textarea>

              <input
                type="number"
                name="price"
                placeholder="Prix"
                className="input input-bordered w-full"
                value={formData.price}
                onChange={handleChange}
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantité"
                className="input input-bordered w-full"
                value={formData.quantity}
                onChange={handleChange}
              />
              <select
                className="select select-bordered w-full"
                value={formData.categoryId}
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

              <select
                className="select select-bordered w-full"
                value={formData.unit}
                onChange={handleChange}
                name="unit"
              >
                <option value="">Sélectionner l&apos;unité</option>
                <option value="g">Gramme</option>
                <option value="kg">Kilogramme</option>
                <option value="l">Litre</option>
                <option value="m">Mètre</option>
                <option value="cm">Centimètre</option>
                <option value="h">Heure</option>
                <option value="pcs">Pièces</option>
              </select>

              <div>
                <label className="label">
                  <span className="label-text">Changer l&apos;image (optionnel)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                />
              </div>

              <button
                className={`btn btn-primary w-full ${isSubmitting ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mise à jour..." : "Mettre à jour le produit"}
              </button>
            </div>
            <div className="md:ml-4 md:w-[300px] mt-4 md:mt-0 border-2 border-primary md:h-[300px] p-5 flex justify-center items-center rounded-3xl">
              {previewUrl && previewUrl !== "" ? (
                <div>
                  <ProductImage
                    src={previewUrl}
                    alt="preview"
                    heightClass="h-40"
                    widthClass="w-40"
                  />
                </div>
              ) : (
                <div className="wiggle-animation">
                  <FileImage
                    strokeWidth={1}
                    className="h-20 w-20 text-primary"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
