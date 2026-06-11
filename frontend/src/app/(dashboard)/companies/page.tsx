"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Building2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CompanyStats {
  company: string;
  totalQuestions: number;
  solvedQuestions: number;
  difficultyBreakdown: {
    Easy: { total: number; solved: number };
    Medium: { total: number; solved: number };
    Hard: { total: number; solved: number };
  };
}

// Map of common tech companies to their logos
const COMPANY_LOGOS: Record<string, string> = {
  Google: "https://logo.clearbit.com/google.com",
  Amazon: "https://logo.clearbit.com/amazon.com",
  Microsoft: "https://logo.clearbit.com/microsoft.com",
  Meta: "https://logo.clearbit.com/meta.com",
  Apple: "https://logo.clearbit.com/apple.com",
  Netflix: "https://logo.clearbit.com/netflix.com",
  Uber: "https://logo.clearbit.com/uber.com",
  Adobe: "https://logo.clearbit.com/adobe.com",
  Atlassian: "https://logo.clearbit.com/atlassian.com",
  LinkedIn: "https://logo.clearbit.com/linkedin.com",
};

export default function CompaniesPage() {
  const { request, loading } = useApi();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await request<{ success: boolean; data: CompanyStats[] }>({
        url: "/api/questions/companies",
        method: "GET",
      });
      setCompanies(response.data?.data || []);
    } catch (error) {
      showToast("Failed to load companies data", "error");
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted">Target your preparation by company-specific questions.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-shadow"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map((stat) => {
            const progress = stat.totalQuestions > 0 ? Math.round((stat.solvedQuestions / stat.totalQuestions) * 100) : 0;
            const logoUrl = COMPANY_LOGOS[stat.company];

            return (
              <Link 
                href={`/dsa-tracker?company=${encodeURIComponent(stat.company)}`} 
                key={stat.company}
                className="group bg-surface hover:bg-surface-hover rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c5ce7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={logoUrl} 
                          alt={`${stat.company} logo`} 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Building2 className={`w-6 h-6 text-muted ${logoUrl ? 'hidden' : ''}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-[#6c5ce7] transition-colors">{stat.company}</h3>
                      <p className="text-sm text-muted">{stat.totalQuestions} Questions</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-muted">Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                    <div className="flex gap-3 text-xs">
                      <div className="flex flex-col">
                        <span className="text-emerald-500 font-semibold">{stat.difficultyBreakdown.Easy.solved}/{stat.difficultyBreakdown.Easy.total}</span>
                        <span className="text-[10px] text-muted uppercase">Easy</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-amber-500 font-semibold">{stat.difficultyBreakdown.Medium.solved}/{stat.difficultyBreakdown.Medium.total}</span>
                        <span className="text-[10px] text-muted uppercase">Med</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-rose-500 font-semibold">{stat.difficultyBreakdown.Hard.solved}/{stat.difficultyBreakdown.Hard.total}</span>
                        <span className="text-[10px] text-muted uppercase">Hard</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted group-hover:text-[#6c5ce7] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredCompanies.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl">
              <Building2 className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No companies found</p>
              <p className="text-sm text-muted">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
