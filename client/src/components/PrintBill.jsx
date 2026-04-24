const PrintBill = ({ cartItems, subtotal, total }) => {
  return (
    <div className="invoice">
      <h1>Invoice</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.sku}>
              <td>{item.name}</td>
              <td>LKR {parseFloat(item.retailPrice).toFixed(2)}</td>
              <td>{item.cartQuantity}</td>
              <td>
                LKR{" "}
                {(item.cartQuantity * parseFloat(item.retailPrice)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="summary">
        <p>Subtotal: LKR {subtotal}</p>
        <p>Total: LKR {total}</p>
      </div>
    </div>
  );
};

export default PrintBill;
