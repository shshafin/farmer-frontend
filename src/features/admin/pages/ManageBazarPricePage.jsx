import { useEffect, useState } from "react";
import "../styles/adminScoped.css";
import BazarListManager from "@/features/admin/components/BazarListManager";
import { fetchAllMarketPrices, deleteMarketPrice } from "@/api/authApi";
import toast, { Toaster } from "react-hot-toast";

export default function ManageBazarPricePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // ✅ Fetch bazar prices from API
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        const res = await fetchAllMarketPrices();
        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((entry) => ({
            id: entry._id,
            userId: entry.userId,
            title: "Bazar Price",
            description: entry.description || entry.note || "",
            imageUrl: entry.image || entry.imageUrl,
            recordedAt: entry.recordedAt,
            metadata: [{ label: "Location", value: entry.bazarName }],
          }));
          setEntries(formatted);
        } else {
          toast.error("Failed to load bazar prices");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching bazar prices");
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, []);

  // ✅ Delete entry
  const handleDelete = async (entry) => {
    setRemovingId(entry.id);
    try {
      const res = await deleteMarketPrice(entry.id);
      if (res?.success) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        toast.success(`Bazar price entry #${entry.id} deleted.`);
      } else {
        toast.error("Failed to delete bazar entry");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting bazar entry");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-center text-muted">Loading bazar prices...</div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <BazarListManager
        title="Manage All Bazar Price"
        description="Review recent market price submissions and remove outdated entries."
        breadcrumb={[
          { to: "/admin/dashboard", label: "Admin Dashboard" },
          { label: "Manage All Bazar Price" },
        ]}
        totalLabel={`Total Bazar Price: ${entries.length}`}
        entries={entries.map((entry) => ({
          ...entry,
          deleting: removingId === entry.id,
          onDelete: () => handleDelete(entry),
        }))}
        searchPlaceholder="Search by market name, description, or user ID"
        emptyMessage="No bazar price entries matched your search."
        confirmTitle="Delete bazar entry?"
        confirmBody={(entry) =>
          `Are you sure you want to delete bazar price entry #${entry.id}?`
        }
        deleteToastMessage={(entry) =>
          `Bazar price entry #${entry.id} deleted.`
        }
      />
    </>
  );
}
