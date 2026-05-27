export default function Dashboard({ materials, scores, onViewChange, userName }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, {userName}</h2>
      <p className="mb-6">This is a placeholder Dashboard. Implement your stats and quick actions here.</p>
    </div>
  );
}
