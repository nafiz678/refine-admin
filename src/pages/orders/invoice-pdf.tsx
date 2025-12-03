import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { OrderRow } from "./order-table";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #111",
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#111",
  },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  row: { flexDirection: "row", marginBottom: 5 },
  column: { flex: 1 },
  label: { fontSize: 10, color: "#6b7280", width: 120 },
  value: { fontSize: 10, color: "#111827" },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: { padding: 5, fontSize: 10 },
  col1: { width: "15%", textAlign: "center" },
  col2: { width: "45%" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "10%", textAlign: "center" },
  col5: { width: "15%", textAlign: "right" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  totalsLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginRight: 10,
  },
  totalsValue: { fontSize: 8, color: "#111827" },
  grandTotal: { fontSize: 10, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 5,
  },
});

export function OrderInvoicePDF({
  order,
}: {
  order: OrderRow;
}) {
  const formattedDate = new Date(
    order.createdAt
  ).toLocaleDateString();

  const subtotal = order.product.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const discount = order.coupon ? 10 : 0;
  const grandTotal = subtotal - discount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Millennial Clothing
          </Text>
          <View>
            <Text style={styles.subtitle}>
              Order Invoice
            </Text>
            <Text style={styles.subtitle}>
              Date: {formattedDate}
            </Text>
            <Text style={styles.subtitle}>
              Order ID: {order.id}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer & Payment Information
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {order.user.name}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {order.user.email}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              Payment Method:
            </Text>
            <Text style={styles.value}>
              {order.paymentMethod}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Status:</Text>
            <Text style={styles.value}>
              {order.orderStatus}
            </Text>
          </View>
          {order.coupon && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Coupon Applied:
              </Text>
              <Text style={styles.value}>
                {order.coupon}
              </Text>
            </View>
          )}
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.col1]}>
                Image
              </Text>
              <Text style={[styles.tableCell, styles.col2]}>
                Title
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                Price
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                Qty
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                Total
              </Text>
            </View>

            {order.product.map((product, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View
                  style={[styles.tableCell, styles.col1]}
                >
                  {product.thumbnail && (
                    <Image
                      src={product.thumbnail}
                      style={{ width: 40, height: 40 }}
                    />
                  )}
                </View>
                <Text
                  style={[styles.tableCell, styles.col2]}
                >
                  {product.title}
                </Text>
                <Text
                  style={[styles.tableCell, styles.col3]}
                >
                  ${product.price.toFixed(2)}
                </Text>
                <Text
                  style={[styles.tableCell, styles.col4]}
                >
                  {product.quantity}
                </Text>
                <Text
                  style={[styles.tableCell, styles.col5]}
                >
                  $
                  {(
                    product.price * product.quantity
                  ).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              Subtotal:
            </Text>
            <Text style={styles.totalsValue}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              Discount:
            </Text>
            <Text style={styles.totalsValue}>
              -${discount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text
              style={[
                styles.totalsLabel,
                styles.grandTotal,
              ]}
            >
              Grand Total:
            </Text>
            <Text
              style={[
                styles.totalsValue,
                styles.grandTotal,
              ]}
            >
              ${grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This is a computer-generated invoice. For
          questions, contact Millennial support.
        </Text>
      </Page>
    </Document>
  );
}
