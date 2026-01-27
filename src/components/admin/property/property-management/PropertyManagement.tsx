"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Pagination } from "../../../ui/pagination";
import PropertyHeader from "./PropertyHeader";
import PropertyStatistics from "./PropertyStatistics";
import PropertySearchAndFilter from "./PropertySearchAndFilter";
import PropertyTable from "./PropertyTable";
import { UpdateRateModal } from "./UpdateRateModal";
import { CreatePropertyModal } from "./CreatePropertyModal";
import { PropertyLoading } from "./PropertyLoading";
import { PropertyError } from "./PropertyError";
import { Property } from "./types";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { PropertyDetail } from "./PropertyDetail";
import { Button } from "@/components/ui/button";

const PropertyManagement: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isCreatePropertyModalOpen, setIsCreatePropertyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    properties,
    productTypes,
    blocks,
    loading,
    error,
    selectedTypeId,
    selectedProductTypeId,
    selectedRelationship,
    selectedRelationshipId,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    filteredProperties,
    setSelectedTypeId,
    setSelectedProductTypeId,
    setSelectedRelationship,
    setSelectedRelationshipId,
    setSearchQuery,
    fetchProperties,
    handlePageChange,
    handleClearFilter,
    handleUpdateRate,
    handleExportExcel,
    getPropertyTypeName,
  } = usePropertyManagement();


  const handleRateClick = (property: Property) => {
    setSelectedProperty(property);
    setIsRateModalOpen(true);
  };

  const handleAdd = () => {
    setIsCreatePropertyModalOpen(true);
  };

  const handleCreatePropertySuccess = async () => {
    await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, searchQuery);
  };

  const handleDetailClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleDetailClose = () => {
    setIsDetailModalOpen(false);
    setSelectedProperty(null);
  };

  const handleDetailEdit = async () => {
    await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, searchQuery);
  };

  const handleRateSuccess = async () => {
    try {
      await fetchProperties(currentPage, selectedTypeId, selectedProductTypeId, searchQuery);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Мэдээлэл дахин татахад алдаа гарлаа";
      toast.error(errorMsg);
    }
  };


  if (loading) {
    return <PropertyLoading />;
  }

  if (error) {
    return <PropertyError error={error} />;
  }

  return (
    <div className="space-y-6">
      <PropertyHeader
        onExportExcel={handleExportExcel}
        onAddClick={handleAdd}
      />
      <>
        <PropertyStatistics
          totalItems={totalItems || properties.length}
          currentPageItems={filteredProperties.length}
          propertyTypesCount={0}
        />

        <PropertySearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          blocks={blocks}
          selectedBlockId={selectedRelationship === "block" ? selectedRelationshipId : null}
          onBlockChange={(blockId) => {
            if (blockId === null) {
              setSelectedRelationship(null);
              setSelectedRelationshipId(null);
            } else {
              setSelectedRelationship("block");
              setSelectedRelationshipId(blockId);
            }
          }}
          selectedTypeId={selectedTypeId}
          onTypeChange={setSelectedTypeId}
          selectedProductTypeId={selectedProductTypeId}
          onProductTypeChange={setSelectedProductTypeId}
          productTypes={productTypes}
        />

        <PropertyTable
          properties={filteredProperties}
          productTypes={productTypes}
          getPropertyTypeName={getPropertyTypeName}
          selectedTypeId={selectedTypeId}
          selectedProductTypeId={selectedProductTypeId}
          searchQuery={searchQuery}
          onClearFilter={handleClearFilter}
          onRateClick={handleRateClick}
          onDetailClick={handleDetailClick}
        />

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        {/* Rate Update Modal */}
        {isRateModalOpen && (
          <UpdateRateModal
            property={selectedProperty}
            onClose={() => {
              setIsRateModalOpen(false);
            }}
            onSuccess={handleRateSuccess}
            onUpdateRate={handleUpdateRate}
          />
        )}

        {/* Create Property Modal */}
        {isCreatePropertyModalOpen && (
          <CreatePropertyModal
            onClose={() => setIsCreatePropertyModalOpen(false)}
            onSuccess={handleCreatePropertySuccess}
          />
        )}

        {/* Property Detail Modal */}
        {isDetailModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto px-4 py-8 rounded-lg">
            <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 rounded-t-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-end p-4 border-b bg-white/90 backdrop-blur rounded-t-2xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDetailClose}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="max-h-[80vh] overflow-y-auto p-6">
                <PropertyDetail
                  propertyId={selectedProperty.id}
                  property={selectedProperty}
                  onBack={handleDetailClose}
                  onRateClick={handleRateClick}
                  onRateSuccess={handleRateSuccess}
                  showBackButton={false}
                  onEdit={handleDetailEdit}
                />
              </div>
            </div>
          </div>
        )}
      </>

    </div>
  );
};

export default PropertyManagement;

