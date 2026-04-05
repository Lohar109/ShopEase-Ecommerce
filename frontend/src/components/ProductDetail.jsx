import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setVariants(data.variants || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="product-detail-loading">Loading...</div>;
  if (error || !product) return <div className="product-detail-error">{error || "Product not found"}</div>;

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="product-detail-main">
        <img src={product.main_image} alt={product.name} className="product-detail-image" />
        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <p className="product-detail-brand">Brand: {product.brand}</p>
          <p className="product-detail-desc">{product.description}</p>
          <div className="product-detail-gallery">
            {product.images && product.images.length > 0 && product.images.map((img, i) => (
              <img key={i} src={img} alt={product.name + " gallery " + (i+1)} className="product-detail-gallery-img" />
            ))}
          </div>
          <div className="product-detail-variants">
            <h4>Variants</h4>
            <table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>SKU</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, idx) => (
                  <tr key={idx}>
                    <td>{v.size}</td>
                    <td>{v.color}</td>
                    <td>₹ {v.price}</td>
                    <td>{v.stock}</td>
                    <td>{v.sku}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
