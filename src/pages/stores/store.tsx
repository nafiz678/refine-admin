import {
  HttpError,
  useCreate,
  useDelete,
  useDeleteMany,
  useInvalidate,
  useUpdate,
} from "@refinedev/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { supabaseClient } from "@/lib";
import { StoreFilters, StoreFormValues, StoreRow } from "@/lib/type";
import { defaultFilters, STORE_RESOURCE } from "./components/constants";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { fetchStoreOptions, fetchStores } from "./components/queries";
import { toPayload } from "@/lib/utils";
import { StoreHeader } from "./components/store-header";
import { StoreStats } from "./components/store-stats";
import { StoreFiltersBar } from "./components/store-filters-bar";
import { StoreTable } from "./components/store-table";
import { StoreFormDialog } from "./components/store-form-dialog";
import { BulkDeleteStoresDialog } from "./components/bulk-delete-store-dialog";
import { DeleteStoreDialog } from "./components/delete-store-dialog";
import { TablesInsert, TablesUpdate } from "@/lib/supabase";

export function Store() {
  const supabase = supabaseClient;
  const invalidate = useInvalidate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState<StoreFilters>(defaultFilters);
  const debouncedFilters = useDebouncedValue(filters);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<StoreRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    setPage(1);
    setRowSelection({})
  }, [debouncedFilters, pageSize]);

  const optionsQuery = useQuery({
    queryKey: ["admin-store-options"],
    queryFn: () => fetchStoreOptions(supabase),
    staleTime: 1000 * 60 * 10,
  });

  const storesQuery = useQuery({
    queryKey: ["admin-stores", debouncedFilters, page, pageSize],
    queryFn: () =>
      fetchStores({
        supabase,
        filters: debouncedFilters,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  type StoreInsert = TablesInsert<"storeInformation">;
  type StoreUpdate = TablesUpdate<"storeInformation">;

  // mutations
  const { mutate: createStore, mutation: createMutation } = useCreate<
    StoreRow,
    HttpError,
    StoreInsert
  >();
  const { mutate: updateStore, mutation: updateMutation } = useUpdate<
    StoreRow,
    HttpError,
    StoreUpdate
  >();
  const { mutate: deleteStore, mutation: deleteMutation } = useDelete();
  const { mutate: deleteManyStores, mutation: deleteManyMutation } =
    useDeleteMany();

  const isCreating = createMutation.isPending;
  const isUpdating = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isDeletingMany = deleteManyMutation.isPending;

  const rows = storesQuery.data?.rows ?? [];
  const total = storesQuery.data?.total ?? 0;
  const pageCount = storesQuery.data?.pageCount ?? 1;
  const selectedRows = Object.keys(rowSelection);

  const refresh = useCallback(() => {
    storesQuery.refetch();
    optionsQuery.refetch();
    invalidate({ resource: STORE_RESOURCE, invalidates: ["list"] });
  }, [invalidate, optionsQuery, storesQuery]);

  const openCreate = useCallback(() => {
    setSelectedStore(null);
    setDialogMode("create");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((store: StoreRow) => {
    setSelectedStore(store);
    setDialogMode("edit");
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (values: StoreFormValues) => {
      if (dialogMode === "create") {
        createStore(
          {
            resource: STORE_RESOURCE,
            values: {
              ...toPayload(values),
              created_at: new Date().toISOString(),
            },
          },
          {
            onSuccess: () => {
              setDialogOpen(false);
              refresh();
            },
          },
        );
        return;
      }

      if (!selectedStore) return;

      updateStore(
        {
          resource: STORE_RESOURCE,
          id: selectedStore.id,
          values: toPayload(values),
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
            refresh();
          },
        },
      );
    },
    [createStore, dialogMode, refresh, selectedStore, updateStore],
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <StoreHeader
          isRefreshing={storesQuery.isFetching}
          onRefresh={refresh}
          onCreate={openCreate}
        />

        <StoreStats
          total={total}
          page={page}
          pageCount={pageCount}
          selectedCount={selectedRows.length}
        />

        <StoreFiltersBar
          filters={filters}
          setFilters={setFilters}
          cities={optionsQuery.data?.cities ?? []}
          areas={optionsQuery.data?.areas ?? []}
          onReset={() => setFilters(defaultFilters)}
        />

        <StoreTable
          rows={rows}
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          rowSelection={rowSelection}
          selectedRows={selectedRows}
          isLoading={storesQuery.isLoading}
          isFetching={storesQuery.isFetching}
          isDeleting={isDeleting}
          isDeletingMany={isDeletingMany}
          storeToDelete={storeToDelete}
          setPage={setPage}
          setPageSize={setPageSize}
          setRowSelection={setRowSelection}
          setStoreToDelete={setStoreToDelete}
          setBulkDeleteOpen={setBulkDeleteOpen}
          openEdit={openEdit}
          onToggleActive={(store) => {
            updateStore(
              {
                resource: STORE_RESOURCE,
                id: store.id,
                values: {
                  is_active: !store.is_active,
                  updated_at: new Date().toISOString(),
                },
              },
              {
                onSuccess: refresh,
              },
            );
          }}
        />
      </div>

      <StoreFormDialog
        open={dialogOpen}
        mode={dialogMode}
        store={selectedStore}
        isSaving={isCreating || isUpdating}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      <BulkDeleteStoresDialog
        open={bulkDeleteOpen}
        selectedCount={selectedRows.length}
        isDeleting={isDeletingMany}
        onOpenChange={(open) => {
          if (!isDeletingMany) setBulkDeleteOpen(open);
        }}
        onConfirm={() => {
          deleteManyStores(
            {
              resource: STORE_RESOURCE,
              ids: selectedRows,
            },
            {
              onSuccess: () => {
                setBulkDeleteOpen(false);
                setRowSelection({});
                refresh();
              },
            },
          );
        }}
      />

      <DeleteStoreDialog
        open={Boolean(storeToDelete)}
        store={storeToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setStoreToDelete(null);
        }}
        onConfirm={() => {
          if (!storeToDelete) return;

          deleteStore(
            {
              resource: STORE_RESOURCE,
              id: storeToDelete.id,
            },
            {
              onSuccess: () => {
                setStoreToDelete(null);
                refresh();
              },
            },
          );
        }}
      />
    </main>
  );
}
