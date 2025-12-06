import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { OrderInvoicePDF } from "./invoice-pdf";
import { EnrichedOrderRow } from "./order-table";

interface InvoiceDrawerProps {
  previewOrder: EnrichedOrderRow | null;
  setPreviewOrder: (order: EnrichedOrderRow | null) => void;
}

export default function InvoiceDrawer({
  previewOrder,
  setPreviewOrder,
}: InvoiceDrawerProps) {
  const isOpen = Boolean(previewOrder);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={() => setPreviewOrder(null)}
      direction="top"
    >
      <DrawerContent className="w-full h-full p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DrawerHeader className="px-4 py-3 border-b sticky top-0 bg-white z-10">
          <DrawerTitle>Invoice Preview</DrawerTitle>
        </DrawerHeader>

        {/* PDF Preview */}
        <div className="flex-1 w-full h-full overflow-auto">
          {previewOrder && (
            <PDFViewer width={"100%"} height={"100%"}>
              <OrderInvoicePDF order={previewOrder} />
            </PDFViewer>
          )}
        </div>
        {/* Footer */}
        <DrawerFooter className="px-4 py-3 border-t sticky bottom-0 bg-white z-10 flex justify-between">
          {previewOrder && (
            <PDFDownloadLink
              document={<OrderInvoicePDF order={previewOrder} />}
              fileName={`Invoice_${previewOrder.id}.pdf`}
            >
              {({ loading }) => (
                <Button className="w-full">
                  {loading ? "Preparing..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
          <Button variant="outline" onClick={() => setPreviewOrder(null)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
