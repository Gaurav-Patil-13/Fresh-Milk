 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const BrowseMilk = () => {
  const [milkTypes, setMilkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMilkTypes();
  }, []);

  const fetchMilkTypes = async () => {
    try {
      const response = await API.get('/milk/types');
      setMilkTypes(response.data.data);
    } catch (error) {
      toast.error('Error fetching milk types');
    } finally {
      setLoading(false);
    }
  };

  const handleMilkTypeClick = (milkType) => {
    navigate(`/customer/sellers/${milkType}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="browse-milk">
      <div className="container">
        <div className="page-header">
          <h1>Browse Milk Types 🥛</h1>
          <p className="text-muted">Select a milk type to view available sellers</p>
        </div>

        {milkTypes.length === 0 ? (
          <div className="empty-state card">
            <h3>No milk types available yet</h3>
            <p>Sellers haven't added any products yet. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {milkTypes.map((item, index) => (
              <div
                key={index}
                className="milk-type-card card card-hover"
                onClick={() => handleMilkTypeClick(item.milkType)}
              >
                <div className="milk-icon">
                  {item.milkType === 'Cow' && '🐄'}
                  {item.milkType === 'Buffalo' && '🐃'}
                  {item.milkType === 'Goat' && '🐐'}
                  {item.milkType === 'Camel' && '🐪'}
                  {item.milkType === 'Sheep' && '🐑'}
                  {!['Cow', 'Buffalo', 'Goat', 'Camel', 'Sheep'].includes(item.milkType) && '🥛'}
                </div>
                <h3>{item.milkType}</h3>
                <p className="seller-count">
                  {item.sellerCount} {item.sellerCount === 1 ? 'seller' : 'sellers'} available
                </p>
                <button className="btn btn-primary btn-sm mt-2">
                  View Sellers →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseMilk;