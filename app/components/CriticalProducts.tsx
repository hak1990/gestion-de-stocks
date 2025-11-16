"use client";
import React, { useState, useEffect } from 'react';
import { getCriticalProducts, CriticalProduct } from '../action';
import Image from 'next/image';
import EmptyState from './EmptyState';

interface Props {
    email: string;
}

const CriticalProducts = ({ email }: Props) => {
    const [products, setProducts] = useState<CriticalProduct[]>([]);

    const fetchProducts = async () => {
        try {
            if (email) {
                const data = await getCriticalProducts(email);
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (email) fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    return (
        <div className="w-full border-2 border-base-200 mt-4 p-6 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Produits critiques</h2>

            {products.length === 0 ? (
                <EmptyState
                    message="Aucun produit critique"
                    IconComponent="PackageCheck"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Quantité</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id} className="hover">
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="avatar">
                                            <div className="w-16 h-16 rounded-lg">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-base-200 flex items-center justify-center rounded-lg">
                                                        <span className="text-xs text-base-content/50">
                                                            Pas d&apos;image
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-semibold">{product.name}</td>
                                    <td>
                                        <span className={`badge ${product.quantity === 0 ? 'badge-error' : 'badge-warning'} badge-lg`}>
                                            {product.quantity} {product.unit}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CriticalProducts;
