import { ChartData } from '@/type';
import React, { useState, useEffect } from 'react';
import { getProductCategoryDistribution } from './action';
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Bar,
    Cell,
    LabelList
} from 'recharts';
import EmptyState from './components/EmptyState';

interface Props {
    email: string;
}

// Palette de couleurs modernes et attrayantes
const COLORS = [
    '#8B5CF6', // Violet
    '#3B82F6', // Bleu
    '#10B981', // Vert
    '#F59E0B', // Orange
    '#EF4444', // Rouge
];

const CategoryChart = ({ email }: Props) => {
    const [data, setData] = useState<ChartData[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const fetchStats = async () => {
        try {
            if (email) {
                const stats = await getProductCategoryDistribution(email);
                if (stats) {
                    setData(stats);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (email) fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    // Tooltip personnalisé
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string } }> }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-base-100 border-2 border-primary/30 rounded-xl p-4 shadow-xl">
                    <p className="font-bold text-lg mb-2">{payload[0].payload.name}</p>
                    <p className="text-primary font-semibold">
                        Nombre de produits: <span className="text-2xl">{payload[0].value}</span>
                    </p>
                    <p className="text-sm text-base-content/70 mt-1">
                        {((payload[0].value / data.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(1)}% du total
                    </p>
                </div>
            );
        }
        return null;
    };

    // Label personnalisé pour afficher la valeur au-dessus des barres
    const renderCustomLabel = (props: { x?: number; y?: number; width?: number; value?: number }) => {
        const { x, y, width, value } = props;
        if (x === undefined || y === undefined || width === undefined || value === undefined) return null;
        return (
            <text
                x={x + width / 2}
                y={y - 10}
                fill="currentColor"
                textAnchor="middle"
                className="font-bold text-sm"
            >
                {value}
            </text>
        );
    };

    const totalProducts = data.reduce((acc, item) => acc + item.value, 0);

    const renderChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={data}
                margin={{
                    top: 30,
                    right: 30,
                    left: 20,
                    bottom: 20
                }}
                barCategoryGap="20%"
            >
                <defs>
                    {COLORS.map((color, index) => (
                        <linearGradient key={index} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                            <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    label={{
                        value: 'Nombre de produits',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 12, fontWeight: 600 }
                    }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.1 }} />
                <Bar
                    dataKey="value"
                    radius={[12, 12, 0, 0]}
                    onMouseEnter={(_, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={`url(#colorGradient${index})`}
                            style={{
                                filter: hoveredIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                    <LabelList content={renderCustomLabel} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    // ----------------------------
    //      FIX DU RETURN VIDE
    // ----------------------------
    if (data.length === 0) {
        return (
            <div className="w-full border-2 border-base-200 mt-4 p-4 rounded-3xl">
                <h2 className="text-lg font-semibold mb-4">
                    5 catégories avec le plus de produits
                </h2>
                <EmptyState
                    message="Aucun produit disponible"
                    IconComponent="PackageSearch"
                />
            </div>
        );
    }

    return (
        <div className="w-full border-2 border-base-200 mt-4 p-6 rounded-3xl bg-gradient-to-br from-base-100 to-base-200/30">
            {/* En-tête avec statistiques */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold mb-2">
                        Top 5 Catégories
                    </h2>
                    <p className="text-sm text-base-content/70">
                        Distribution des produits par catégorie
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="stats shadow">
                        <div className="stat py-3 px-4">
                            <div className="stat-title text-xs">Total Produits</div>
                            <div className="stat-value text-2xl text-primary">{totalProducts}</div>
                        </div>
                    </div>
                    <div className="stats shadow">
                        <div className="stat py-3 px-4">
                            <div className="stat-title text-xs">Catégories</div>
                            <div className="stat-value text-2xl text-secondary">{data.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphique */}
            <div className="bg-base-100 rounded-2xl p-4 shadow-sm">
                {renderChart()}
            </div>

            {/* Légende colorée */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-xl bg-base-100 hover:shadow-md transition-all cursor-pointer border border-base-300"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index] }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{item.name}</p>
                            <p className="text-xs text-base-content/70">{item.value} produits</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryChart;
