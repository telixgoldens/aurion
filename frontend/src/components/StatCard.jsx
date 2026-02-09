export default function StatCard({ label, value, accent }) {
  return (
    <div className="bg-panel rounded-xl p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-semibold mt-2 ${accent}`}>
        {value}
      </p>
    </div>
  );
}
