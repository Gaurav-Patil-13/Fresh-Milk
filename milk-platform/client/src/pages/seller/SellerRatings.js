import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Seller.css';

const SellerRatings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  });

  useEffect(() => {
    fetchRatings();
  }, [filter]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      let url = '/ratings/seller/received';
      if (filter !== 'all') {
        url += `?ratingType=${filter}`;
      }
      
      const response = await API.get(url);
      setRatings(response.data.data);
      
      // Calculate statistics
      calculateStats(response.data.data);
    } catch (error) {
      toast.error('Error fetching ratings');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ratingsData) => {
    const sellerRatings = ratingsData
      .filter(r => r.sellerRating)
      .map(r => r.sellerRating);

    if (sellerRatings.length === 0) {
      setStats({
        averageRating: 0,
        totalRatings: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      });
      return;
    }

    const avg = sellerRatings.reduce((a, b) => a + b, 0) / sellerRatings.length;
    
    setStats({
      averageRating: avg,
      totalRatings: sellerRatings.length,
      fiveStars: sellerRatings.filter(r => r === 5).length,
      fourStars: sellerRatings.filter(r => r === 4).length,
      threeStars: sellerRatings.filter(r => r === 3).length,
      twoStars: sellerRatings.filter(r => r === 2).length,
      oneStar: sellerRatings.filter(r => r === 1).length
    });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="seller-ratings">
      <div className="container">
        <div className="page-header">
          <h1>Ratings & Reviews</h1>
          <p className="text-muted">See what customers think about your service</p>
        </div>

        {/* Rating Summary */}
        <div className="rating-summary card">
          <div className="summary-main">
            <div className="average-rating">
              <h2>{stats.averageRating.toFixed(1)}</h2>
              <div className="stars">{renderStars(Math.round(stats.averageRating))}</div>
              <p className="text-muted">{stats.totalRatings} total ratings</p>
            </div>
            
            <div className="rating-breakdown">
              <div className="breakdown-item">
                <span className="stars-label">5 ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${stats.totalRatings ? (stats.fiveStars / stats.totalRatings) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="count">{stats.fiveStars}</span>
              </div>
              
              <div className="breakdown-item">
                <span className="stars-label">4 ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${stats.totalRatings ? (stats.fourStars / stats.totalRatings) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="count">{stats.fourStars}</span>
              </div>
              
              <div className="breakdown-item">
                <span className="stars-label">3 ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${stats.totalRatings ? (stats.threeStars / stats.totalRatings) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="count">{stats.threeStars}</span>
              </div>
              
              <div className="breakdown-item">
                <span className="stars-label">2 ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${stats.totalRatings ? (stats.twoStars / stats.totalRatings) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="count">{stats.twoStars}</span>
              </div>
              
              <div className="breakdown-item">
                <span className="stars-label">1 ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${stats.totalRatings ? (stats.oneStar / stats.totalRatings) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="count">{stats.oneStar}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reviews
          </button>
          <button
            className={`filter-tab ${filter === 'seller' ? 'active' : ''}`}
            onClick={() => setFilter('seller')}
          >
            Seller Ratings
          </button>
          <button
            className={`filter-tab ${filter === 'milk' ? 'active' : ''}`}
            onClick={() => setFilter('milk')}
          >
            Milk Ratings
          </button>
        </div>
        
        {/* Ratings List */}
        {ratings.length === 0 ? (
          <div className="empty-state card">
            <h3>No ratings yet</h3>
            <p>Start delivering great service to receive ratings from customers!</p>
          </div>
        ) : (
          <div className="ratings-list">
            {ratings.map(rating => (
              <div key={rating._id} className="rating-card card">
                <div className="rating-header">
                  <div className="customer-info">
                    <strong>{rating.customer?.name}</strong>
                    <p className="text-muted">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rating-scores">
                    {rating.sellerRating && (
                      <div className="score-item">
                        <span className="label">Seller:</span>
                        <span className="stars">{renderStars(rating.sellerRating)}</span>
                      </div>
                    )}
                    {rating.milkRating && (
                      <div className="score-item">
                        <span className="label">Milk:</span>
                        <span className="stars">{renderStars(rating.milkRating)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(rating.sellerReview || rating.milkReview) && (
                  <div className="rating-reviews">
                    {rating.sellerReview && (
                      <div className="review-section">
                        <strong>Service Review:</strong>
                        <p>{rating.sellerReview}</p>
                      </div>
                    )}
                    {rating.milkReview && (
                      <div className="review-section">
                        <strong>Product Review:</strong>
                        <p className="milk-review">{rating.milkReview}</p>
                      </div>
                    )}
                  </div>
                )}

                {rating.milk && (
                  <div className="rating-product-info">
                    <span className="text-muted">
                      For: {rating.milk.milkType || rating.milk.customMilkType} Milk
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRatings;