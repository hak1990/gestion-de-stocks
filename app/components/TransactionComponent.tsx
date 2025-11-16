 import React from 'react'
  import { Transaction } from '@/type'
  import ProductImage from './ProductImage'

  const TransactionComponent = ({ tx }: { tx: Transaction }) => {

      const formattedDate = new Date(tx.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      });

  return (
      <div className='w-full p-4 border-2 border-base-200 rounded-3xl flex items-center'>
      <div>
      {tx.imageUrl && (
      <ProductImage
      src={tx.imageUrl}
      alt={tx.productName}
      heightClass='h-12'
      widthClass='w-12'
      />
      )}
      </div>
      <div className='ml-4 flex-1'>
          <h3 className='font-bold'>{tx.productName}</h3>
          <p className='text-sm text-gray-500'>{tx.categoryName}</p>
      </div>
      <div className='text-right'>
          <p className={`font-bold ${tx.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
              {tx.type === 'IN' ? '+' : '-'}{tx.quantity} {tx.unit}
          </p>
          <p className='text-sm text-gray-500'>{formattedDate}</p>
      </div>
      </div>
  )
  }

  export default TransactionComponent

