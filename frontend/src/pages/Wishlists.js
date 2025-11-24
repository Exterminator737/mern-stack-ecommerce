import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Trash2, Package, ArrowRight } from 'lucide-react';

const Wishlists = () => {
  const { wishlists, createWishlist, deleteWishlist, loading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your wishlists.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    const result = await createWishlist(newListName, newListDesc);
    if (result.success) {
      setShowCreateModal(false);
      setNewListName('');
      setNewListDesc('');
      setError('');
    } else {
      setError(result.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wishlist?')) {
      await deleteWishlist(id);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary-600" />
            My Wishlists
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Wishlist
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : wishlists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="flex justify-center">
              <Heart className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No wishlists yet</h3>
            <p className="mt-1 text-gray-500">Create a wishlist to save items for later.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Wishlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((list) => (
              <div key={list._id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        <Link to={`/wishlists/${list._id}`} className="hover:text-primary-600">
                          {list.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                        {list.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(list._id)}
                      className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete wishlist"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Package className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>{list.products?.length || 0} items</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <Link
                    to={`/wishlists/${list._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
                  >
                    View Items <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowCreateModal(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Heart className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Create New Wishlist
                      </h3>
                      <div className="mt-4 space-y-4">
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <div>
                          <label htmlFor="list-name" className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            id="list-name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="e.g., Birthday Wishlist"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="list-desc" className="block text-sm font-medium text-gray-700">Description (optional)</label>
                          <textarea
                            id="list-desc"
                            rows="2"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Brief description..."
                            value={newListDesc}
                            onChange={(e) => setNewListDesc(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCreate}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlists;
