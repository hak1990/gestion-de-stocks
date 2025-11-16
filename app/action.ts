"use server";

import prisma from "@/lib/prisma";
import { FormDataType, OrderItem, Product, Transaction, ProductOverviewStats, ChartData } from "@/type";
import { Category } from "@prisma/client";

/**
 * Vérifie l'existence d'une association et la crée si elle n'existe pas
 * Cette fonction assure que chaque utilisateur a une association pour la multi-tenant isolation
 * @param email - L'email de l'association à vérifier ou créer
 * @param name - Le nom de l'association à créer si elle n'existe pas
 * @returns Promise<void>
 */
export async function checkAndAddAssociation(email: string, name: string) {
  if (!email) return;
  try {
    // Recherche d'une association existante par email
    const existingAssociation = await prisma.association.findUnique({
      where: {
        email,
      },
    });
    // Crée une nouvelle association uniquement si elle n'existe pas et qu'un nom est fourni
    if (!existingAssociation && name) {
      await prisma.association.create({
        data: {
          name,
          email,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Récupère une association depuis la base de données en utilisant l'email
 * Cette fonction est essentielle pour la multi-tenant isolation : elle permet de récupérer
 * l'associationId qui sera utilisé dans toutes les requêtes pour isoler les données
 * @param email - L'email de l'association à récupérer
 * @returns Promise<Association | undefined> - L'association trouvée ou undefined
 */
export async function getAssociation(email: string) {
  if (!email) return;
  try {
    // Requête unique basée sur l'email qui est défini comme clé unique dans le schéma
    const existingAssociation = await prisma.association.findUnique({
      where: {
        email,
      },
    });
    return existingAssociation;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Crée une nouvelle catégorie de produits pour une association
 * @param name - Le nom de la catégorie (obligatoire)
 * @param description - La description de la catégorie (optionnel)
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 */
export async function createCategory(
  name: string,
  description: string,
  email: string
) {
  if (!name) return;
  try {
    // Récupération de l'association pour garantir l'isolation des données (multi-tenancy)
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Création de la catégorie liée à l'associationId
    await prisma.category.create({
      data: {
        name,
        description: description || "",
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Met à jour une catégorie existante
 * @param id - L'identifiant unique de la catégorie à modifier
 * @param name - Le nouveau nom de la catégorie
 * @param description - La nouvelle description de la catégorie
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 * @throws Error si l'id, l'email ou le nom sont manquants
 */
export async function updateCategory(
  id: string,
  name: string,
  description: string,
  email: string
) {
  if (!id || !email || !name)
    throw new Error("L'id, l'email et le nom de la catégorie sont requis");
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // La clause where avec associationId garantit qu'on ne peut modifier que les catégories de sa propre association
    await prisma.category.update({
      where: {
        id: id,
        associationId: association.id,
      },
      data: {
        name,
        description: description || "",
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Supprime une catégorie de la base de données
 * @param id - L'identifiant unique de la catégorie à supprimer
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 * @throws Error si l'id ou l'email sont manquants
 */
export async function deleteCategory(id: string, email: string) {
  if (!id || !email)
    throw new Error("L'id et l'email de la catégorie sont requis");
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // La clause where avec associationId empêche la suppression de catégories d'autres associations
    await prisma.category.delete({
      where: {
        id: id,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Récupère toutes les catégories d'une association
 * @param email - L'email de l'association
 * @returns Promise<Category[] | undefined> - La liste des catégories ou undefined en cas d'erreur
 * @throws Error si l'email est manquant
 */
export async function readCategories(
  email: string
): Promise<Category[] | undefined> {
  if (!email) throw new Error("L'email de la catégorie est requis");
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Récupère uniquement les catégories de l'association courante (isolation des données)
    const categories = await prisma.category.findMany({
      where: {
        associationId: association.id,
      },
    });
    return categories;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Crée un nouveau produit dans l'inventaire
 * @param formData - Les données du formulaire contenant les informations du produit
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 * @throws Error si les champs obligatoires (name, price, categoryId, email) sont manquants
 */
export async function createProduct(formData: FormDataType, email: string) {
  try {
    const { name, description, price, imageUrl, categoryId, unit } = formData;
    if (!email || !name || !price || !categoryId)
      throw new Error(
        "le nom, le prix, la categories et l'email de l'association sont requis pour la création du produit."
      );
    // Valeurs par défaut pour les champs optionnels
    const safeImageUrl = imageUrl || "";
    const safeUnit = unit || "";

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Création du produit lié à l'association et à une catégorie
    await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: safeImageUrl,
        categoryId,
        unit: safeUnit,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Met à jour un produit existant dans l'inventaire
 * @param formData - Les données du formulaire avec les nouvelles informations du produit
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 * @throws Error si l'id, le prix ou l'email sont manquants
 */
export async function updateProduct(formData: FormDataType, email: string) {
  try {
    const { id, name, description, price, imageUrl, categoryId, unit, quantity } = formData;
    if (!email || !price || !id)
      throw new Error(
        "L'id, le nom, le prix,et l'email sont requis pour la mise à jour du produit."
      );

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // La clause where avec associationId garantit qu'on ne peut modifier que les produits de sa propre association
    await prisma.product.update({
      where: {
        id: id,
        associationId: association.id,
      },
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl,
        categoryId: categoryId,
        unit: unit || "",
        quantity: quantity ? Number(quantity) : 0,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Supprime un produit de l'inventaire
 * @param id - L'identifiant unique du produit à supprimer
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 * @throws Error si l'id est manquant
 */
export async function deleteProduct(id: string, email: string) {
  try {
    if (!id) throw new Error("L'id est requis pour la suppression.");

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // La clause where avec associationId empêche la suppression de produits d'autres associations
    await prisma.product.delete({
      where: {
        id: id,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Récupère tous les produits d'une association avec les informations de catégorie
 * @param email - L'email de l'association
 * @returns Promise<Product[] | undefined> - La liste des produits enrichis avec le nom de catégorie
 * @throws Error si l'email est manquant
 */
export async function readProducts(
  email: string
): Promise<Product[] | undefined> {
  try {
    if (!email) throw new Error("L'email est requis.");

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Récupère les produits avec leur catégorie associée
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });
    // Enrichit chaque produit avec le nom de sa catégorie pour un accès facilité
    return products.map((product) => ({
      ...product,
      categoryName: product.category?.name,
    }));
  } catch (error) {
    console.error(error);
  }
}

/**
 * Type étendu de Product qui inclut le nom de la catégorie
 * Utilisé pour faciliter l'affichage des produits avec leur catégorie
 */
export type ProductWithCategoryName = Product & {
  categoryName?: string;
};

/**
 * Récupère un produit spécifique par son identifiant avec les informations de catégorie
 * @param productId - L'identifiant unique du produit à récupérer
 * @param email - L'email de l'association propriétaire
 * @returns Promise<ProductWithCategoryName | undefined> - Le produit enrichi avec le nom de catégorie ou undefined
 * @throws Error si l'email est manquant
 */
export async function readProductsById(
  productId: string,
  email: string
): Promise<ProductWithCategoryName | undefined> {
  try {
    if (!email) throw new Error("L'email est requis.");

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // La clause where avec associationId garantit qu'on ne peut accéder qu'aux produits de sa propre association
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return undefined;
    }

    // Retourne le produit enrichi avec le nom de sa catégorie
    return {
      ...product,
      categoryName: product.category?.name,
    };
  } catch (error) {
    console.error(error);
  }
}

/**
 * Réapprovisionne le stock d'un produit et enregistre la transaction
 * Cette fonction incrémente la quantité du produit et crée une transaction de type "IN"
 * @param productId - L'identifiant unique du produit à réapprovisionner
 * @param quantity - La quantité à ajouter (doit être > 0)
 * @param email - L'email de l'association propriétaire
 * @returns Promise<void>
 * @throws Error si la quantité est <= 0 ou si l'email est manquant
 */
export async function replenishStockWithTransaction(productId: string, quantity: number, email: string) {
  try {
    if (quantity <= 0) throw new Error("La quantité doit être > 0");
    if (!email) throw new Error("L'email est requis.");

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Incrémente la quantité du produit de manière atomique
    await prisma.product.update({
      where: {
        id: productId,
        associationId: association.id,
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
      include: {
        category: true,
      },
    });

    // Enregistre une transaction de type "IN" pour tracer l'entrée de stock
    await prisma.transaction.create({
      data :{
        type : "IN",
        quantity : quantity,
        productId: productId,
        associationId: association.id
      }
    })
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Déduit du stock pour une liste de produits commandés et enregistre les transactions
 * Cette fonction valide d'abord les quantités disponibles avant de procéder aux déductions
 * Utilise une transaction Prisma pour garantir l'atomicité des opérations
 * @param orderItems - Tableau des articles commandés avec productId et quantité
 * @param email - L'email de l'association propriétaire
 * @returns Promise<{success: boolean, message?: any}> - Résultat de l'opération
 */
export async function deductStockWithTransaction(orderItems: OrderItem[], email: string) {
  try {
    if (!email) {
      throw new Error("L'email est requis.");
    }

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Phase de validation : vérifie la disponibilité avant toute modification
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Produit avec l'ID ${item.productId} introuvable.`);
      }
      // Validation de la quantité demandée
      if (item.quantity <= 0) {
        throw new Error(`La quantité demandée pour "${product.name}" doit être supérieure à zéro.`);
      }
      // Vérification du stock disponible
      if (product.quantity < item.quantity) {
        throw new Error(`Le produit "${product.name}" n'a pas assez de stock. Demandé: ${item.quantity},
    Disponible: ${product.quantity} / ${product.unit}.`);
      }
    }

    // Transaction atomique : toutes les opérations réussissent ou échouent ensemble
    await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        // Décrémente la quantité du produit
        await tx.product.update({
          where: {
            id: item.productId,
            associationId: association.id
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        // Enregistre une transaction de type "OUT" pour tracer la sortie de stock
        await tx.transaction.create({
          data: {
            type: "OUT",
            quantity: item.quantity,
            productId: item.productId,
            associationId: association.id
          },
        });
      }
    })

    return {success:true}

  } catch (error) {
   console.error(error)
   return {success: false, message : error}
  }
}

/**
 * Récupère l'historique des transactions (entrées/sorties de stock) avec détails des produits
 * @param email - L'email de l'association
 * @param limit - Nombre maximum de transactions à récupérer (optionnel)
 * @returns Promise<Transaction[]> - Liste des transactions enrichies avec les informations produit et catégorie
 */
export async function getTransactions(email: string, limit?: number): Promise<Transaction[]> {
  try {
    if (!email) {
      throw new Error("L'email est requis.");
    }

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Récupère les transactions avec les relations produit et catégorie
    const transactions = await prisma.transaction.findMany({
      where: {
        associationId: association.id,
      },
      take:limit,
      include: {
        product: {
          include:{
            category:true
          }
      },
    }
    });

    // Enrichit chaque transaction avec les détails du produit pour un affichage complet
   return transactions.map((tx) => ({
  ...tx,
  categoryName: tx.product.category.name,
  productName: tx.product.name,
  imageUrl: tx.product.imageUrl,
  price: tx.product.price,
  unit: tx.product.unit,
}))
} catch (error) {
  console.error(error)
  return []
}
} 


/**
 * Calcule les statistiques globales de l'inventaire pour le tableau de bord
 * @param email - L'email de l'association
 * @returns Promise<ProductOverviewStats> - Statistiques incluant nombre de produits, catégories, transactions et valeur totale du stock
 */
export async function getProductOverviewStats(email: string): Promise<ProductOverviewStats> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Récupère tous les produits avec leurs catégories
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id
      },
      include: {
        category: true
      }
    });

    // Récupère toutes les transactions pour le comptage
    const transactions = await prisma.transaction.findMany({
      where: {
        associationId: association.id
      }
    });

    // Utilise un Set pour obtenir le nombre de catégories uniques
    const categoriesSet = new Set(products.map((product) => product.category.name));

    const totalProducts = products.length;
    const totalCategories = categoriesSet.size;
    const totalTransactions = transactions.length;
    // Calcule la valeur totale du stock (prix × quantité pour chaque produit)
    const stockValue = products.reduce((acc, product) => {
      return acc + product.price * product.quantity;
    }, 0);

    return {
      totalProducts,
      totalCategories,
      totalTransactions,
      stockValue,
    };
  } catch (error) {
    console.error(error);
    return {
      totalProducts: 0,
      totalCategories: 0,
      totalTransactions: 0,
      stockValue: 0,
    };
  }
}


export async function getProductCategoryDistribution(email: string): Promise<ChartData[]> {
    try {
        if (!email) {
            throw new Error("l'email est requis.");
        }

        const association = await getAssociation(email);
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.");
        }

        const R = 5;

        const categoriesWithProductCount = await prisma.category.findMany({
            where: {
                associationId: association.id
            },
            include: {
                products: {
                    select: {
                        id: true
                    }
                }
            }
        });

        const data = categoriesWithProductCount
            .map((category) => ({
                name: category.name,
                value: category.products.length
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, R);

        return data;

    } catch (error) {
        console.error(error);
        return [];
    }
}

export interface StockLevelStats {
    normalStock: number;
    lowStock: number;
    outOfStock: number;
}

export async function getStockLevelStats(email: string): Promise<StockLevelStats> {
    try {
        if (!email) {
            throw new Error("L'email est requis.");
        }

        const association = await getAssociation(email);
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.");
        }

        const products = await prisma.product.findMany({
            where: {
                associationId: association.id
            }
        });

        const normalStock = products.filter(p => p.quantity > 2).length;
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 2).length;
        const outOfStock = products.filter(p => p.quantity === 0).length;

        return {
            normalStock,
            lowStock,
            outOfStock
        };
    } catch (error) {
        console.error(error);
        return {
            normalStock: 0,
            lowStock: 0,
            outOfStock: 0
        };
    }
}

export interface CriticalProduct {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    imageUrl: string | null;
}

export async function getCriticalProducts(email: string): Promise<CriticalProduct[]> {
    try {
        if (!email) {
            throw new Error("L'email est requis.");
        }

        const association = await getAssociation(email);
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.");
        }

        const products = await prisma.product.findMany({
            where: {
                associationId: association.id,
                quantity: {
                    lte: 2
                }
            },
            orderBy: {
                quantity: 'asc'
            },
            select: {
                id: true,
                name: true,
                quantity: true,
                unit: true,
                imageUrl: true
            }
        });

        return products;
    } catch (error) {
        console.error(error);
        return [];
    }
}
