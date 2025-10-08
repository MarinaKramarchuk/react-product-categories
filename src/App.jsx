/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const preparedProducts = productsFromServer.map(prod => {
  const category = categoriesFromServer.find(cat => cat.id === prod.categoryId);
  const user = usersFromServer.find(u => u.id === category.ownerId);

  return { ...prod, category, user };
});

const getFilteredProducts = (
  products,
  activeUser,
  text,
  selectedCategories,
) => {
  let filteredProducts = [...products];

  if (activeUser) {
    filteredProducts = filteredProducts.filter(
      product => product.user.name === activeUser,
    );
  }

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return selectedCategories.includes(product.category.title);
    });
  }

  const normalizedSearch = text.trim().toLowerCase();

  if (normalizedSearch) {
    filteredProducts = filteredProducts.filter(item => {
      return item.name.toLowerCase().includes(normalizedSearch);
    });
  }

  return filteredProducts;
};

export const App = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const filteredProducts = getFilteredProducts(
    preparedProducts,
    selectedUser,
    query,
    selectedCategories,
  );

  const handleResetFilters = () => {
    setSelectedUser('');
    setQuery('');
    setSelectedCategories([]);
  };

  const handleCategoryClick = categoryTitle => {
    if (categoryTitle === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => {
        return prev.includes(categoryTitle)
          ? prev.filter(cat => cat !== categoryTitle)
          : [...prev, categoryTitle];
      });
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setSelectedUser('')}
                className={cn({ 'is-active': selectedUser === '' })}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => setSelectedUser(user.name)}
                  className={cn({ 'is-active': selectedUser === user.name })}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value.trimStart())}
                  className="input"
                  placeholder="Search"
                />
                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>
                <span className="icon is-right">
                  {query !== '' && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button mr-6', {
                  'is-success': true,
                  'is-outlined': selectedCategories.length > 0,
                })}
                onClick={() => handleCategoryClick('All')}
              >
                All
              </a>

              {categoriesFromServer.map(cat => (
                <a
                  key={cat.id}
                  data-cy="Category"
                  href="#/"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(cat.title),
                  })}
                  onClick={() => handleCategoryClick(cat.title)}
                >
                  {cat.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleResetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>User</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(product => (
                <tr data-cy="Product" key={product.id}>
                  <td className="has-text-weight-bold" data-cy="ProductId">
                    {product.id}
                  </td>
                  <td data-cy="ProductName">{product.name}</td>
                  <td data-cy="ProductCategory">
                    {`${product.category.icon} - ${product.category.title}`}
                  </td>
                  <td
                    data-cy="ProductUser"
                    className={cn({
                      'has-text-link': product.user.sex === 'm',
                      'has-text-danger': product.user.sex === 'f',
                    })}
                  >
                    {product.user.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
