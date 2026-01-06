import { useEffect, useState } from "react";
import "../styles/adminScoped.css";
import BazarListManager from "@/features/admin/components/BazarListManager";
import { fetchAllSeedPrices, deleteSeedPrice } from "@/api/authApi";
import toast, { Toaster } from "react-hot-toast";

export default function ManageSeedBazarPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // ✅ Fetch seed bazar prices from API
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        const res = await fetchAllSeedPrices();
        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((entry) => ({
            id: entry._id,
            userId: entry.userId,
            title: "Seed Bazar",
            description: entry.description || entry.note || "",
            imageUrl: entry.image || entry.imageUrl,
            recordedAt: entry.recordedAt,
            metadata: [{ label: "Location", value: entry.bazarName }],
          }));
          setEntries(formatted);
        } else {
          toast.error("Failed to load seed bazar entries");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while fetching seed bazar entries");
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
      const res = await deleteSeedPrice(entry.id);
      if (res?.success) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        toast.success(`Seed bazar entry #${entry.id} deleted.`);
      } else {
        toast.error("Failed to delete seed bazar entry");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting seed bazar entry");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-center text-muted">
        Loading seed bazar entries...
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <BazarListManager
        title="Manage All Seed Bazar"
        description="Review recent seed bazar submissions and keep listings tidy."
        breadcrumb={[
          { to: "/admin/dashboard", label: "Admin Dashboard" },
          { label: "Manage All Seed Bazar" },
        ]}
        totalLabel={`Total Seed Bazar: ${entries.length}`}
        entries={entries.map((entry) => ({
          ...entry,
          deleting: removingId === entry.id,
          onDelete: () => handleDelete(entry),
        }))}
        searchPlaceholder="Search by market name, description, or user ID"
        emptyMessage="No seed bazar entries matched your search."
        confirmTitle="Delete seed bazar entry?"
        confirmBody={(entry) =>
          `Are you sure you want to delete seed bazar entry #${entry.id}?`
        }
        deleteToastMessage={(entry) => `Seed bazar entry #${entry.id} deleted.`}
      />
    </>
  );
}
