import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const SellersByMilk = () => {
  const { milkType } = useParams();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSellers();
  }, [milkType]);

  const fetchSellers = async () => {
    try {
      const response = await API.get(`/milk/sellers/${milkType}`);
      setSellers(response.data.data);
    } catch (error) {
      toast.error('Error fetching sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (milkId) => {
    navigate(`/customer/place-order/${milkId}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="sellers-by-milk">
      <div className="container">
        <div className="page-header">
          <h1>{milkType} Milk Sellers</h1>
          <p className="text-muted">Choose from our trusted sellers</p>
        </div>

        {sellers.length === 0 ? (
          <div className="empty-state card">
            <h3>No sellers available for {milkType} milk</h3>
            <p>Please check other milk types or try again later.</p>
            <button onClick={() => navigate('/customer/browse-milk')} className="btn btn-primary mt-2">
              Browse Other Types
            </button>
          </div>
        ) : (
          <div className="grid grid-2">
            {sellers.map((milk) => (
              <div key={milk._id} className="seller-card card">
                <div className="seller-header">
                  <div>
                    <h3>{milk.seller?.businessName || milk.seller?.name}</h3>
                    <div className="rating">
                      <span className="stars">⭐ {milk.seller?.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-muted">({milk.seller?.totalRatings || 0} ratings)</span>
                    </div>
                  </div>
                  <div className="price-tag">
                    <span className="price">₹{milk.pricePerLiter}</span>
                    <span className="text-muted">/liter</span>
                  </div>
                </div>

                <div className="milk-details">
                  <div className="detail-item">
                    <strong>Fat Percentage:</strong>
                    <span>{milk.fatPercentage}%</span>
                  </div>

                  <div className="detail-item">
                    <strong>Quality:</strong>
                    <span>{milk.qualityDescription}</span>
                  </div>

                  {milk.nutrients && (
                    <div className="nutrients">
                      <strong>Nutrients:</strong>
                      <div className="nutrient-grid">
                        {milk.nutrients.protein > 0 && (
                          <span className="badge badge-info">Protein: {milk.nutrients.protein}g</span>
                        )}
                        {milk.nutrients.calcium > 0 && (
                          <span className="badge badge-info">Calcium: {milk.nutrients.calcium}mg</span>
                        )}
                      </div>
                      {milk.nutrients.vitamins && (
                        <p className="text-muted mt-1">Vitamins: {milk.nutrients.vitamins}</p>
                      )}
                    </div>
                  )}

                  {milk.availabilityDays && milk.availabilityDays.length > 0 && (
                    <div className="availability">
                      <strong>Available Days:</strong>
                      <div className="days-list">
                        {milk.availabilityDays.map((day, index) => (
                          <span key={index} className="day-badge">{day}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="seller-contact">
                    <span className="text-muted">📞 {milk.seller?.phone}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleOrderClick(milk._id)}
                  className="btn btn-primary btn-block"
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellersByMilk;