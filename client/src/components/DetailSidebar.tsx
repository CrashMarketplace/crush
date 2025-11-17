const INFO_ITEMS = [
  { label: "브랜드", value: "브랜드명" },
  { label: "제품상태", value: "상" },
  { label: "구매일자", value: "2025.01" },
  { label: "거래방식", value: "채팅시에 결정" },
  { label: "배송비", value: "배송비 별도" },
] as const;

export default function DetailSidebar() {
  return (
    <aside className="card p-4 text-sm text-gray-700">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {INFO_ITEMS.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 last:border-none"
          >
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-medium text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
