// src/components/produto/ProdutoCardSkeleton.tsx
export default function ProdutoCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[3/4] mb-3 rounded-none" />
      <div className="skeleton h-3 w-16 mb-2 rounded" />
      <div className="skeleton h-4 w-full mb-1 rounded" />
      <div className="skeleton h-4 w-3/4 mb-2 rounded" />
      <div className="skeleton h-5 w-24 rounded" />
    </div>
  );
}
