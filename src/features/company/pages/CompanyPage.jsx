import { useEffect, useState } from "react";
import { fetchAllCompanies } from "@/api/authApi";
import Pesticide from "../components/Pesticide";

export default function CompanyPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const getCompanies = async () => {
      try {
        const response = await fetchAllCompanies();
        // ধরো response.data তে company list আছে
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    getCompanies();
  }, []);

  return <Pesticide items={companies} />;
}
