"use client"
import { Product, Transaction } from '@/type'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState, useMemo } from 'react'
import Wrapper from '../components/Wrapper'
import { getTransactions, readProducts } from '../action'
import EmptyState from '../components/EmptyState'
import TransactionComponent from '../components/TransactionComponent'
import { RotateCcw, Filter, Calendar, ArrowUpDown, TrendingUp, TrendingDown, Activity, FileText } from 'lucide-react'

const Page = () => {

  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<Product[]>([])
  const [transactions , setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
  const itemsPerPage = 10

  const fetchData = async () => {
    try {
    if (email) {
    const products = await readProducts(email)
    const txs = await getTransactions(email)
    if (products) {
    setProducts(products)
    }
    if(txs) {
    setTransactions(txs)
    }
    }
    } catch (error) {
    console.error(error)
    }
}

useEffect(() => {
    if (email)
    fetchData()
}, [email])

useEffect(() => {
    let filtered = transactions;

    if (selectedProduct) {
    filtered = filtered.filter((tx) => tx.productId === selectedProduct.id)
    }
    if (dateFrom) {
    filtered = filtered.filter((tx) => new Date(tx.createdAt) >= new Date(dateFrom))
    }

    if (dateTo) {
    filtered = filtered.filter((tx) => new Date(tx.createdAt) <= new Date(dateTo))
    }

    if (typeFilter !== 'ALL') {
    filtered = filtered.filter((tx) => tx.type === typeFilter)
    }

    // Trier par date décroissante (plus récent en premier)
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredTransactions(filtered)
    setCurrentPage(1) // Réinitialiser à la page 1 quand les filtres changent

}, [selectedProduct, dateFrom, dateTo, typeFilter, transactions])

// Statistiques des transactions
const transactionStats = useMemo(() => {
  const totalTransactions = filteredTransactions.length;
  const entriesCount = filteredTransactions.filter(tx => tx.type === 'IN').length;
  const exitsCount = filteredTransactions.filter(tx => tx.type === 'OUT').length;
  const entriesQuantity = filteredTransactions
    .filter(tx => tx.type === 'IN')
    .reduce((acc, tx) => acc + tx.quantity, 0);
  const exitsQuantity = filteredTransactions
    .filter(tx => tx.type === 'OUT')
    .reduce((acc, tx) => acc + tx.quantity, 0);

  return { totalTransactions, entriesCount, exitsCount, entriesQuantity, exitsQuantity };
}, [filteredTransactions])

// Calcul de la pagination
const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

const handlePageChange = (page: number) => {
  setCurrentPage(page)
}

const handleResetFilters = () => {
  setSelectedProduct(null)
  setDateFrom("")
  setDateTo("")
  setTypeFilter('ALL')
}

return (
<Wrapper>
  <div className="space-y-6">
    {/* En-tête */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Activity className="text-primary" size={36} />
          Historique des Transactions
        </h1>
        <p className="text-base-content/70">Suivez tous les mouvements de stock</p>
      </div>
    </div>

    {/* Statistiques */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FileText size={32} />
          </div>
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{transactionStats.totalTransactions}</div>
          <div className="stat-desc">Transactions</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-success">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Entrées</div>
          <div className="stat-value text-success">{transactionStats.entriesCount}</div>
          <div className="stat-desc">{transactionStats.entriesQuantity} unités</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-error">
            <TrendingDown size={32} />
          </div>
          <div className="stat-title">Sorties</div>
          <div className="stat-value text-error">{transactionStats.exitsCount}</div>
          <div className="stat-desc">{transactionStats.exitsQuantity} unités</div>
        </div>
      </div>

      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-info">
            <ArrowUpDown size={32} />
          </div>
          <div className="stat-title">Solde</div>
          <div className={`stat-value ${transactionStats.entriesQuantity >= transactionStats.exitsQuantity ? 'text-success' : 'text-error'}`}>
            {transactionStats.entriesQuantity - transactionStats.exitsQuantity > 0 ? '+' : ''}
            {transactionStats.entriesQuantity - transactionStats.exitsQuantity}
          </div>
          <div className="stat-desc">Net total</div>
        </div>
      </div>
    </div>

    {/* Filtres */}
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg mb-4 flex items-center gap-2">
          <Filter className="text-primary" size={24} />
          Filtres de recherche
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre par type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Type de transaction</span>
            </label>
            <div className="join w-full">
              <button
                className={`btn join-item flex-1 ${typeFilter === 'ALL' ? 'btn-active' : ''}`}
                onClick={() => setTypeFilter('ALL')}
              >
                Tous
              </button>
              <button
                className={`btn join-item flex-1 ${typeFilter === 'IN' ? 'btn-active btn-success' : ''}`}
                onClick={() => setTypeFilter('IN')}
              >
                <TrendingUp size={16} />
                Entrées
              </button>
              <button
                className={`btn join-item flex-1 ${typeFilter === 'OUT' ? 'btn-active btn-error' : ''}`}
                onClick={() => setTypeFilter('OUT')}
              >
                <TrendingDown size={16} />
                Sorties
              </button>
            </div>
          </div>

          {/* Filtre par produit */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Produit</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value) || null
                setSelectedProduct(product)
              }}
            >
              <option value="">Tous les produits</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date de début */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Calendar size={16} />
                Date de début
              </span>
            </label>
            <input
              type="text"
              placeholder='Sélectionner...'
              className='input input-bordered w-full'
              value={dateFrom}
              onFocus={(e)=> e.target.type="date"}
              onBlur={(e) => {
                if(!e.target.value) e.target.type = "text"
              }}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date de fin */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Calendar size={16} />
                Date de fin
              </span>
            </label>
            <input
              type="text"
              placeholder="Sélectionner..."
              className="input input-bordered w-full"
              value={dateTo}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text"
              }}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-base-content/70">
            {filteredTransactions.length} transaction(s) trouvée(s)
          </div>
          <button
            className="btn btn-outline btn-error gap-2"
            onClick={handleResetFilters}
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>

    {/* Liste des transactions */}
    {filteredTransactions.length === 0 ? (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <EmptyState
            message={transactions.length === 0 ? 'Aucune transaction pour le moment' : 'Aucune transaction ne correspond aux filtres'}
            IconComponent='CaptionsOff'
          />
        </div>
      </div>
    ) : (
      <>
        <div className='space-y-4'>
          {currentTransactions.map((tx) => (
            <TransactionComponent key={tx.id} tx={tx} />
          ))}
        </div>

        {/* Pagination améliorée */}
        {totalPages > 1 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                {/* Info pagination */}
                <div className="text-sm text-base-content/70">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTransactions.length)} sur {filteredTransactions.length} transactions
                </div>

                {/* Boutons pagination */}
                <div className="join">
                  <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
</Wrapper>
  )
}

export default Page
