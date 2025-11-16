"use client";
import React, { useState, useEffect } from 'react';
import { getStockLevelStats, StockLevelStats } from '../action';

interface Props {
    email: string;
}

const StockLevels = ({ email }: Props) => {
    const [stats, setStats] = useState<StockLevelStats>({
        normalStock: 0,
        lowStock: 0,
        outOfStock: 0
    });

    const fetchStats = async () => {
        try {
            if (email) {
                const data = await getStockLevelStats(email);
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (email) fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const levels = [
        {
            number: 1,
            label: "Stock normal",
            count: stats.normalStock,
            color: "text-success"
        },
        {
            number: 2,
            label: "Stock faible (≤ 2)",
            count: stats.lowStock,
            color: "text-warning"
        },
        {
            number: 3,
            label: "Rupture",
            count: stats.outOfStock,
            color: "text-error"
        }
    ];

    return (
        <div className="w-full border-2 border-base-200 mt-4 p-6 rounded-3xl">
            <div className="space-y-6">
                {levels.map((level, index) => (
                    <div key={level.number} className="flex items-center gap-4">
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold">
                                {level.number}
                            </div>
                            {index < levels.length - 1 && (
                                <div className="w-0.5 h-12 bg-primary/20 my-1"></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-between">
                            <span className="font-semibold text-lg">{level.label}</span>
                            <span className={`text-2xl font-bold ${level.color}`}>
                                {level.count}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockLevels;
