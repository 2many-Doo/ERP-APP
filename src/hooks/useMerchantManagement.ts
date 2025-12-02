import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getMerchants } from "@/lib/api";

export interface Merchant {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  family_name?: string;
  code?: string;
  email?: string;
  phone?: string;
  contact?: string;
  address?: string;
  status?: string;
  registeredDate?: string;
  totalTransactions?: number;
  revenue?: string | number;
  rd?: string;
  type?: string;
  owner_id?: number;
  gender?: string | null;
  created_at?: string;
  updated_at?: string;
  properties?: any[];
  lease_requests?: any[];
  lease_agreements?: any[];
  vehicle_access_requests?: any[];
}

export const useMerchantManagement = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [orderby, setOrderby] = useState<string>("name");
  const [order, setOrder] = useState<string>("asc");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMerchants = async (
    page: number,
    search?: string | null,
    orderBy?: string | null,
    orderDirection?: string | null
  ) => {
    setLoading(true);
    setError(null);
    try {
      const filterSearch = search !== undefined ? search : debouncedSearchQuery;
      const filterOrderby = orderBy !== undefined && orderBy !== null ? orderBy : orderby;
      const filterOrder = orderDirection !== undefined && orderDirection !== null ? orderDirection : order;
      
      const merchantsResponse = await getMerchants(
        page,
        50,
        filterOrderby,
        filterOrder,
        filterSearch
      );

      if (merchantsResponse.error) {
        setError(merchantsResponse.error);
        toast.error(`Мерчант татахад алдаа гарлаа: ${merchantsResponse.error}`);
      } else if (merchantsResponse.data) {
        let merchantsData: Merchant[] = [];
        let paginationInfo: any = {};
        
        const responseData = merchantsResponse.data as any;
        
        if (responseData.data && Array.isArray(responseData.data)) {
          merchantsData = responseData.data;
          paginationInfo = responseData.meta || {};
        } else if (Array.isArray(responseData)) {
          merchantsData = responseData;
        }
        
        setMerchants(merchantsData);
        
        if (paginationInfo.last_page !== undefined && paginationInfo.last_page !== null) {
          setTotalPages(paginationInfo.last_page);
        } else if (paginationInfo.total_pages !== undefined && paginationInfo.total_pages !== null) {
          setTotalPages(paginationInfo.total_pages);
        } else if (paginationInfo.total !== undefined && paginationInfo.total !== null && paginationInfo.per_page !== undefined) {
          const total = paginationInfo.total;
          const perPage = paginationInfo.per_page || 50;
          setTotalPages(Math.ceil(total / perPage));
        } else {
          setTotalPages(1);
        }
        
        if (paginationInfo.total !== undefined && paginationInfo.total !== null) {
          setTotalItems(paginationInfo.total);
        } else {
          setTotalItems(merchantsData.length);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(errorMsg);
      toast.error(`Мерчант татахад алдаа гарлаа: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants(1, null, null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      setCurrentPage(1);
      fetchMerchants(1, debouncedSearchQuery, orderby, order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMerchants(page, debouncedSearchQuery, orderby, order);
  };

  const handleSort = (newOrderby: string) => {
    const newOrder = orderby === newOrderby && order === "asc" ? "desc" : "desc";
    setOrderby(newOrderby);
    setOrder(newOrder);
    setCurrentPage(1);
    fetchMerchants(1, debouncedSearchQuery, newOrderby, newOrder);
  };

  // Calculate statistics
  const activeMerchants = merchants.filter((m) => m.status === "Идэвхтэй" || m.status === "active").length;
  const inactiveMerchants = merchants.filter((m) => m.status === "Идэвхгүй" || m.status === "inactive").length;
  const totalRevenue = merchants.reduce((sum, m) => {
    if (typeof m.revenue === "number") {
      return sum + m.revenue;
    } else if (typeof m.revenue === "string") {
      const revenue = parseInt(m.revenue.replace(/[₮ ,]/g, ""));
      return sum + (isNaN(revenue) ? 0 : revenue);
    }
    return sum;
  }, 0);

  return {
    // State
    merchants,
    loading,
    error,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    orderby,
    order,
    activeMerchants,
    inactiveMerchants,
    totalRevenue,
    
    // Setters
    setSearchQuery,
    
    // Functions
    fetchMerchants,
    handlePageChange,
    handleSort,
  };
};

