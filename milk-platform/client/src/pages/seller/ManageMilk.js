import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Seller.css';

const ManageMilk = () => {
  const [milkProducts, setMilkProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    milkType: 'Cow',
    customMilkType: '',
    pricePerLiter: '',
    fatPercentage: '',
    qualityDescription: '',
    protein: '',
    calcium: '',
    vitamins: '',
    minerals: '',
    availabilityDays: []
  });
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchMilkProducts();
  }, []);

  const fetchMilkProducts = async () => {
    try {
      const response = await API.get('/milk/seller/my-products');
      setMilkProducts(response.data.data);
    } catch (error) {
      toast.error('Error fetching milk products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDayToggle = (day) => {
    const currentDays = formData.availabilityDays;
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        availabilityDays: currentDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        availabilityDays: [...currentDays, day]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      milkType: formData.milkType,
      customMilkType: formData.milkType === 'Other' ? formData.customMilkType : undefined,
      pricePerLiter: parseFloat(formData.pricePerLiter),
      fatPercentage: parseFloat(formData.fatPercentage),
      qualityDescription: formData.qualityDescription,
      nutrients: {
        protein: parseFloat(formData.protein) || 0,
        calcium: parseFloat(formData.calcium) || 0,
        vitamins: formData.vitamins,
        minerals: formData.minerals
      },
      availabilityDays: formData.availabilityDays
    };

    try {
      if (editingId) {
        const response = await API.put(`/milk/${editingId}`, submitData);
        if (response.data.success) {
          toast.success('Milk product updated successfully');
        }
      } else {
        const response = await API.post('/milk', submitData);
        if (response.data.success) {
          toast.success('Milk product added successfully');
        }
      }

      resetForm();
      fetchMilkProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving milk product');
    }
  };

  const handleEdit = (milk) => {
    setFormData({
      milkType: milk.milkType,
      customMilkType: milk.customMilkType || '',
      pricePerLiter: milk.pricePerLiter,
      fatPercentage: milk.fatPercentage,
      qualityDescription: milk.qualityDescription,
      protein: milk.nutrients?.protein || '',
      calcium: milk.nutrients?.calcium || '',
      vitamins: milk.nutrients?.vitamins || '',
      minerals: milk.nutrients?.minerals || '',
      availabilityDays: milk.availabilityDays || []
    });
    setEditingId(milk._id);
    setShowForm(true);
  };

  const handleDelete = async (milkId) => {
    if (!window.confirm('Are you sure you want to delete this milk product?')) {
      return;
    }

    try {
      const response = await API.delete(`/milk/${milkId}`);
      if (response.data.success) {
        toast.success('Milk product deleted');
        fetchMilkProducts();
      }
    } catch (error) {
      toast.error('Error deleting milk product');
    }
  };

  const resetForm = () => {
    setFormData({
      milkType: 'Cow',
      customMilkType: '',
      pricePerLiter: '',
      fatPercentage: '',
      qualityDescription: '',
      protein: '',
      calcium: '',
      vitamins: '',
      minerals: '',
      availabilityDays: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="manage-milk">
      <div className="container">
        <div className="page-header">
          <h1>Manage Milk Products</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add New Milk'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="milk-form card">
            <h2>{editingId ? 'Edit Milk Product' : 'Add New Milk Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Milk Type *</label>
                <select
                  name="milkType"
                  className="form-select"
                  value={formData.milkType}
                  onChange={handleChange}
                  required
                >
                  <option value="Cow">Cow</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Goat">Goat</option>
                  <option value="Camel">Camel</option>
                  <option value="Sheep">Sheep</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.milkType === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Custom Milk Type Name *</label>
                  <input
                    type="text"
                    name="customMilkType"
                    className="form-control"
                    value={formData.customMilkType}
                    onChange={handleChange}
                    required
                    placeholder="Enter milk type name"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price per Liter (₹) *</label>
                  <input
                    type="number"
                    name="pricePerLiter"
                    className="form-control"
                    value={formData.pricePerLiter}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fat Percentage *</label>
                  <input
                    type="number"
                    name="fatPercentage"
                    className="form-control"
                    value={formData.fatPercentage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quality Description *</label>
                <textarea
                  name="qualityDescription"
                  className="form-control"
                  value={formData.qualityDescription}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the quality of your milk..."
                ></textarea>
              </div>

              <h3 className="section-title">Nutrients (Optional)</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    className="form-control"
                    value={formData.protein}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Calcium (mg)</label>
                  <input
                    type="number"
                    name="calcium"
                    className="form-control"
                    value={formData.calcium}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vitamins</label>
                <input
                  type="text"
                  name="vitamins"
                  className="form-control"
                  value={formData.vitamins}
                  onChange={handleChange}
                  placeholder="e.g., A, D, B12"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Minerals</label>
                <input
                  type="text"
                  name="minerals"
                  className="form-control"
                  value={formData.minerals}
                  onChange={handleChange}
                  placeholder="e.g., Calcium, Phosphorus"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Availability Days</label>
                <div className="days-selector">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`day-btn ${formData.availabilityDays.includes(day) ? 'active' : ''}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="products-grid">
          {milkProducts.length === 0 ? (
            <div className="empty-state card">
              <h3>No milk products yet</h3>
              <p>Add your first milk product to start selling</p>
            </div>
          ) : (
            milkProducts.map(milk => (
              <div key={milk._id} className="product-card card">
                <div className="product-header">
                  <h3>{milk.milkType === 'Other' ? milk.customMilkType : milk.milkType}</h3>
                  <span className="price-badge">₹{milk.pricePerLiter}/L</span>
                </div>

                <div className="product-details">
                  <p><strong>Fat:</strong> {milk.fatPercentage}%</p>
                  <p><strong>Quality:</strong> {milk.qualityDescription}</p>
                  {milk.averageRating > 0 && (
                    <p><strong>Rating:</strong> ⭐ {milk.averageRating.toFixed(1)} ({milk.totalRatings})</p>
                  )}
                  {milk.availabilityDays && milk.availabilityDays.length > 0 && (
                    <div className="availability-days">
                      <strong>Available:</strong>
                      <div className="days-list">
                        {milk.availabilityDays.map((day, i) => (
                          <span key={i} className="day-badge">{day.substring(0, 3)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="product-actions">
                  <button onClick={() => handleEdit(milk)} className="btn btn-sm btn-outline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(milk._id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMilk;