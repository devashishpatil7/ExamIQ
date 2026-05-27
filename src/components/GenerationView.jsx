export default function GenerationView({ onComplete }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Generate New Prep</h2>
      <p className="text-gray-600">Placeholder for generation wizard.</p>
      <button onClick={onComplete} className="mt-4 bg-primary text-white py-2 px-4 rounded">Done</button>
    </div>
  );
}
