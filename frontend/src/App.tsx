import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { Layout } from "./components/Layout";
import { Wardrobe } from "./pages/Wardrobe";
import { AddItem } from "./pages/AddItem";
import { Outfits } from "./pages/Outfits";
import { CreateOutfit } from "./pages/CreateOutfit";
import { OutfitDetail } from "./pages/OutfitDetail";
import { Suggest } from "./pages/Suggest";
import { History } from "./pages/History";

function LoginPage() {
  const { signIn } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Aufi</h1>
        <p className="mb-8 text-gray-500 dark:text-gray-400">Your outfit organizer</p>
        <button
          onClick={signIn}
          className="rounded-lg bg-gray-900 px-6 py-3 text-white active:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:active:bg-gray-300"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-gray-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Wardrobe />} />
        <Route path="/items/new" element={<AddItem />} />
        <Route path="/outfits" element={<Outfits />} />
        <Route path="/outfits/new" element={<CreateOutfit />} />
        <Route path="/outfits/:id" element={<OutfitDetail />} />
        <Route path="/outfits/:id/edit" element={<CreateOutfit />} />
        <Route path="/suggest" element={<Suggest />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
