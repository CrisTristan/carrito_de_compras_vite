import { useState, useEffect} from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [discountProductId, setDiscountProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountedIds, setDiscountedIds] = useState(new Set());
  const [card, setCard] = useState({
    cardNumber: "",
    cardHolder: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });
  const [cardStatus, setCardStatus] = useState(null);
  const [cardErrors, setCardErrors] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [productsWithDiscount, setProductsWithDiscount] = useState([]); //[{productId, beforeDiscount, afterDiscount }]


  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));

    loadCart();
  }, []);

  useEffect(() => {

      if (cardStatus === "success" && cart.length > 0) {
        setTimeout(() => {
          setShowSuccessModal(true);
          setCardStatus(null);
          setCard({
            cardNumber: "",
            cardHolder: "",
            expMonth: "",
            expYear: "",
            cvv: "",
          });
          clearCart();
        }, 5000);
      }
  }, [cardStatus]);



  useEffect(() => {
    if(cart.length > 0){
      console.log(cart);
    }
  }, [cart]);

  useEffect(() => {
    console.log(productsWithDiscount);
  }, [productsWithDiscount]);

  const loadCart = () => {
    fetch("http://localhost:3000/cart")
      .then((res) => res.json())
      .then((data) => setCart(data));

    fetch("http://localhost:3000/cart/total")
      .then((res) => res.json())
      .then((data) => setTotal(data));
  };

  const addToCart = (product) => {
    fetch("http://localhost:3000/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    }).then(() => loadCart());
  };

  const removeFromCart = (id) => {
    fetch(`http://localhost:3000/cart/remove/${id}`, {
      method: "POST",
    }).then(() => loadCart());
  };

  const clearCart = async () => {
    await fetch("http://localhost:3000/cart/clear", {
      method: "POST",
      body: JSON.stringify({}),
    });
    loadCart();
  };

  const onDiscountApplied = (productId, beforeDiscount, afterDiscount, discountPercent) => {
    setProductsWithDiscount((prev) => {
      const existing = prev.find((p) => p.productId === productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === productId
            ? { ...p, beforeDiscount, afterDiscount, discountPercent }
            : p,
        );
      } else {
        return [...prev, { productId, beforeDiscount, afterDiscount, discountPercent }];
      }
    });
  };

  const applyDiscount = () => {
    const percent = parseFloat(discountPercent);
    if (!discountProductId || isNaN(percent) || percent <= 0 || percent > 100)
      return;

    if (discountedIds.has(String(discountProductId))) return; //validación solo se puede aplicar un descuento por producto

    fetch(
      `http://localhost:3000/cart/discount/${encodeURIComponent(discountProductId)}?percent=${percent}`,
      {
        method: "POST",
      },
    )
    .then((res) => res.json())
    .then((data) => {
      console.log("discount response", data);
      //buscar el precio actual del producto con el productId en el carrito
      const productInCart = cart.find(
        (p) => String(p.productId) === String(discountProductId),
      );
      const beforeDiscount = productInCart?.price || 0;
      const afterDiscount = data.price || beforeDiscount;
      onDiscountApplied(discountProductId, beforeDiscount, afterDiscount, percent);
    })
    .then(() => {
      setDiscountedIds((prev) => new Set(prev).add(String(discountProductId)));
      loadCart();
      setDiscountProductId("");
      setDiscountPercent("");
    });
  };

  const getProductImage = (productId) => {
    const product = products.find((p) => p.productId === productId);
    return product?.imageUrl || "";
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");
    // Add hyphens every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1-");
    return formatted;
  };

  const handleCardChange = (field, value) => {
    if (field === "cardNumber") {
      value = formatCardNumber(value);
    }
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const validateCard = () => {
    setCardStatus(null);
    setCardErrors([]);

    const body = {
      cardNumber: card.cardNumber.replace(/\D/g, ""),
      cardHolder: card.cardHolder,
      expMonth: parseInt(card.expMonth, 10),
      expYear: parseInt(card.expYear, 10),
      cvv: card.cvv,
    };

    console.log("body", body);

    fetch("http://localhost:3000/payment/validate-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("response", data);
        if (data.valid) {
          setCardStatus("success");
          setCardErrors([]);
        } else {
          setCardStatus("error");
          setCardErrors(
            data.errors ||
              data.messages || [data.message || "Tarjeta inválida"],
          );
        }
      })
      .catch(() => {
        setCardStatus("error");
        setCardErrors(["Error de conexión con el servidor"]);
      });
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🛒 Carrito de Compras</h1>
      <div className="main-layout">
        {/* Sección de Productos - Izquierda */}
        <section className="products-section">
          <h2>Productos</h2>
          <div className="products-grid">
            {products.map((p) => (
              <div className="product-card" key={p.productId}>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="product-card-img"
                />
                <div className="product-card-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">${p.price}</span>
                </div>
                <button className="btn-add" onClick={() => addToCart(p)}>
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Sección del Carrito - Derecha */}

        <section className="cart-section">
          <div className="cart-header">
            <h2>🛒 Mi Carrito</h2>
            {cart.length > 0 && (
              <button className="btn-clear" onClick={clearCart}>
                  🗑️ vaciar
              </button>
            )}
          </div>
          {cart.length === 0 ? (
            <p className="cart-empty">El carrito está vacío</p>
          ) : (
            <div className="cart-items">
              {cart.map((p, i) => (
                <div className="cart-item" key={i}>
                  <img
                    src={p.imageUrl || getProductImage(p.productId)}
                    alt={p.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{p.name}</span>
                    <span className="cart-item-price">
                     
                      {
                      discountedIds.has(String(p.productId)) ? (
                         productsWithDiscount.filter((prod) => String(prod.productId) === String(p.productId)).map((prod, i) => {
        
                          return (
                            <div key={i} className="cart-item-discount">
                              <span class="cart-item-before-discount">{prod.beforeDiscount}</span>
                              <span class="cart-item-discount-percent">-{prod.discountPercent}%</span>
                              <span class="cart-item-after-discount">${prod.afterDiscount}</span>
                            </div>
                          );
                        })
                      ) : (
                        `$${p.price}`
                      )
                    
                    }
                    </span>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(p.productId)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cart-total">
            <span>Total:</span>
            <span className="cart-total-amount">${total}</span>
          </div>

          {/* Sección de Descuento */}
          <div className="discount-section">
            <h3>Aplicar Descuento</h3>
            <div className="discount-form">
              <select
                value={discountProductId}
                onChange={(e) => setDiscountProductId(e.target.value)}
                className="discount-select"
              >
                <option value="">Seleccionar producto...</option>
                {cart
                  .filter((p) => !discountedIds.has(String(p.productId))) //solo se muestran productos que no han sido descontados
                  .map((p, i) => (
                    <option key={i} value={p.productId}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <select
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="discount-input"
              >
                <option value="">% descuento</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="30">30%</option>
                <option value="40">40%</option>
                <option value="50">50%</option>
              </select>
              <button className="btn-discount" onClick={applyDiscount}>
                Aplicar
              </button>
            </div>
          </div>

          <button
            className="btn-pay"
            onClick={() => setShowPayment(!showPayment)}
          >
            {showPayment ? "Cancelar" : "💳 Pagar"}
          </button>

          {showPayment && (
            <div className="payment-section">
              <h3>💳 Datos de Tarjeta</h3>
              <div className="payment-form">
                <div className="payment-row">
                  <input
                    type="text"
                    placeholder="Número de tarjeta"
                    value={card.cardNumber}
                    onChange={(e) =>
                      handleCardChange("cardNumber", e.target.value)
                    }
                    className="payment-input full"
                  />
                </div>
                <div className="payment-row">
                  <input
                    type="text"
                    placeholder="Nombre del titular"
                    value={card.cardHolder}
                    onChange={(e) =>
                      handleCardChange("cardHolder", e.target.value)
                    }
                    className="payment-input full"
                  />
                </div>
                <div className="payment-row triple">
                  <input
                    type="number"
                    placeholder="Mes (MM)"
                    min="1"
                    max="12"
                    value={card.expMonth}
                    onChange={(e) =>
                      handleCardChange("expMonth", e.target.value)
                    }
                    className="payment-input"
                  />
                  <input
                    type="number"
                    placeholder="Año (AAAA)"
                    min="2025"
                    value={card.expYear}
                    onChange={(e) =>
                      handleCardChange("expYear", e.target.value)
                    }
                    className="payment-input"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => handleCardChange("cvv", e.target.value)}
                    className="payment-input"
                  />
                </div>
                <button className="btn-validate-card" onClick={validateCard}>
                  Validar Tarjeta
                </button>

                {cardStatus === "success" && (
                  <div className="card-msg card-success">✅ Tarjeta válida</div>
                )}
                {cardStatus === "error" && (
                  <div className="card-msg card-error">
                    {cardErrors.map((err, i) => (
                      <p key={i}>❌ {err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {
            showSuccessModal && (
              <div className="success-modal">
                <button onClick={() => setShowSuccessModal(false)}>X</button>
                <div className="success-content">
                  <h1>¡Pago exitoso! 🎉</h1>
                  <h2>Gracias Por su compra</h2>
                </div>
              </div>
            )
          }
        </section>
      </div>
    </div>
  );
}

export default App;
