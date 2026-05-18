export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="text-gray-400 mb-6">Masuk dengan akun Google kamu</p>
        <button className="w-full bg-white text-gray-900 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition">
          🔑 Login dengan Google
        </button>
      </div>
    </div>
  );
}
